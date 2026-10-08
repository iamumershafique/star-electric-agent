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

export function normalizeImageKey(type: 'pr' | 'dc' | 'builty', idOrNumber: string): string {
  const clean = (idOrNumber || '').trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${type}_${clean}`;
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
  meta?: { referenceNumber?: string; siteName?: string; fileName?: string }
): Promise<void> {
  if (!identifier || !dataUrl) return;

  const primaryKey = normalizeImageKey(type, identifier);
  inMemoryCache.set(primaryKey, dataUrl);

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

  const primaryKey = normalizeImageKey(type, identifier);
  if (inMemoryCache.has(primaryKey)) {
    return inMemoryCache.get(primaryKey);
  }

  const refKey = normalizeImageKey(type, identifier);
  if (inMemoryCache.has(refKey)) {
    return inMemoryCache.get(refKey);
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(primaryKey);

      req.onsuccess = () => {
        const item = req.result as StoredImageRecord | undefined;
        if (item?.dataUrl) {
          inMemoryCache.set(primaryKey, item.dataUrl);
          resolve(item.dataUrl);
        } else {
          resolve(undefined);
        }
      };

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
