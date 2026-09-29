// Persistent Image Memory Storage using browser IndexedDB and in-memory cache
// Ensures Star Electric Portal maintains full memory of PR images and DC images
// without exceeding browser localStorage 5MB quota.

const DB_NAME = 'StarElectricImageMemory';
const DB_VERSION = 1;
const STORE_NAME = 'document_images';

export interface StoredImageRecord {
  id: string; // e.g. "pr_pr-139", "dc_dc-682", "builty_dc-682"
  type: 'pr' | 'dc' | 'builty';
  referenceNumber: string; // e.g. "PR-139", "DC-682"
  dataUrl: string; // Full base64 or URL
  siteName?: string;
  fileName?: string;
  updatedAt: number;
}

// In-memory fast synchronous cache for instant lookups
const inMemoryCache = new Map<string, string>();
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available in current environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('referenceNumber', 'referenceNumber', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('[ImageStorage] Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

import { normalizeImageKey, scanKeyFromReference, scanTypeFromKey, type ScanType } from './scanKeys';
import { getScanFromCloud, saveScanToCloud } from './firestoreService';
import { compressScanForCloud } from './scanCompression';

export { normalizeImageKey, scanKeyFromReference };

// Uploads already sent this session (key -> fingerprint), so repeated local saves don't re-upload.
const uploadedThisSession = new Map<string, string>();
const fingerprint = (dataUrl: string) => `${dataUrl.length}:${dataUrl.slice(-64)}`;

/** Copies a scan to Firestore (star_scans) so every logged-in browser can open it. */
export async function uploadScanToCloud(
  key: string,
  type: ScanType,
  referenceNumber: string,
  dataUrl: string,
  fileName?: string
): Promise<boolean> {
  if (!dataUrl.startsWith('data:')) return false;
  const print = fingerprint(dataUrl);
  if (uploadedThisSession.get(key) === print) return true;
  const compressed = await compressScanForCloud(dataUrl);
  const saved = await saveScanToCloud(key, { type, referenceNumber, dataUrl: compressed, fileName: fileName || '', updatedAt: Date.now() });
  if (saved) uploadedThisSession.set(key, print);
  return saved;
}

/**
 * Initialize image memory on app load: preloads active image references into in-memory cache
 */
export async function initImageMemory(): Promise<number> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const list = req.result as StoredImageRecord[];
        list.forEach(item => {
          if (item && item.id && item.dataUrl) {
            inMemoryCache.set(item.id, item.dataUrl);
            // Also index by normalized reference number for dual-lookup
            if (item.referenceNumber) {
              const refKey = normalizeImageKey(item.type, item.referenceNumber);
              inMemoryCache.set(refKey, item.dataUrl);
            }
          }
        });
        console.log(`[ImageMemory] Loaded ${list.length} images into instant AI & software memory.`);
        resolve(list.length);
      };

      req.onerror = () => {
        console.warn('[ImageMemory] Error reading stored images:', req.error);
        resolve(0);
      };
    });
  } catch (err) {
    console.warn('[ImageMemory] IndexedDB initialization warning:', err);
    return 0;
  }
}

/**
 * Synchronous memory check: returns image from cache if available immediately
 */
export function getImageFromMemorySync(key: string): string | undefined {
  if (!key) return undefined;
  if (inMemoryCache.has(key)) return inMemoryCache.get(key);

  // Check normalized variations
  const clean = key.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  for (const prefix of ['pr_', 'dc_', 'builty_']) {
    if (inMemoryCache.has(`${prefix}${clean}`)) {
      return inMemoryCache.get(`${prefix}${clean}`);
    }
  }
  return undefined;
}

/**
 * Save an image to IndexedDB memory store and fast memory cache
 */
export async function saveImageToMemory(
  type: 'pr' | 'dc' | 'builty',
  identifier: string,
  dataUrl: string,
  meta?: { referenceNumber?: string; siteName?: string; fileName?: string; skipCloud?: boolean }
): Promise<void> {
  if (!identifier || !dataUrl) return;

  const primaryKey = normalizeImageKey(type, identifier);
  inMemoryCache.set(primaryKey, dataUrl);

  if (!meta?.skipCloud && dataUrl.startsWith('data:')) {
    uploadScanToCloud(primaryKey, type, meta?.referenceNumber || identifier, dataUrl, meta?.fileName)
      .catch(error => console.warn('[ImageMemory] Cloud upload failed for', primaryKey, error));
  }

  const refNum = meta?.referenceNumber || identifier;
  const refKey = normalizeImageKey(type, refNum);
  inMemoryCache.set(refKey, dataUrl);

  try {
    const db = await getDB();
    const record: StoredImageRecord = {
      id: primaryKey,
      type,
      referenceNumber: refNum,
      dataUrl,
      siteName: meta?.siteName,
      fileName: meta?.fileName,
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ImageMemory] Could not persist image to IndexedDB:', err);
  }
}

export async function removeImageFromMemory(
  type: 'pr' | 'dc' | 'builty',
  referenceNumber: string,
  dataUrl: string
): Promise<void> {
  if (!referenceNumber || !dataUrl) return;

  inMemoryCache.forEach((cachedUrl, key) => {
    if (key.startsWith(`${type}_`) && cachedUrl === dataUrl) inMemoryCache.delete(key);
  });

  const db = await getDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      const record = cursor.value as StoredImageRecord;
      if (
        record.type === type &&
        record.referenceNumber === referenceNumber &&
        record.dataUrl === dataUrl
      ) {
        cursor.delete();
      }
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Image removal transaction was aborted.'));
  });
}

/**
 * Retrieve an image by type and identifier (asynchronously checks memory first, then IndexedDB)
 */
export async function getImageFromMemory(
  type: 'pr' | 'dc' | 'builty',
  identifier: string
): Promise<string | undefined> {
  if (!identifier) return undefined;
  return getImageByKey(normalizeImageKey(type, identifier));
}

/**
 * Looks up an already-normalized key (e.g. "dc_dc_685"): memory, then this browser's IndexedDB,
 * then Firestore. A scan fetched from Firestore is cached locally for next time.
 */
export async function getImageByKey(key: string): Promise<string | undefined> {
  if (!key) return undefined;
  if (inMemoryCache.has(key)) return inMemoryCache.get(key);

  const local = await readLocal(key);
  if (local) {
    inMemoryCache.set(key, local);
    return local;
  }

  const cloud = await getScanFromCloud(key);
  if (cloud) {
    const type = scanTypeFromKey(key);
    await saveImageToMemory(type, key.slice(type.length + 1), cloud, { skipCloud: true });
    inMemoryCache.set(key, cloud);
  }
  return cloud;
}

/** Resolves any stored image value: data:/http(s) are returned as-is, indexeddb:/cloud: references are looked up. */
export async function resolveScanReference(reference: string | undefined): Promise<string | undefined> {
  if (!reference) return undefined;
  const key = scanKeyFromReference(reference);
  return key ? getImageByKey(key) : reference;
}

async function readLocal(key: string): Promise<string | undefined> {
  try {
    const db = await getDB();
    return await new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve((req.result as StoredImageRecord | undefined)?.dataUrl || undefined);
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

/**
 * Get all stored image records in memory
 */
export async function getAllStoredImages(): Promise<StoredImageRecord[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve((req.result as StoredImageRecord[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
