import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { getFirestoreDb, isFirestoreConfigured } from './firebase';
import type { PRRecord, DCRecord, DriveVerifiedDCUpdate, DriveVerifiedPRFulfillmentUpdate } from '../types';

const PRS_COLLECTION = 'star_prs';
const DCS_COLLECTION = 'star_dcs';

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
  // Strip heavy base64 to preserve database storage limits
  const { documentImage, ...cleanPR } = pr;

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
  const { documentImage, ...cleanDC } = dc;

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
