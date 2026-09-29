import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  writeBatch,
  type Unsubscribe
} from 'firebase/firestore';
import { getFirestoreDb, isFirestoreConfigured } from './firebase';
import type { PRRecord, DCRecord, DriveVerifiedDCUpdate, DriveVerifiedPRFulfillmentUpdate } from '../types';
import { normalizeImageKey, type ScanType } from './scanKeys';

const PRS_COLLECTION = 'star_prs';
const DCS_COLLECTION = 'star_dcs';
const SCANS_COLLECTION = 'star_scans';

/**
 * Image fields never go into PR/DC documents as base64 (1 MiB document limit).
 * Embedded images become an "indexeddb:<key>" reference; the image itself lives in star_scans/<key>.
 */
function toScanReference(value: unknown, type: ScanType, identifier: string): unknown {
  if (typeof value !== 'string' || !value) return value;
  if (value.startsWith('data:')) return `indexeddb:${normalizeImageKey(type, identifier)}`;
  return value;
}

export function recordDocId(record: { id?: string; prNumber?: string; dcNumber?: string }): string {
  return String(record.id || record.prNumber || record.dcNumber || '').replace(/\//g, '_');
}

export interface CloudScan {
  type: ScanType;
  referenceNumber: string;
  dataUrl: string;
  fileName?: string;
  updatedAt: number;
}

export async function saveScanToCloud(key: string, scan: CloudScan): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return false;
  await setDoc(doc(db, SCANS_COLLECTION, key), scan);
  return true;
}

export async function getScanFromCloud(key: string): Promise<string | undefined> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured() || !key) return undefined;
  try {
    const snapshot = await getDoc(doc(db, SCANS_COLLECTION, key));
    const dataUrl = snapshot.exists() ? snapshot.data().dataUrl : undefined;
    return typeof dataUrl === 'string' && dataUrl.startsWith('data:') ? dataUrl : undefined;
  } catch (error) {
    console.warn('[Firestore] Could not load scan', key, error);
    return undefined;
  }
}

/** Points PR/DC documents at their uploaded scans without rewriting the rest of the record. */
export async function setScanReferencesInCloud(
  updates: { kind: 'pr' | 'dc'; docId: string; field: 'documentImage' | 'builtyImage' | 'prDocumentImage'; reference: string }[]
): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) throw new Error('Firestore is not configured.');
  for (let start = 0; start < updates.length; start += 200) {
    const batch = writeBatch(db);
    updates.slice(start, start + 200).forEach(update => {
      batch.set(
        doc(db, update.kind === 'pr' ? PRS_COLLECTION : DCS_COLLECTION, update.docId),
        { [update.field]: update.reference },
        { merge: true }
      );
    });
    await batch.commit();
  }
}

/**
 * Subscribe to real-time changes in PR collection
 */
export function subscribeToCloudPRs(onUpdate: (prs: PRRecord[]) => void): Unsubscribe | null {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return null;

  try {
    const colRef = collection(db, PRS_COLLECTION);
    return onSnapshot(colRef, (snapshot) => {
      const records: PRRecord[] = [];
      let rejectedCount = 0;
      snapshot.forEach((d) => {
        const record = d.data() as Partial<PRRecord>;
        if (typeof record.prNumber !== 'string' || !record.prNumber.trim()) {
          rejectedCount++;
          return;
        }
        records.push({
          ...record,
          id: typeof record.id === 'string' ? record.id : d.id,
          prNumber: record.prNumber,
          date: typeof record.date === 'string' ? record.date : '',
          siteName: typeof record.siteName === 'string' ? record.siteName : '',
          items: Array.isArray(record.items) ? record.items.map((value, index) => {
            const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
            return {
              ...item,
              id: typeof item.id === 'string' ? item.id : `${d.id}-item-${index + 1}`,
              name: typeof item.name === 'string' ? item.name : '',
              brand: typeof item.brand === 'string' ? item.brand : '',
              unit: typeof item.unit === 'string' ? item.unit : ''
            };
          }) as PRRecord['items'] : [],
          fulfillmentLogs: Array.isArray(record.fulfillmentLogs) ? record.fulfillmentLogs.map((value, index) => {
            const log = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
            return {
              ...log,
              id: typeof log.id === 'string' ? log.id : `${d.id}-log-${index + 1}`,
              dcNumber: typeof log.dcNumber === 'string' ? log.dcNumber : '',
              invoiceNumber: typeof log.invoiceNumber === 'string' ? log.invoiceNumber : '',
              prNumber: typeof log.prNumber === 'string' ? log.prNumber : '',
              itemId: typeof log.itemId === 'string' ? log.itemId : '',
              itemName: typeof log.itemName === 'string' ? log.itemName : '',
              date: typeof log.date === 'string' ? log.date : ''
            };
          }) as PRRecord['fulfillmentLogs'] : [],
          createdTimestamp: Number.isFinite(Number(record.createdTimestamp)) ? Number(record.createdTimestamp) : 0
        } as PRRecord);
      });
      if (rejectedCount > 0) {
        console.warn(`[Firestore] Ignored ${rejectedCount} PR document(s) without a PR number.`);
      }
      // Sort newest first by createdTimestamp
      records.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));
      onUpdate(records);
    }, (error) => {
      console.warn('[Firestore] PR subscription listener error:', error);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to attach PR listener:', err);
    return null;
  }
}

/**
 * Subscribe to real-time changes in DC collection
 */
export function subscribeToCloudDCs(onUpdate: (dcs: DCRecord[]) => void): Unsubscribe | null {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return null;

  try {
    const colRef = collection(db, DCS_COLLECTION);
    return onSnapshot(colRef, (snapshot) => {
      const records: DCRecord[] = [];
      let rejectedCount = 0;
      snapshot.forEach((d) => {
        const record = d.data() as Partial<DCRecord>;
        if (typeof record.dcNumber !== 'string' || !record.dcNumber.trim()) {
          rejectedCount++;
          return;
        }
        records.push({
          ...record,
          id: typeof record.id === 'string' ? record.id : d.id,
          dcNumber: record.dcNumber,
          invoiceNumber: typeof record.invoiceNumber === 'string' ? record.invoiceNumber : '',
          prNumber: typeof record.prNumber === 'string' ? record.prNumber : '',
          prId: typeof record.prId === 'string' ? record.prId : '',
          date: typeof record.date === 'string' ? record.date : '',
          siteName: typeof record.siteName === 'string' ? record.siteName : '',
          itemsShipped: Array.isArray(record.itemsShipped) ? record.itemsShipped.map((value, index) => {
            const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
            return {
              ...item,
              itemId: typeof item.itemId === 'string' ? item.itemId : `${d.id}-item-${index + 1}`,
              itemName: typeof item.itemName === 'string' ? item.itemName : '',
              brand: typeof item.brand === 'string' ? item.brand : '',
              unit: typeof item.unit === 'string' ? item.unit : ''
            };
          }) as DCRecord['itemsShipped'] : [],
          createdTimestamp: Number.isFinite(Number(record.createdTimestamp)) ? Number(record.createdTimestamp) : 0
        } as DCRecord);
      });
      if (rejectedCount > 0) {
        console.warn(`[Firestore] Ignored ${rejectedCount} DC document(s) without a DC number.`);
      }
      records.sort((a, b) => (b.createdTimestamp || 0) - (a.createdTimestamp || 0));
      onUpdate(records);
    }, (error) => {
      console.warn('[Firestore] DC subscription listener error:', error);
    });
  } catch (err) {
    console.warn('[Firestore] Failed to attach DC listener:', err);
    return null;
  }
}

/**
 * Save or update a single PR in Firestore
 */
export async function savePRToCloud(pr: PRRecord): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return;

  const docId = String(pr.id || pr.prNumber).replace(/\//g, '_');
  // Replace heavy base64 with a reference; the scan itself is stored in star_scans
  const cleanPR = { ...pr, documentImage: toScanReference(pr.documentImage, 'pr', pr.prNumber || pr.id) };
  if (cleanPR.documentImage === undefined) delete cleanPR.documentImage;

  const docRef = doc(db, PRS_COLLECTION, docId);
  await setDoc(docRef, cleanPR, { merge: true });
}

/**
 * Save or update a single DC in Firestore
 */
export async function saveDCToCloud(dc: DCRecord): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return;

  const docId = String(dc.id || dc.dcNumber).replace(/\//g, '_');
  const cleanDC = {
    ...dc,
    documentImage: toScanReference(dc.documentImage, 'dc', dc.dcNumber || dc.id),
    builtyImage: toScanReference(dc.builtyImage, 'builty', dc.dcNumber || dc.id),
    prDocumentImage: toScanReference(dc.prDocumentImage, 'pr', dc.prNumber || dc.id)
  };
  (['documentImage', 'builtyImage', 'prDocumentImage'] as const).forEach(field => {
    if (cleanDC[field] === undefined) delete cleanDC[field];
  });

  const docRef = doc(db, DCS_COLLECTION, docId);
  await setDoc(docRef, cleanDC, { merge: true });
}

export async function syncDriveVerifiedDCFieldsToCloud(updates: DriveVerifiedDCUpdate[]): Promise<boolean | null> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return null;

  let allSucceeded = true;
  for (let start = 0; start < updates.length; start += 25) {
    const batch = updates.slice(start, start + 25);
    const results = await Promise.allSettled(batch.map(async update => {
      const { id, dcNumber, ...verifiedFields } = update;
      const docId = String(id || dcNumber).replace(/\//g, '_');
      await setDoc(doc(db, DCS_COLLECTION, docId), verifiedFields, { merge: true });
    }));

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        allSucceeded = false;
        console.error(`[Firestore] Failed to sync Drive-verified data for ${batch[index].dcNumber}:`, result.reason);
      }
    });
  }

  return allSucceeded;
}

export async function syncDriveVerifiedPRFulfillmentToCloud(
  updates: DriveVerifiedPRFulfillmentUpdate[]
): Promise<boolean | null> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return null;

  let allSucceeded = true;
  const results = await Promise.allSettled(updates.map(async update => {
    const { id, ...verifiedFields } = update;
    const docId = String(id || update.prNumber).replace(/\//g, '_');
    await setDoc(doc(db, PRS_COLLECTION, docId), verifiedFields, { merge: true });
  }));

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      allSucceeded = false;
      console.error(`[Firestore] Failed to sync scanned item evidence for ${updates[index].prNumber}:`, result.reason);
    }
  });

  return allSucceeded;
}

/**
 * Delete a PR from Firestore
 */
export async function deletePRFromCloud(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return;

  const docId = String(id).replace(/\//g, '_');
  const docRef = doc(db, PRS_COLLECTION, docId);
  await deleteDoc(docRef);
}

/**
 * Delete a DC from Firestore
 */
export async function deleteDCFromCloud(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirestoreConfigured()) return;

  const docId = String(id).replace(/\//g, '_');
  const docRef = doc(db, DCS_COLLECTION, docId);
  await deleteDoc(docRef);
}
