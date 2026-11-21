// Seed a single fixed synthetic fixture on a loopback demo emulator, never a real project.
import { createConnection } from 'node:net';
import { initializeApp, deleteApp } from 'firebase/app';
import { connectFirestoreEmulator, doc, getFirestore, runTransaction } from 'firebase/firestore';

const project = 'demo-star-electric';
if (process.env.VITE_LINKED_DELIVERY_DEMO !== 'true' || process.env.VITE_FIREBASE_PROJECT_ID !== project) throw new Error('The explicit demo switch and demo-star-electric project are required.');
if (process.env.VITE_DEMO_FIXTURE) throw new Error('Only the normal synthetic fixture can be seeded.');
for (const key of ['GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT', 'GCP_PROJECT', 'FIREBASE_PROJECT_ID']) {
  if (process.env[key] && process.env[key] !== project) throw new Error('Conflicting project configuration.');
}
if (process.env.FIREBASE_CONFIG) {
  let config;
  try { config = JSON.parse(process.env.FIREBASE_CONFIG); } catch { throw new Error('Invalid demo Firebase configuration.'); }
  if (config.projectId !== project) throw new Error('Conflicting project configuration.');
}
const endpoint = process.env.VITE_DEMO_FIRESTORE_ENDPOINT || '';
const match = /^127\.0\.0\.1:([0-9]{1,5})$/.exec(endpoint);
const port = match ? Number(match[1]) : 0;
if (!port || port > 65535 || (process.env.FIRESTORE_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST !== endpoint)) throw new Error('A consistent 127.0.0.1 Firestore emulator endpoint is required.');
await new Promise((resolve, reject) => {
  const socket = createConnection({ host: '127.0.0.1', port });
  socket.setTimeout(2000);
  socket.once('connect', () => { socket.destroy(); resolve(); });
  socket.once('error', () => { socket.destroy(); reject(new Error('The loopback emulator is unavailable.')); });
  socket.once('timeout', () => { socket.destroy(); reject(new Error('The loopback emulator is unavailable.')); });
});
const fixture = {
  id: 'demo-pr-1', prNumber: 'PR-DEMO-1', date: '2026-01-01', siteName: 'Synthetic Site', status: 'Pending', createdTimestamp: 1,
  items: [{ id: 'demo-item-1', name: 'Synthetic Cable', brand: 'Pakistan Cables', unit: 'Meters', requestedQty: 10, fulfilledQty: 0, status: 'Pending' }],
  fulfillmentLogs: [], _sync: { actor: 'demo-seed', op: 'demo-seed', rev: 1 },
};
const app = initializeApp({ projectId: project, apiKey: 'demo-only', appId: 'demo-only' }, 'demo-delivery-seed');
try {
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', port);
  const reference = doc(db, 'star_prs', fixture.id);
  const created = await runTransaction(db, async tx => {
    if ((await tx.get(reference)).exists()) return false;
    tx.set(reference, fixture); return true;
  });
  console.log(created ? 'Synthetic demo fixture created on the loopback emulator.' : 'Synthetic demo fixture already exists; nothing overwritten.');
} finally { await deleteApp(app); }
