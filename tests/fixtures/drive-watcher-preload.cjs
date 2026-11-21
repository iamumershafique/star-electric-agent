// Test subprocess preload: blocks real networking and replaces Firebase/AI modules.
// Never loaded by the watcher unless a test explicitly requests it via NODE_OPTIONS.
const Module = require('node:module');
const oldLoad = Module._load;
const folder = 'syntheticFolder00000000000000001';
const first = 'syntheticFile000000000000000001';
const second = 'syntheticFile000000000000000002';
const meta = (id, name, mimeType = 'image/jpeg') => ({ id, name, mimeType });
const json = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });
const mark = label => process.stderr.write(`${label}\n`);
let ocrCalls = 0;
const firestore = {
  getFirestore: () => ({}), terminate: async () => {}, collection: () => ({}), doc: () => ({}),
  getDocs: async () => ({ forEach: () => {} }),
  setDoc: async () => { mark('MOCK_WRITE'); },
};
Module._load = function (name, parent, isMain) {
  if (name === 'firebase/app') { mark('MOCK_FIREBASE'); return { initializeApp: () => ({}), deleteApp: async () => {} }; }
  if (name === 'firebase/auth') return { getAuth: () => ({}), signInWithEmailAndPassword: async () => ({}) };
  if (name === 'firebase/firestore') return firestore;
  if (name === '@google/genai') {
    mark('MOCK_AI_CLIENT');
    return { GoogleGenAI: class { constructor() { this.models = { generateContent: async () => { mark('MOCK_OCR'); ocrCalls++; return { text: JSON.stringify({ dcNumber: `DC-${20 + ocrCalls}`, items: [{ name: 'Synthetic', brand: 'Synthetic', unit: 'Pieces', quantity: 1 }] }) }; } }; } } };
  }
  return oldLoad.apply(this, arguments);
};
// Fail closed if any code uses Node HTTP, sockets, or DNS instead of the synthetic fetch below.
for (const name of ['node:http', 'node:https']) {
  const mod = require(name); mod.request = mod.get = () => { throw new Error('Network forbidden in watcher test.'); };
}
const net = require('node:net'); net.connect = net.createConnection = net.Socket.prototype.connect = () => { throw new Error('Network forbidden in watcher test.'); };
const dns = require('node:dns'); dns.lookup = () => { throw new Error('Network forbidden in watcher test.'); };

global.fetch = async input => {
  const url = new URL(input);
  if (url.hostname !== 'www.googleapis.com' || !url.pathname.startsWith('/drive/v3/files')) throw new Error('Unexpected synthetic request.');
  if (url.searchParams.get('alt') === 'media') {
    mark(url.pathname.endsWith(`/${folder}`) ? 'MOCK_FOLDER_DOWNLOAD' : 'MOCK_FILE_DOWNLOAD');
    if (process.env.WATCHER_SYNTHETIC_SCENARIO === 'download-404') return { ok: false, status: 404 };
    return { ok: true, status: 200, blob: async () => new Blob(['synthetic'], { type: 'image/jpeg' }) };
  }
  const scenario = process.env.WATCHER_SYNTHETIC_SCENARIO;
  if (url.pathname === '/drive/v3/files') {
    if (scenario === 'not-found') return json({ error: { message: `${folder} synthetic secret link` } }, 404);
    if (scenario === 'empty') return json({ files: [] });
    if (scenario === 'download-404') return json({ files: [meta(first, `hidden-${first}.jpg`)] });
    if (scenario === 'later-failure') return url.searchParams.has('pageToken') ? json({}, 404) : json({ files: [meta(first, `hidden-${first}.jpg`)], nextPageToken: 'page' });
    return url.searchParams.has('pageToken')
      ? json({ files: [meta(second, `hidden-${second}.png`, 'image/png')] })
      : json({ files: [meta(first, `hidden-${first}.jpg`), meta('syntheticChildFolder', 'hidden-folder', 'application/vnd.google-apps.folder')], nextPageToken: 'page' });
  }
  if (scenario === 'direct') return json(meta(first, `hidden-${first}.jpg`));
  if (scenario === 'bare-folder') return json(meta(folder, 'hidden-folder', 'application/vnd.google-apps.folder'));
  return json({}, 404);
};
