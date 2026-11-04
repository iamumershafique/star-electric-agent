/**
 * Star Electric Enterprises — Google Drive AI Auto-Sync Daemon
 * 
 * Monitors Google Drive shared folder for newly scanned or replaced Delivery Challan images.
 * Automatically runs Google Gemini Vision AI to extract items, site name, date, and updates Firestore.
 * 
 * Usage:
 *   node scripts/driveSyncDaemon.cjs
 *   or: npm run drive:watch
 */

const { initializeApp, getApps } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, doc, getDocs, setDoc, query } = require('firebase/firestore');
const { GoogleGenAI } = require('@google/genai');
const https = require('https');
const http = require('http');

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCnwA5_PXEN9D2HlsYUcaXK1cO-g3T08-s',
  authDomain: 'star-agent-jpf.firebaseapp.com',
  projectId: 'star-agent-jpf',
  storageBucket: 'star-agent-jpf.firebasestorage.app',
  messagingSenderId: '531307346524',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:531307346524:web:8a30b51f9222c123af0499'
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuration
const MASTER_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '1nVxz4_rtVUnYed8PEykDaQub61FdQHzL';
const SUBFOLDERS = [
  '1QirE97-gMrqZ5kQT_hZZGmRFB-efREro', // DC Scan 701-800 (Active folder up to DC-740)
  '1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW', // DC Scan 601-700
  '1nVxz4_rtVUnYed8PEykDaQub61FdQHzL'  // Master Drive Folder
];
const POLL_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        ...headers
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

/**
 * Scrapes Google Drive folder page to extract scanned DC files and their direct Drive File IDs.
 */
async function scrapeDriveFolder(folderId) {
  const url = `https://drive.google.com/drive/folders/${folderId}`;
  try {
    const buffer = await fetchUrl(url);
    const html = buffer.toString('utf-8');

    const files = new Map();

    // Pattern 1: aria-label matching
    const ariaRegex = /aria-label="([^"]+\.(?:jpg|jpeg|png|pdf))[^"]*"[^>]*ssk=['"][^:'"]*:[^:'"]*:([a-zA-Z0-9_-]{25,45})/gi;
    let match;
    while ((match = ariaRegex.exec(html)) !== null) {
      const fileName = match[1].trim();
      const fileId = match[2].trim();
      if (!files.has(fileId)) {
        files.set(fileId, { fileId, fileName });
      }
    }

    // Pattern 2: JSON file pairs
    const pairRegex = /"(1[a-zA-Z0-9_-]{28,34})".{1,120}?"([^"/]*DC[ _-]?\d+[^"/]*\.(?:jpg|jpeg|png|pdf))"/gi;
    while ((match = pairRegex.exec(html)) !== null) {
      const fileId = match[1].trim();
      const fileName = match[2].trim();
      if (!files.has(fileId)) {
        files.set(fileId, { fileId, fileName });
      }
    }

    return Array.from(files.values());
  } catch (err) {
    console.error(`[DriveSyncDaemon] Failed to read Drive folder ${folderId}:`, err.message);
    return [];
  }
}

/**
 * Extract DC number from filename
 */
function extractDCNumber(name) {
  const m = name.match(/DC[ _-]?(\d+)/i) || name.match(/(\d+)/);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  return isNaN(num) ? null : `DC-${num}`;
}

/**
 * Analyze Delivery Challan with Gemini Vision
 */
async function analyzeDCWithGemini(base64Image, fileName, apiKey) {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are an expert OCR transcription assistant for Star Electric Enterprises Saddar Rawalpindi.
Transcribe this handwritten Delivery Challan image into strict JSON with the following schema:
{
  "dcNumber": "DC-694",
  "prNumber": "PR-XXX or empty if no PR is written",
  "date": "YYYY-MM-DD",
  "siteName": "Exact name of farm, hatchery, or site",
  "driverName": "Name of driver or transporter",
  "vehicleNumber": "Vehicle registration or phone number",
  "transportType": "Delivered",
  "items": [
    {
      "name": "Item Description",
      "brand": "Pakistan Cables / ABB / Schneider / Venus / etc",
      "quantity": 10,
      "unit": "Coil / Nos / Mtr / Pkt / Box"
    }
  ]
}
Return PURE JSON ONLY. No markdown fences.`;

  const cleanBase64 = base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
        ]
      }
    ]
  });

  const text = response.text || '';
  const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * Main Sync Iteration
 */
async function runSyncIteration() {
  console.log(`\n[${new Date().toLocaleTimeString()}] Checking Google Drive folders for new or updated DC scans...`);
  
  const allScannedFiles = [];
  for (const folderId of SUBFOLDERS) {
    const files = await scrapeDriveFolder(folderId);
    allScannedFiles.push(...files);
  }

  // Deduplicate by file ID
  const uniqueFiles = new Map();
  allScannedFiles.forEach(f => uniqueFiles.set(f.fileId, f));
  console.log(`Found ${uniqueFiles.size} total scanned files in Google Drive.`);

  // Fetch existing DCs from Firestore
  const snapshot = await getDocs(collection(db, 'star_dcs'));
  const existingDCs = new Map();
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.dcNumber) {
      const cleanKey = data.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      existingDCs.set(cleanKey, { id: docSnap.id, ...data });
    }
  });

  const geminiKey = getGeminiApiKey();
  if (!geminiKey) {
    console.warn('[DriveSyncDaemon] GEMINI_API_KEY is not set. Scans will be linked with image previews, but OCR extraction requires an API key.');
  }

  let processedCount = 0;

  for (const [fileId, file] of uniqueFiles.entries()) {
    const dcNumber = extractDCNumber(file.fileName);
    if (!dcNumber) continue;

    const cleanKey = dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const existing = existingDCs.get(cleanKey);

    const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
    const viewLink = `https://drive.google.com/file/d/${fileId}/view`;

    // Detect if this DC is completely new OR if the scan image in Google Drive has changed:
    const isNew = !existing;
    const isImageChanged = existing && existing.driveFileId && existing.driveFileId !== fileId;

    if (!isNew && !isImageChanged) {
      continue; // Up to date
    }

    console.log(`\n==================================================`);
    console.log(`[DriveSyncDaemon] ${isNew ? '✨ NEW DC DETECTED' : '🔄 SCAN IMAGE REPLACED IN DRIVE'}: ${dcNumber} (${file.fileName})`);
    console.log(`Drive File ID: ${fileId}`);

    try {
      // Download high-resolution image
      console.log(`Downloading scan image from Google Drive...`);
      const imgBuffer = await fetchUrl(imageUrl);
      const base64Data = imgBuffer.toString('base64');
      const base64Uri = `data:image/jpeg;base64,${base64Data}`;

      let aiResult = null;
      if (geminiKey) {
        console.log(`Running Google Gemini Vision AI OCR on ${dcNumber}...`);
        aiResult = await analyzeDCWithGemini(base64Uri, file.fileName, geminiKey);
        console.log(`AI Result: Site="${aiResult.siteName}", Date="${aiResult.date}", Items=${aiResult.items?.length || 0}`);
      }

      const docId = existing ? existing.id : `dc-drive-${fileId.substring(0, 10)}`;
      const itemsShipped = aiResult?.items?.length ? aiResult.items.map((it, idx) => ({
        itemId: `item-${fileId.substring(0, 6)}-${idx + 1}`,
        itemName: it.name || 'Electrical Item',
        brand: it.brand || 'Pakistan Cables',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'Nos'
      })) : (existing?.itemsShipped || []);

      const recordToSave = {
        id: docId,
        dcNumber: aiResult?.dcNumber || existing?.dcNumber || dcNumber,
        invoiceNumber: aiResult?.dcNumber || existing?.dcNumber || dcNumber,
        prNumber: aiResult?.prNumber || existing?.prNumber || '',
        prId: existing?.prId || '',
        date: aiResult?.date || existing?.date || new Date().toISOString().split('T')[0],
        siteName: aiResult?.siteName || existing?.siteName || 'Jadeed Poultry Farm',
        itemsShipped,
        documentImage: imageUrl,
        driveFileId: fileId,
        driveViewLink: viewLink,
        transportType: aiResult?.transportType || existing?.transportType || 'Delivered',
        driverName: aiResult?.driverName || existing?.driverName || 'Nawaz',
        vehicleNumber: aiResult?.vehicleNumber || existing?.vehicleNumber || 'STS-1500',
        deliveryStatus: 'Delivered',
        createdTimestamp: existing?.createdTimestamp || Date.now(),
        remarks: isNew 
          ? `Auto-imported from Google Drive (${file.fileName}) via Gemini AI`
          : `Scan image replaced in Drive (${file.fileName}) — re-transcribed with Gemini AI`
      };

      await setDoc(doc(db, 'star_dcs', docId), recordToSave, { merge: true });
      console.log(`✅ Saved ${dcNumber} to Firestore cloud successfully!`);
      processedCount++;

    } catch (err) {
      console.error(`❌ Error processing ${dcNumber}:`, err.message);
    }
  }

  if (processedCount === 0) {
    console.log(`All Google Drive scans are currently synchronized with the portal.`);
  } else {
    console.log(`\n🎉 Synchronized ${processedCount} DC(s) with Firestore!`);
  }
}

// Start continuous loop
async function main() {
  console.log(`=======================================================`);
  console.log(`  STAR ELECTRIC ENTERPRISES — GOOGLE DRIVE AI SYNC     `);
  console.log(`=======================================================`);
  console.log(`Target Drive Folders: ${SUBFOLDERS.join(', ')}`);
  console.log(`Interval: Every ${POLL_INTERVAL_MS / 1000} seconds`);

  // Authenticate with Firebase if credentials are provided in env
  const authEmail = process.env.FIREBASE_AUTH_EMAIL;
  const authPass = process.env.FIREBASE_AUTH_PASSWORD;
  if (authEmail && authPass) {
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, authEmail, authPass);
      console.log(`[DriveSyncDaemon] Authenticated with Firebase Auth as ${authEmail}`);
    } catch (e) {
      console.warn(`[DriveSyncDaemon] Firebase auth warning: ${e.message}`);
    }
  }

  console.log(`Starting watcher...\n`);

  // Run initial check
  await runSyncIteration();

  // Schedule recurring checks
  setInterval(async () => {
    try {
      await runSyncIteration();
    } catch (err) {
      console.error('[DriveSyncDaemon] Iteration error:', err);
    }
  }, POLL_INTERVAL_MS);
}

main().catch(console.error);
