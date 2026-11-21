/**
 * Drive watcher. No Drive, AI, or Firebase client is contacted until an
 * explicitly configured cycle starts. Non-dry writes are not revision-safe
 * and are not approved for production.
 */
const POLL_INTERVAL_MS = 60_000;

function optionsFromArgs(args) {
  const known = new Set(['--dry-run', '--once']);
  if (args.some(arg => !known.has(arg))) throw new Error('Unknown watcher option. Supported options: --dry-run, --once.');
  return { dryRun: args.includes('--dry-run'), once: args.includes('--once') };
}

function watcherConfig(env) {
  return {
    links: (env.DRIVE_INPUT || '').trim(),
    folder: (env.DRIVE_FOLDER_ID || '').trim(),
    driveKey: (env.GOOGLE_DRIVE_API_KEY || env.VITE_GOOGLE_DRIVE_API_KEY || '').trim(),
    geminiKey: (env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '').trim(),
    firebase: {
      projectId: env.VITE_FIREBASE_PROJECT_ID || '',
      apiKey: env.VITE_FIREBASE_API_KEY || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    },
    authEmail: env.FIREBASE_AUTH_EMAIL || '',
    authPassword: env.FIREBASE_AUTH_PASSWORD || '',
  };
}

async function downloadScan(file, key) {
  const params = new URLSearchParams({ alt: 'media', key, supportsAllDrives: 'true' });
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?${params}`);
  if (!response.ok) throw new Error('Download failed.');
  const blob = await response.blob();
  if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(blob.type.toLowerCase())) throw new Error('Unsupported scan content.');
  return { mimeType: blob.type.toLowerCase(), base64: Buffer.from(await blob.arrayBuffer()).toString('base64') };
}

async function analyzeScan(media, apiKey) {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const prompt = 'Transcribe this delivery challan as JSON with dcNumber, prNumber, date, siteName, driverName, vehicleNumber, transportType and items. Each item must include name, brand, quantity and unit. Use empty values for unreadable information. Return JSON only.';
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: media.mimeType, data: media.base64 } }] }],
  });
  const text = (response.text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(text);
}

function validItems(items) {
  return Array.isArray(items) && items.length > 0 && items.every(item =>
    item && typeof item.name === 'string' && item.name.trim() &&
    typeof item.brand === 'string' && item.brand.trim() &&
    typeof item.unit === 'string' && item.unit.trim() &&
    Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
  );
}

async function openFirestore(config) {
  if (!config.geminiKey || !config.firebase.projectId || !config.firebase.apiKey || !config.firebase.appId || !config.authEmail || !config.authPassword) {
    throw new Error('Non-dry watcher requires explicit Drive, AI and Firebase configuration and editor sign-in.');
  }
  const { initializeApp, deleteApp } = require('firebase/app');
  const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
  const firestore = require('firebase/firestore');
  const app = initializeApp(config.firebase);
  try {
    await signInWithEmailAndPassword(getAuth(app), config.authEmail, config.authPassword);
    const db = firestore.getFirestore(app);
    return { ...firestore, db, close: async () => { try { await firestore.terminate(db); } finally { await deleteApp(app); } } };
  } catch (error) {
    await deleteApp(app);
    throw error;
  }
}

async function processScans(files, config, store) {
  const snapshot = await store.getDocs(store.collection(store.db, 'star_dcs'));
  const byNumber = new Map();
  const byFile = new Map();
  snapshot.forEach(doc => {
    const record = { ...doc.data(), id: doc.id };
    if (record.dcNumber) byNumber.set(record.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(), record);
    if (record.driveFileId) byFile.set(record.driveFileId, record);
  });
  let added = 0, updated = 0, unchanged = 0, failed = 0;
  for (const file of files) {
    try {
      const key = file.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const existing = byFile.get(file.id) || (key && byNumber.get(key));
      if (existing && existing.driveFileId === file.id) { unchanged++; continue; }
      const media = await downloadScan(file, config.driveKey);
      const data = await analyzeScan(media, config.geminiKey);
      const number = typeof data.dcNumber === 'string' && data.dcNumber.trim() ? data.dcNumber.trim() : file.dcNumber;
      if (!number || !validItems(data.items)) throw new Error('Scan needs manual review.');
      const finalKey = number.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!existing && byNumber.has(finalKey)) throw new Error('Scan needs manual review.');
      const id = existing?.id || `dc-drive-${file.id.substring(0, 12)}`;
      const record = {
        ...(existing || {}), id, dcNumber: number,
        invoiceNumber: existing?.invoiceNumber || number,
        prNumber: data.prNumber || existing?.prNumber || '',
        prId: existing?.prId || '', date: data.date || existing?.date || '',
        siteName: data.siteName || existing?.siteName || '',
        itemsShipped: data.items.map((item, index) => ({ itemId: `item-${index + 1}`, itemName: item.name.trim(), brand: item.brand.trim(), quantity: Number(item.quantity), unit: item.unit.trim() })),
        documentImage: file.mimeType === 'application/pdf' ? file.viewLink : file.imageUrl,
        driveFileId: file.id, driveViewLink: file.viewLink,
        createdTimestamp: existing?.createdTimestamp || Date.now(),
        transportType: data.transportType || existing?.transportType || '',
        driverName: data.driverName || existing?.driverName || '',
        vehicleNumber: data.vehicleNumber || existing?.vehicleNumber || '',
      };
      await store.setDoc(store.doc(store.db, 'star_dcs', id), record, { merge: true });
      byNumber.set(finalKey, record); byFile.set(file.id, record);
      if (existing) updated++; else added++;
    } catch {
      failed++;
      console.error('A scan failed to download, analyze, validate, or save; review required.');
    }
  }
  console.log(`Sync results: ${files.length} attempted, ${failed} failed, ${added} added, ${updated} updated, ${unchanged} unchanged.`);
  return failed === 0;
}

async function main() {
  const options = optionsFromArgs(process.argv.slice(2));
  const config = watcherConfig(process.env);
  const { resolveDriveScanInputs, DriveInputError } = await import('../src/lib/driveScanResolver.mjs');
  let store;
  try {
    do {
      let candidates;
      try {
        candidates = await resolveDriveScanInputs(config.links, config.folder, config.driveKey);
      } catch (error) {
        const detail = error instanceof DriveInputError ? `${error.message}${error.status ? ` (HTTP ${error.status})` : ''}` : 'Drive discovery failed.';
        console.error(`Sync failed — ${detail}`);
        return 1;
      }
      console.log(`${options.dryRun ? 'Dry run' : 'Discovery'}: ${candidates.length} scan candidate(s).`);
      // Only ordinal and supported MIME type are logged; no filenames, IDs or links.
      candidates.forEach((file, index) => console.log(`Candidate ${index + 1}: ${file.mimeType}.`));
      if (options.dryRun) {
        console.log('Dry run totals: 0 downloaded, 0 OCR, 0 written.');
      } else if (candidates.length) {
        if (!store) store = await openFirestore(config);
        if (!await processScans(candidates, config, store)) return 1;
      }
      if (options.once) return 0;
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    } while (true);
  } finally {
    if (store) await store.close();
  }
}

main().then(code => { process.exitCode = code; }).catch(() => {
  console.error('Watcher failed. Check its configuration and permissions.');
  process.exitCode = 1;
});
