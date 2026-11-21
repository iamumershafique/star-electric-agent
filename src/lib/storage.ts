import { planDeliveries } from './deliveryRules';
import type { PRRecord, DCRecord, FulfillmentLog, LineItem, BrandCategory, GeminiBuiltyExtractionResult } from '../types';
import { computeItemStatus, computePRStatus, cleanApiKey, normalizePRNumber, hasPRNumber, normalizeSiteName } from './utils';
import { JADEED_FARM_SITES } from '../data/jadeedHistoryData';
import { 
  saveImageToMemory, 
  getImageFromMemorySync, 
  normalizeImageKey
} from './imageStorage';

const STORAGE_KEY_PRS = 'STAR_ELECTRIC_PRS_V2';
const STORAGE_KEY_DCS = 'STAR_ELECTRIC_DCS_V2';
const STORAGE_KEY_API_KEY = 'STAR_ELECTRIC_GEMINI_KEY';
const STORAGE_KEY_OPENAI_API_KEY = 'STAR_ELECTRIC_OPENAI_KEY';
const STORAGE_KEY_CLAUDE_API_KEY = 'STAR_ELECTRIC_CLAUDE_KEY';
const STORAGE_KEY_AGENTROUTER_API_KEY = 'STAR_ELECTRIC_AGENTROUTER_KEY';
const STORAGE_KEY_AGENTROUTER_MODEL = 'STAR_ELECTRIC_AGENTROUTER_MODEL';
const STORAGE_KEY_OLLAMA_ENDPOINT = 'STAR_ELECTRIC_OLLAMA_ENDPOINT';
const STORAGE_KEY_OLLAMA_MODEL = 'STAR_ELECTRIC_OLLAMA_MODEL';
const STORAGE_KEY_PREFERRED_OCR_PROVIDER = 'STAR_ELECTRIC_PREFERRED_OCR_PROVIDER';
const dcSequenceNumber = (dcNumber: string): number | undefined => {
  const match = dcNumber.replace(/[^a-zA-Z0-9]/g, '').match(/^dc0*(\d+)$/i);
  return match ? Number(match[1]) : undefined;
};

const seedImportsEnabled = import.meta.env.DEV;
const normalizePRReference = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export function getLinkedDCNumbersForPR(pr: PRRecord, dcs: DCRecord[]): string[] {
  const linkedNumbers = new Map<string, string>();
  const addDCNumber = (value: string) => {
    const dcNumber = value.trim();
    if (!dcNumber) return;
    const sequenceNumber = dcSequenceNumber(dcNumber);
    const key = sequenceNumber === undefined
      ? normalizePRReference(dcNumber)
      : `DC${sequenceNumber}`;
    if (!linkedNumbers.has(key)) linkedNumbers.set(key, dcNumber);
  };

  (pr.fulfillmentLogs || []).forEach(log => addDCNumber(log.dcNumber));
  const normalizedPRNumber = normalizePRReference(pr.prNumber);

  dcs.forEach(dc => {
    const hasDirectPRReference =
      dc.prId === pr.id ||
      (normalizedPRNumber && normalizePRReference(dc.prNumber) === normalizedPRNumber);
    if (hasDirectPRReference && dc.dcNumber.trim()) {
      addDCNumber(dc.dcNumber);
    }
  });

  return Array.from(linkedNumbers.values());
}

export const INITIAL_SITES: any[] = (seedImportsEnabled ? JADEED_FARM_SITES : []).map((name, idx) => ({
  id: `site-init-${idx + 1}`,
  name,
  region: name.includes('-') ? name.split('-')[1].trim() : name,
  code: `S-${String(idx + 1).padStart(2, '0')}`
}));

export const INITIAL_PRS: PRRecord[] = [];
// Historical imports must be reviewed explicitly, never injected on startup.
export const INITIAL_DCS: DCRecord[] = [];

export function normalizeStoredPR(value: unknown, index: number): PRRecord {
  const raw = value && typeof value === 'object' ? value as Partial<PRRecord> : {};
  const items = Array.isArray(raw.items) ? raw.items : [];
  const fulfillmentLogs = Array.isArray(raw.fulfillmentLogs) ? raw.fulfillmentLogs : [];
  return {
    ...raw,
    id: typeof raw.id === 'string' && raw.id ? raw.id : `recovered-pr-${index + 1}`,
    prNumber: typeof raw.prNumber === 'string' ? raw.prNumber : '',
    date: typeof raw.date === 'string' ? raw.date : '',
    siteName: typeof raw.siteName === 'string' ? raw.siteName : '',
    status: raw.status || 'Pending',
    items: items.map((value, itemIndex) => {
      const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
      return {
        ...item,
        id: typeof item.id === 'string' ? item.id : `recovered-pr-${index + 1}-item-${itemIndex + 1}`,
        name: typeof item.name === 'string' ? item.name : '',
        brand: typeof item.brand === 'string' ? item.brand : '',
        unit: typeof item.unit === 'string' ? item.unit : '',
        requestedQty: Number.isFinite(Number(item.requestedQty)) ? Number(item.requestedQty) : 0,
        fulfilledQty: Number.isFinite(Number(item.fulfilledQty)) ? Number(item.fulfilledQty) : 0,
        status: item.status || 'Pending'
      };
    }) as PRRecord['items'],
    fulfillmentLogs: fulfillmentLogs.map((value, logIndex) => {
      const log = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
      return {
        ...log,
        id: typeof log.id === 'string' ? log.id : `recovered-pr-${index + 1}-log-${logIndex + 1}`,
        dcNumber: typeof log.dcNumber === 'string' ? log.dcNumber : '',
        invoiceNumber: typeof log.invoiceNumber === 'string' ? log.invoiceNumber : '',
        prNumber: typeof log.prNumber === 'string' ? log.prNumber : '',
        itemId: typeof log.itemId === 'string' ? log.itemId : '',
        itemName: typeof log.itemName === 'string' ? log.itemName : '',
        date: typeof log.date === 'string' ? log.date : '',
        quantityShipped: Number.isFinite(Number(log.quantityShipped)) ? Number(log.quantityShipped) : 0
      };
    }),
    createdTimestamp: Number.isFinite(Number(raw.createdTimestamp)) ? Number(raw.createdTimestamp) : 0
  } as PRRecord;
}

export function normalizeStoredDC(value: unknown, index: number): DCRecord {
  const raw = value && typeof value === 'object' ? value as Partial<DCRecord> : {};
  const itemsShipped = Array.isArray(raw.itemsShipped) ? raw.itemsShipped : [];
  return {
    ...raw,
    id: typeof raw.id === 'string' && raw.id ? raw.id : `recovered-dc-${index + 1}`,
    dcNumber: typeof raw.dcNumber === 'string' ? raw.dcNumber : '',
    invoiceNumber: typeof raw.invoiceNumber === 'string' ? raw.invoiceNumber : '',
    prNumber: typeof raw.prNumber === 'string' ? raw.prNumber : '',
    prId: typeof raw.prId === 'string' ? raw.prId : '',
    date: typeof raw.date === 'string' ? raw.date : '',
    siteName: typeof raw.siteName === 'string' ? raw.siteName : '',
    itemsShipped: itemsShipped.map((value, itemIndex) => {
      const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
      return {
        ...item,
        itemId: typeof item.itemId === 'string' ? item.itemId : `recovered-dc-${index + 1}-item-${itemIndex + 1}`,
        itemName: typeof item.itemName === 'string' ? item.itemName : '',
        brand: typeof item.brand === 'string' ? item.brand : '',
        unit: typeof item.unit === 'string' ? item.unit : '',
        quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0
      };
    }),
    createdTimestamp: Number.isFinite(Number(raw.createdTimestamp)) ? Number(raw.createdTimestamp) : 0
  } as DCRecord;
}

export function getPRs(): PRRecord[] {
  const data = localStorage.getItem(STORAGE_KEY_PRS);
  if (data === null) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(data); } catch { throw new Error('The local PR cache is damaged. Do not clear it; contact the administrator to recover it.'); }
  if (!Array.isArray(parsed)) throw new Error('The local PR cache is invalid. Do not clear it; contact the administrator to recover it.');
  return parsed.map(normalizeStoredPR).map(pr => {
    const image = pr.documentImage;
    return image?.startsWith('indexeddb:')
      ? { ...pr, documentImage: getImageFromMemorySync(image.slice('indexeddb:'.length)) || image }
      : pr;
  });
}

export function saveAllPRs(prs: PRRecord[], options: { uploadImages?: boolean } = {}): boolean {
  // Save heavy base64 document images into persistent IndexedDB store
  // and keep lightweight indexeddb references in localStorage to protect quota limit
  const sanitized = prs.map(p => {
    if (p.documentImage && p.documentImage.startsWith('data:')) {
      saveImageToMemory('pr', p.prNumber || p.id, p.documentImage, {
        referenceNumber: p.prNumber,
        siteName: p.siteName,
        uploadToCloud: options.uploadImages
      });
      const refKey = normalizeImageKey('pr', p.prNumber || p.id);
      return { ...p, documentImage: `indexeddb:${refKey}` };
    }
    return p;
  });

  try {
    localStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.error('Local PR save failed; existing cache was preserved.', error);
    if (typeof window !== 'undefined') queueMicrotask(() => window.dispatchEvent(new Event('star-ledger-local-save-failed')));
    return false;
  }
}

export function getDCs(): DCRecord[] {
  const data = localStorage.getItem(STORAGE_KEY_DCS);
  if (data === null) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(data); } catch { throw new Error('The local DC cache is damaged. Do not clear it; contact the administrator to recover it.'); }
  if (!Array.isArray(parsed)) throw new Error('The local DC cache is invalid. Do not clear it; contact the administrator to recover it.');
  return parsed.map(normalizeStoredDC).map(dc => {
    const hydrate = (image: string | undefined) => image?.startsWith('indexeddb:')
      ? getImageFromMemorySync(image.slice('indexeddb:'.length)) || image
      : image;
    return { ...dc, documentImage: hydrate(dc.documentImage), builtyImage: hydrate(dc.builtyImage), prDocumentImage: hydrate(dc.prDocumentImage) };
  });
}

export function markAllDCsDelivered(): {
  updatedDCs: DCRecord[];
  updatedCount: number;
  deliveredCount: number;
  dispatchedCount: number;
  skippedCount: number;
} {
  const currentDCs = getDCs();
  let deliveredCount = 0;
  let dispatchedCount = 0;
  let skippedCount = 0;
  const updated = currentDCs.map(dc => {
    if (dc.dcNumber.toLowerCase().includes('missing')) {
      skippedCount++;
      return dc;
    }

    deliveredCount++;
    const remarks = dc.remarks?.includes('Builty Pending')
      ? 'Delivered to Site (Completed)'
      : dc.remarks || 'Delivered to Site (Completed)';

    return {
      ...dc,
      deliveryStatus: 'Delivered' as const,
      remarks
    };
  });
  saveAllDCs(updated);
  return {
    updatedDCs: updated,
    updatedCount: deliveredCount + dispatchedCount,
    deliveredCount,
    dispatchedCount,
    skippedCount
  };
}

/**
 * Check if a Delivery Challan is missing an associated Purchase Requisition (PR)
 */
export function isDCPRMissing(dc: DCRecord, allPRs: PRRecord[]): boolean {
  if (dc.noPrRequired || dc.prNumber === 'NO PR REQUIRED' || dc.prNumber === 'Delivered (No PR Required)') {
    return false;
  }
  if (dc.dcNumber.toLowerCase().includes('missing')) {
    return false;
  }
  if (!dc.prNumber || dc.prNumber.trim() === '' || dc.prNumber === 'NO PR' || dc.prNumber.toLowerCase() === 'missing') {
    return true;
  }
  if (/^PR-JAD-\d{4}$/i.test(dc.prNumber)) {
    const realPR = allPRs.find(p => p.id === dc.prId || p.prNumber.trim().toLowerCase() === dc.prNumber.trim().toLowerCase());
    if (!realPR || (realPR.items.length === 1 && realPR.items[0].name.includes('Electrical Supplies & Consumables'))) {
      return true;
    }
  }
  const hasRealPR = allPRs.some(p => 
    p.id === dc.prId || 
    p.prNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === dc.prNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  );
  return !hasRealPR;
}

/**
 * Auto-links DCs to PRs when references or specific item details support the match.
 */
export function autoLinkPRsAndDCsInStorage(): {
  linkedCount: number;
  updatedPRs: PRRecord[];
  updatedDCs: DCRecord[];
} {
  let prs = getPRs();
  let dcs = getDCs();
  let linkedCount = 0;

  const prByNumber = new Map<string, PRRecord>();
  const prById = new Map<string, PRRecord>();

  prs.forEach(p => {
    const normalizedNum = normalizePRNumber(p.prNumber);

    prById.set(p.id, p);
    if (normalizedNum) prByNumber.set(normalizedNum, p);
  });

  const updatedDCs = dcs.map(dc => {
    if (!hasPRNumber(dc.prNumber) || dc.noPrRequired) {
      return dc;
    }

    let matchedPR: PRRecord | undefined;

    // A. Check dc.prId
    if (dc.prId && prById.has(dc.prId)) {
      matchedPR = prById.get(dc.prId);
    }

    // B. Check the normalized PR number
    if (!matchedPR && dc.prNumber) {
      const normalizedDCPr = normalizePRNumber(dc.prNumber);
      if (normalizedDCPr) {
        matchedPR = prByNumber.get(normalizedDCPr);
      }
    }

    // C. Check PR fulfillment logs as fallback
    if (!matchedPR) {
      matchedPR = prs.find(p => 
        (p.fulfillmentLogs || []).some(log => 
          normalizePRNumber(log.dcNumber) === normalizePRNumber(dc.dcNumber)
        )
      );
    }

    if (matchedPR) {
      linkedCount++;
      return {
        ...dc,
        prId: matchedPR.id,
        prNumber: matchedPR.prNumber,
        siteName: normalizeSiteName(dc.siteName) === normalizeSiteName(matchedPR.siteName) 
          ? dc.siteName 
          : (dc.siteName === 'Jadeed Group Site' ? matchedPR.siteName : dc.siteName),
        deliveryStatus: dc.deliveryStatus || 'Delivered'
      };
    }

    return dc;
  });

  saveAllDCs(updatedDCs);

  return { linkedCount, updatedPRs: prs, updatedDCs };
}

/**
 * Manually link a Delivery Challan to a user-entered PR number
 */
export function linkDCToManualPRInStorage(
  dcId: string, 
  prNumber: string, 
  notes?: string
): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[]; error?: string } {
  const dcs = getDCs();
  const prs = getPRs();

  const dcIndex = dcs.findIndex(d => d.id === dcId);
  if (dcIndex === -1) return { updatedPRs: prs, updatedDCs: dcs };

  const targetDC = dcs[dcIndex];
  const cleanEnteredPR = prNumber.trim();
  const normalizedEntered = normalizePRReference(cleanEnteredPR);
  const targetPR = prs.find(p => normalizePRReference(p.prNumber) === normalizedEntered);
  if (!targetPR) {
    return {
      updatedPRs: prs,
      updatedDCs: dcs,
      error: `PR ${cleanEnteredPR} is not in the requisition register. A DC cannot create a PR; add the actual PR document first.`
    };
  }

  const updatedDC: DCRecord = {
    ...targetDC,
    prId: targetPR.id,
    prNumber: targetPR.prNumber,
    noPrRequired: false,
    remarks: (targetDC.remarks && !targetDC.remarks.includes(targetPR.prNumber)) 
      ? `${targetDC.remarks} | Linked to ${targetPR.prNumber}${notes ? ` (${notes})` : ''}`
      : targetDC.remarks
  };

  const updatedDCs = [...dcs];
  updatedDCs[dcIndex] = updatedDC;

  saveAllDCs(updatedDCs);

  return { updatedPRs: prs, updatedDCs };
}

/**
 * Marks a Delivery Challan as "Delivered - No PR Required"
 */
export function markDCNoPRRequiredInStorage(dcId: string): { updatedDCs: DCRecord[] } {
  const dcs = getDCs();
  const dcIndex = dcs.findIndex(d => d.id === dcId);
  if (dcIndex === -1) return { updatedDCs: dcs };

  const targetDC = dcs[dcIndex];
  let remarks = targetDC.remarks || 'Delivered to Site';
  if (!remarks.includes('No PR Required')) {
    remarks = remarks + ' • Delivered (No PR Required)';
  }

  const updatedDC: DCRecord = {
    ...targetDC,
    prNumber: 'NO PR REQUIRED',
    noPrRequired: true,
    deliveryStatus: 'Delivered',
    remarks
  };

  const updatedDCs = [...dcs];
  updatedDCs[dcIndex] = updatedDC;
  saveAllDCs(updatedDCs);

  return { updatedDCs };
}

/**
 * Batch marks all currently missing PR Delivery Challans as "No PR Required"
 */
export function markAllMissingPRsNoRequiredInStorage(): { updatedDCs: DCRecord[]; count: number } {
  const dcs = getDCs();
  const prs = getPRs();
  let count = 0;

  const updatedDCs = dcs.map(dc => {
    if (isDCPRMissing(dc, prs)) {
      count++;
      let remarks = dc.remarks || 'Delivered to Site';
      if (!remarks.includes('No PR Required')) {
        remarks = remarks + ' • Delivered (No PR Required)';
      }
      return {
        ...dc,
        prNumber: 'NO PR REQUIRED',
        noPrRequired: true,
        deliveryStatus: 'Delivered' as const,
        remarks
      };
    }
    return dc;
  });

  saveAllDCs(updatedDCs);
  return { updatedDCs, count };
}

/**
 * Attaches a PR image / scan directly to a Delivery Challan
 */
export function attachPRImageToDCInStorage(
  dcId: string, 
  base64Image: string, 
  prNumber?: string
): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[] } {
  const dcs = getDCs();
  let prs = getPRs();

  const dcIndex = dcs.findIndex(d => d.id === dcId);
  if (dcIndex === -1) return { updatedPRs: prs, updatedDCs: dcs };

  const targetDC = dcs[dcIndex];
  const assignedPrNum = prNumber?.trim() || `PR-${targetDC.dcNumber.replace(/^DC-?/i, '')}`;

  let matchedPRIndex = prs.findIndex(p => 
    p.prNumber.trim().toLowerCase() === assignedPrNum.toLowerCase()
  );

  let targetPR: PRRecord;

  if (matchedPRIndex >= 0) {
    targetPR = { 
      ...prs[matchedPRIndex],
      documentImage: base64Image
    };
  } else {
    const newPrId = `pr-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const lineItems: LineItem[] = (targetDC.itemsShipped && targetDC.itemsShipped.length > 0)
      ? targetDC.itemsShipped.map((it, idx) => ({
          id: `item-img-${idx}-${Date.now()}`,
          name: it.itemName,
          brand: (it.brand as BrandCategory) || 'General Electrical',
          requestedQty: it.quantity,
          fulfilledQty: it.quantity,
          unit: it.unit || 'Numbers',
          status: 'Completed',
          specifications: ''
        }))
      : [
          {
            id: `item-img-1-${Date.now()}`,
            name: `Delivered Material (${targetDC.siteName})`,
            brand: 'General Electrical',
            requestedQty: 1,
            fulfilledQty: 1,
            unit: 'Lot',
            status: 'Completed',
            specifications: ''
          }
        ];

    targetPR = {
      id: newPrId,
      prNumber: assignedPrNum,
      date: targetDC.date,
      siteName: targetDC.siteName,
      status: 'Fulfilled',
      createdTimestamp: Date.now(),
      contactPerson: 'Scanned CamScanner PR Document',
      notes: `Image attached for Delivery Challan ${targetDC.dcNumber}`,
      documentImage: base64Image,
      items: lineItems,
      fulfillmentLogs: []
    };

    prs = [targetPR, ...prs];
    matchedPRIndex = 0;
  }

  const updatedDC: DCRecord = {
    ...targetDC,
    prId: targetPR.id,
    prNumber: targetPR.prNumber,
    prDocumentImage: base64Image,
    noPrRequired: false,
    deliveryStatus: 'Delivered',
    remarks: (targetDC.remarks || 'Delivered to Site') + ` • Attached PR Image (${assignedPrNum})`
  };

  const updatedDCs = [...dcs];
  updatedDCs[dcIndex] = updatedDC;

  saveAllDCs(updatedDCs);
  saveAllPRs(prs);

  return { updatedPRs: prs, updatedDCs };
}

export function saveAllDCs(dcs: DCRecord[], options: { uploadImages?: boolean } = {}): boolean {
  // Save heavy base64 images into persistent IndexedDB store
  // and keep lightweight indexeddb references in localStorage to protect quota limit
  const sanitized = dcs.map(d => {
    let copy = { ...d };
    if (copy.documentImage && copy.documentImage.startsWith('data:')) {
      saveImageToMemory('dc', copy.dcNumber || copy.id, copy.documentImage, {
        referenceNumber: copy.dcNumber,
        siteName: copy.siteName,
        uploadToCloud: options.uploadImages
      });
      copy.documentImage = `indexeddb:${normalizeImageKey('dc', copy.dcNumber || copy.id)}`;
    }
    if (copy.builtyImage && copy.builtyImage.startsWith('data:')) {
      saveImageToMemory('builty', copy.dcNumber || copy.biltyNumber || copy.id, copy.builtyImage, {
        referenceNumber: copy.biltyNumber || copy.dcNumber,
        siteName: copy.siteName,
        uploadToCloud: options.uploadImages
      });
      copy.builtyImage = `indexeddb:${normalizeImageKey('builty', copy.dcNumber || copy.id)}`;
    }
    if (copy.prDocumentImage && copy.prDocumentImage.startsWith('data:')) {
      saveImageToMemory('pr', copy.prNumber || copy.prId || copy.id, copy.prDocumentImage, {
        referenceNumber: copy.prNumber,
        siteName: copy.siteName,
        uploadToCloud: options.uploadImages
      });
      copy.prDocumentImage = `indexeddb:${normalizeImageKey('pr', copy.prNumber || copy.id)}`;
    }
    return copy;
  });

  try {
    localStorage.setItem(STORAGE_KEY_DCS, JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.error('Local DC save failed; existing cache was preserved.', error);
    if (typeof window !== 'undefined') queueMicrotask(() => window.dispatchEvent(new Event('star-ledger-local-save-failed')));
    return false;
  }
}

export function checkDuplicatePR(prNumber: string, idToIgnore?: string): { isDuplicate: boolean; existingPR?: PRRecord } {
  const prs = getPRs();
  const normalizedSearch = normalizePRNumber(prNumber);
  
  if (!normalizedSearch) {
    return { isDuplicate: false };
  }
  
  const match = prs.find(pr => 
    pr.id !== idToIgnore && 
    normalizePRNumber(pr.prNumber) === normalizedSearch
  );

  return {
    isDuplicate: !!match,
    existingPR: match
  };
}

export function savePR(pr: PRRecord): PRRecord[] {
  const prs = getPRs();
  const updatedItems = pr.items.map(item => ({
    ...item,
    status: item.status === 'Cancelled' ? 'Cancelled' : computeItemStatus(item.requestedQty, item.fulfilledQty)
  }));
  
  if (pr.documentImage) {
    saveImageToMemory('pr', pr.prNumber || pr.id, pr.documentImage, {
      referenceNumber: pr.prNumber,
      siteName: pr.siteName
    });
  }

  const updatedPR: PRRecord = {
    ...pr,
    items: updatedItems,
    status: computePRStatus(updatedItems)
  };

  const existingIndex = prs.findIndex(p => p.id === pr.id);
  let updatedList: PRRecord[];

  if (existingIndex >= 0) {
    updatedList = [...prs];
    updatedList[existingIndex] = updatedPR;
  } else {
    updatedList = [updatedPR, ...prs];
  }

  // Keep the draft in memory if local persistence fails; do not re-read an older cache.
  saveAllPRs(updatedList);
  return updatedList;
}

export function saveMultiplePRsInStorage(records: PRRecord[]): PRRecord[] {
  let prs = getPRs();

  for (const newPR of records) {
    const updatedItems = newPR.items.map(item => ({
      ...item,
      status: computeItemStatus(item.requestedQty, item.fulfilledQty)
    }));

    const docImg = newPR.documentImage;
    if (docImg) {
      saveImageToMemory('pr', newPR.prNumber || newPR.id, docImg, {
        referenceNumber: newPR.prNumber,
        siteName: newPR.siteName
      });
    }

    const formattedPR: PRRecord = {
      ...newPR,
      items: updatedItems,
      status: computePRStatus(updatedItems),
      documentImage: docImg
    };

    const existingIndex = prs.findIndex(
      p => p.id === newPR.id ||
      (p.prNumber && newPR.prNumber &&
       p.prNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === newPR.prNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    );

    if (existingIndex >= 0) {
      const existing = prs[existingIndex];
      const mergedItems = [...existing.items];
      for (const item of updatedItems) {
        const itemIdx = mergedItems.findIndex(mi => mi.name.trim().toLowerCase() === item.name.trim().toLowerCase());
        if (itemIdx >= 0) {
          mergedItems[itemIdx] = {
            ...mergedItems[itemIdx],
            requestedQty: Math.max(mergedItems[itemIdx].requestedQty, item.requestedQty),
            brand: item.brand || mergedItems[itemIdx].brand,
            unit: item.unit || mergedItems[itemIdx].unit
          };
        } else {
          mergedItems.push(item);
        }
      }
      prs[existingIndex] = {
        ...existing,
        date: formattedPR.date || existing.date,
        siteName: formattedPR.siteName || existing.siteName,
        documentImage: docImg || existing.documentImage,
        items: mergedItems,
        status: computePRStatus(mergedItems)
      };
    } else {
      prs = [formattedPR, ...prs];
    }
  }

  saveAllPRs(prs);
  return prs;
}

export function deletePR(prId: string): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[] } {
  const prs = getPRs().filter(p => p.id !== prId);
  saveAllPRs(prs);

  const dcs = getDCs();
  let dcChanged = false;
  const updatedDCs: DCRecord[] = dcs.map(dc => {
    if (dc.prId === prId) {
      dcChanged = true;
      return {
        ...dc,
        prId: '',
        prNumber: ''
      };
    }
    return dc;
  });
  if (dcChanged) {
    saveAllDCs(updatedDCs);
  }

  return { updatedPRs: prs, updatedDCs };
}

export function deleteDC(dcId: string): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[] } {
  const dcs = getDCs();
  const prs = getPRs();

  const targetDC = dcs.find(d => d.id === dcId);
  if (!targetDC) return { updatedPRs: prs, updatedDCs: dcs };

  const updatedDCs = dcs.filter(d => d.id !== dcId);

  // Recalculate PR fulfillment
  const targetPRIndex = prs.findIndex(p => p.id === targetDC.prId || p.prNumber === targetDC.prNumber);
  let updatedPRs = prs;

  if (targetPRIndex >= 0) {
    const pr = prs[targetPRIndex];
    // Remove fulfillment logs matching dcNumber
    const remainingLogs = (pr.fulfillmentLogs || []).filter(l => l.dcNumber !== targetDC.dcNumber);

    // Recompute fulfilled quantities from remaining logs
    const itemFulfilledTotals: Record<string, number> = {};
    remainingLogs.forEach(log => {
      itemFulfilledTotals[log.itemId] = (itemFulfilledTotals[log.itemId] || 0) + log.quantityShipped;
    });

    const updatedItems = pr.items.map(item => {
      const newFulfilled = itemFulfilledTotals[item.id] || 0;
      return {
        ...item,
        fulfilledQty: newFulfilled,
        status: computeItemStatus(item.requestedQty, newFulfilled)
      };
    });

    const updatedPR: PRRecord = {
      ...pr,
      items: updatedItems,
      fulfillmentLogs: remainingLogs,
      status: computePRStatus(updatedItems)
    };

    updatedPRs = [...prs];
    updatedPRs[targetPRIndex] = updatedPR;
    saveAllPRs(updatedPRs);
  }

  saveAllDCs(updatedDCs);
  return { updatedPRs, updatedDCs };
}

/** Update DC metadata without reconstructing a PR's historical fulfillment logs. */
export function updateDCInStorage(
  updatedDC: DCRecord
): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[] } {
  const dcs = getDCs();
  const prs = getPRs();
  const dcIndex = dcs.findIndex(dc => dc.id === updatedDC.id);
  if (dcIndex === -1) throw new Error('The DC was not found; no change was saved.');
  const oldDC = dcs[dcIndex];
  const normalize = (value: string | undefined) => (value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const changedReference = oldDC.dcNumber !== updatedDC.dcNumber || oldDC.prId !== updatedDC.prId || oldDC.prNumber !== updatedDC.prNumber;
  const changedItems = JSON.stringify(oldDC.itemsShipped) !== JSON.stringify(updatedDC.itemsShipped);
  const possiblyLinked = !oldDC.noPrRequired && Boolean(oldDC.prId || oldDC.prNumber);
  if (changedReference || (possiblyLinked && changedItems)) {
    throw new Error('Changing linked DC numbers, PR references, or item quantities is temporarily disabled until safe reconciliation is available. No changes were saved.');
  }
  if (dcs.some((dc, index) => index !== dcIndex && normalize(dc.dcNumber) === normalize(updatedDC.dcNumber))) {
    throw new Error('This DC number is already used by another record. No changes were saved.');
  }
  if ((updatedDC.itemsShipped || []).some(item => !Number.isFinite(item.quantity) || item.quantity < 0)) {
    throw new Error('DC quantities must be finite non-negative numbers.');
  }
  const updatedDCs = [...dcs];
  updatedDCs[dcIndex] = updatedDC;
  if (!saveAllDCs(updatedDCs)) throw new Error('The local DC update failed; keep this tab open and preserve the draft.');
  return { updatedPRs: prs, updatedDCs };
}


/** Build a delivery without modifying either input or writing browser storage. */
export function prepareDCAndFulfillPR(
  initialPRs: PRRecord[],
  dcs: DCRecord[],
  dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>,
  fulfillmentMap: Record<string, number>,
  options: { allowOverdelivery?: boolean } = {}
): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[]; newDC: DCRecord; changedPR: boolean } {
  let prs = initialPRs;
  const plan = planDeliveries(prs, dcs, [{ dcData, fulfillmentMap }]);
  if (plan.overdeliveries.length && !options.allowOverdelivery) throw new Error('Overdelivery requires explicit confirmation.');

  const syncedDCNumber = dcData.dcNumber.trim();
  const syncedInvoiceNumber = dcData.dcNumber.trim();
  const itemsShippedList: DCRecord['itemsShipped'] = [];
  const newFulfillmentLogs: FulfillmentLog[] = [];

  const targetPRIndex = dcData.prId
    ? prs.findIndex(p => p.id === dcData.prId)
    : prs.findIndex(p => dcData.prNumber && normalizePRReference(p.prNumber) === normalizePRReference(dcData.prNumber));

  if (targetPRIndex === -1) {
    const normalizedDCNumber = normalizePRReference(syncedDCNumber);
    const existingDCIndex = dcs.findIndex(d =>
      normalizePRReference(d.dcNumber) === normalizedDCNumber
    );
    const standaloneDC: DCRecord = {
      ...dcData,
      id: existingDCIndex >= 0 ? dcs[existingDCIndex].id : `dc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dcNumber: syncedDCNumber,
      invoiceNumber: syncedInvoiceNumber,
      prId: '',
      prNumber: dcData.prNumber?.trim() || '',
      itemsShipped: dcData.itemsShipped || [],
      deliveryStatus: dcData.deliveryStatus || 'Delivered',
      createdTimestamp: existingDCIndex >= 0 ? dcs[existingDCIndex].createdTimestamp : Date.now()
    };
    const updatedDCList = existingDCIndex >= 0
      ? dcs.map((dc, index) => index === existingDCIndex ? standaloneDC : dc)
      : [standaloneDC, ...dcs];
    return { updatedPRs: prs, updatedDCs: updatedDCList, newDC: standaloneDC, changedPR: false };
  }

  let targetPR: PRRecord;
  const hasMatchedDelivery = prs[targetPRIndex].items.some(item => (fulfillmentMap[item.id] || 0) > 0);

  {
    targetPR = { ...prs[targetPRIndex], items: [...prs[targetPRIndex].items] };

    // Remove old logs for this DC number if updating an existing DC
    const otherLogs = (targetPR.fulfillmentLogs || []).filter(
      l => l.dcNumber.trim().toLowerCase() !== syncedDCNumber.toLowerCase()
    );

    // Track matched PR items
    const existingItemIds = new Set(targetPR.items.map(it => it.id));
    targetPR.items.forEach(item => {
      const shippedQty = fulfillmentMap[item.id] !== undefined ? fulfillmentMap[item.id] : 0;
      
      // Preserve the actual dispatched quantity; preflight requires explicit confirmation for overdelivery.
      const actualShippedQty = shippedQty;
      if (actualShippedQty > 0) {
        itemsShippedList.push({
          itemId: item.id,
          itemName: item.name,
          brand: item.brand,
          quantity: actualShippedQty,
          unit: item.unit
        });

        newFulfillmentLogs.push({
          id: `flog-${Math.random().toString(36).substring(2, 9)}`,
          dcNumber: syncedDCNumber,
          invoiceNumber: syncedInvoiceNumber,
          prNumber: targetPR.prNumber,
          itemId: item.id,
          itemName: item.name,
          quantityShipped: actualShippedQty,
          date: dcData.date,
          transportType: dcData.transportType,
          addaName: dcData.addaName,
          biltyNumber: dcData.biltyNumber,
          freightCharges: dcData.freightCharges,
          isFreightFree: dcData.isFreightFree,
          driverName: dcData.driverName,
          vehicleNo: dcData.vehicleNumber,
          notes: dcData.remarks
        });
      }
    });

    // Keep DC-only items on the DC without inserting them into the requisition.
    const extraItems = (dcData.itemsShipped || []).filter(it => !existingItemIds.has(it.itemId));
    for (const extra of extraItems) {
      const extraQty = fulfillmentMap[extra.itemId] !== undefined ? fulfillmentMap[extra.itemId] : extra.quantity;
      if (extraQty > 0) {
        itemsShippedList.push({
          itemId: extra.itemId,
          itemName: extra.itemName,
          brand: extra.brand,
          quantity: extraQty,
          unit: extra.unit
        });
      }
    }

    const allLogs = [...otherLogs, ...newFulfillmentLogs];
    const itemFulfilledTotals: Record<string, number> = {};
    allLogs.forEach(log => {
      itemFulfilledTotals[log.itemId] = (itemFulfilledTotals[log.itemId] || 0) + log.quantityShipped;
    });

    const updatedItems = targetPR.items.map(item => {
      const fulfilled = itemFulfilledTotals[item.id] || 0;
      return {
        ...item,
        fulfilledQty: fulfilled,
        status: item.status === 'Cancelled' ? 'Cancelled' : computeItemStatus(item.requestedQty, fulfilled)
      };
    });

    targetPR = {
      ...targetPR,
      items: updatedItems,
      status: computePRStatus(updatedItems),
      fulfillmentLogs: allLogs
    };

    if (hasMatchedDelivery) {
      prs = [...prs];
      prs[targetPRIndex] = targetPR;
    }
  }

  // Ensure itemsShipped has items
  const finalItemsShipped = itemsShippedList.length > 0
    ? itemsShippedList
    : (dcData.itemsShipped && dcData.itemsShipped.length > 0 ? dcData.itemsShipped : []);

  if (hasMatchedDelivery && !targetPR.documentImage && dcData.prDocumentImage) {
    targetPR.documentImage = dcData.prDocumentImage;
  }

  const newDC: DCRecord = {
    ...dcData,
    id: `dc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    dcNumber: syncedDCNumber,
    invoiceNumber: syncedInvoiceNumber,
    prId: targetPR.id,
    prNumber: targetPR.prNumber,
    siteName: dcData.siteName || targetPR.siteName,
    itemsShipped: finalItemsShipped,
    documentImage: dcData.documentImage,
    prDocumentImage: dcData.prDocumentImage || targetPR.documentImage,
    deliveryStatus: dcData.deliveryStatus || 'Delivered',
    createdTimestamp: Date.now()
  };

  const existingDCIndex = dcs.findIndex(d => 
    d.dcNumber.trim().toLowerCase() === syncedDCNumber.toLowerCase() ||
    d.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === syncedDCNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  );

  let updatedDCList: DCRecord[];
  if (existingDCIndex >= 0) {
    updatedDCList = [...dcs];
    updatedDCList[existingDCIndex] = { ...newDC, id: dcs[existingDCIndex].id };
  } else {
    updatedDCList = [newDC, ...dcs];
  }

  return { updatedPRs: prs, updatedDCs: updatedDCList, newDC, changedPR: hasMatchedDelivery };
}

/** Legacy persistence wrapper; not atomic across localStorage keys. */
export function saveDCAndFulfillPR(
  dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>,
  fulfillmentMap: Record<string, number>,
  options: { allowOverdelivery?: boolean } = {}
): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[]; newDC: DCRecord } {
  const prepared = prepareDCAndFulfillPR(getPRs(), getDCs(), dcData, fulfillmentMap, options);
  if (prepared.changedPR && !saveAllPRs(prepared.updatedPRs)) throw new Error('The local PR save failed; the DC was not saved. Preserve the draft.');
  if (!saveAllDCs(prepared.updatedDCs)) throw new Error(prepared.changedPR ? 'The local DC save failed after the PR was saved. The ledger may be inconsistent; preserve the draft and do not retry until reviewed.' : 'The local DC save failed; preserve the draft.');
  return prepared;
}

export function saveMultipleDCsAndFulfillPRs(
  dcList: Array<{
    dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>;
    fulfillmentMap: Record<string, number>;
  }>,
  options: { allowOverdelivery?: boolean } = {}
): { updatedPRs: PRRecord[]; updatedDCs: DCRecord[]; newDCs: DCRecord[] } {
  const plan = planDeliveries(getPRs(), getDCs(), dcList);
  if (plan.overdeliveries.length && !options.allowOverdelivery) throw new Error('Overdelivery requires explicit confirmation.');
  let currentPRs = getPRs();
  let currentDCs = getDCs();
  const createdDCs: DCRecord[] = [];

  for (const item of dcList) {
    const res = saveDCAndFulfillPR(item.dcData, item.fulfillmentMap, options);
    currentPRs = res.updatedPRs;
    currentDCs = res.updatedDCs;
    createdDCs.push(res.newDC);
  }

  return { updatedPRs: currentPRs, updatedDCs: currentDCs, newDCs: createdDCs };
}

// 1. Link an unlinked or mismatched DC to a selected PR
export function linkDCToPRInStorage(
  dcId: string,
  targetPrId: string
): { success: boolean; updatedPRs: PRRecord[]; updatedDCs: DCRecord[]; error?: string } {
  const prs = getPRs();
  const dcs = getDCs();

  const targetPRIndex = prs.findIndex(p => p.id === targetPrId);
  const targetDCIndex = dcs.findIndex(d => d.id === dcId);

  if (targetPRIndex === -1) {
    return { success: false, updatedPRs: prs, updatedDCs: dcs, error: 'Target PR not found.' };
  }
  if (targetDCIndex === -1) {
    return { success: false, updatedPRs: prs, updatedDCs: dcs, error: 'Target DC not found.' };
  }

  const targetPR = prs[targetPRIndex];
  const targetDC = { ...dcs[targetDCIndex] };

  targetDC.prId = targetPR.id;
  targetDC.prNumber = targetPR.prNumber;
  
  // BUG FIX #3: Use normalized site name comparison for better matching
  const dcSiteNormalized = normalizeSiteName(targetDC.siteName);
  const prSiteNormalized = normalizeSiteName(targetPR.siteName);
  
  if (!targetDC.siteName || targetDC.siteName === 'Jadeed Group Site' || dcSiteNormalized === prSiteNormalized) {
    targetDC.siteName = targetPR.siteName;
  }

  dcs[targetDCIndex] = targetDC;

  saveAllDCs(dcs);

  return { success: true, updatedPRs: prs, updatedDCs: dcs };
}

// 2. Auto-link all unlinked or mismatched DCs across the database
export function autoLinkAllDCsInStorage(): {
  linkedCount: number;
  updatedPRs: PRRecord[];
  updatedDCs: DCRecord[];
} {
  let currentPRs = getPRs();
  let currentDCs = getDCs();
  let linkedCount = 0;

  for (const dc of currentDCs) {
    const isUnlinked = !dc.prId || !hasPRNumber(dc.prNumber) || !currentPRs.some(p => p.id === dc.prId);
    if (!isUnlinked) continue;

    // Link only when the normalized PR reference matches
    const normalizedDcPr = normalizePRNumber(dc.prNumber);
    if (!normalizedDcPr) continue; // No PR number to match
    
    let matchedPR = currentPRs.find(p => {
      const normalizedPr = normalizePRNumber(p.prNumber);
      return normalizedPr === normalizedDcPr;
    });

    if (matchedPR) {
      const res = linkDCToPRInStorage(dc.id, matchedPR.id);
      if (res.success) {
        currentPRs = res.updatedPRs;
        currentDCs = res.updatedDCs;
        linkedCount++;
      }
    }
  }

  return { linkedCount, updatedPRs: currentPRs, updatedDCs: currentDCs };
}

// 2b. Attach Goods Delivered Builty to DC and link with PR fulfillment logs
export function attachBuiltyToDCInStorage(
  dcIdentifier: string,
  builtyData: Partial<GeminiBuiltyExtractionResult>
): {
  success: boolean;
  updatedDCs: DCRecord[];
  updatedPRs: PRRecord[];
  linkedDC?: DCRecord;
  linkedPR?: PRRecord;
  error?: string;
  message?: string;
} {
  let dcs = getDCs();
  let prs = getPRs();

  const cleanQuery = (dcIdentifier || '').trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const dcIdx = dcs.findIndex(d => {
    if (d.id === dcIdentifier) return true;
    if (d.dcNumber.toLowerCase() === dcIdentifier.toLowerCase()) return true;
    const cleanDC = d.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanDC === cleanQuery) return true;
    // Match digits e.g. "674" matches "DC-674"
    if (cleanQuery && (cleanDC.includes(cleanQuery) || cleanQuery.includes(cleanDC))) return true;
    return false;
  });

  if (dcIdx === -1) {
    return {
      success: false,
      updatedDCs: dcs,
      updatedPRs: prs,
      error: `No Delivery Challan found matching "${dcIdentifier}".`
    };
  }

  const dc = { ...dcs[dcIdx] };
  dc.isBuiltyAttached = true;
  dc.transportType = 'Adda / Goods Transport';

  if (builtyData.builtyNumber) dc.biltyNumber = builtyData.builtyNumber.trim();
  if (builtyData.addaName) dc.addaName = builtyData.addaName.trim();
  if (builtyData.destinationCity) dc.destinationCity = builtyData.destinationCity.trim();
  if (builtyData.packagesCount) dc.packagesCount = builtyData.packagesCount.trim();
  if (builtyData.builtyDate) dc.builtyDate = builtyData.builtyDate;
  if (builtyData.builtyImage) dc.builtyImage = builtyData.builtyImage;
  if (builtyData.freightCharges !== undefined) dc.freightCharges = builtyData.freightCharges;
  if (builtyData.freightStatus) {
    dc.freightStatus = builtyData.freightStatus;
    dc.isFreightFree = builtyData.freightStatus === 'Free' || builtyData.freightCharges === 0;
  }

  const freightNote = dc.freightStatus ? ` (${dc.freightStatus})` : '';
  const packagesNote = dc.packagesCount ? ` - ${dc.packagesCount}` : '';
  dc.remarks = `Builty #${dc.biltyNumber || 'Attached'}${freightNote} via ${dc.addaName || 'Goods Transport'}${packagesNote}`;

  dcs[dcIdx] = dc;
  saveAllDCs(dcs);

  // Sync fulfillment logs on linked PR
  let linkedPR: PRRecord | undefined;
  const prIdx = prs.findIndex(p => p.id === dc.prId || p.prNumber === dc.prNumber);
  if (prIdx >= 0) {
    const pr = { ...prs[prIdx] };
    pr.fulfillmentLogs = (pr.fulfillmentLogs || []).map(log => {
      if (log.dcNumber === dc.dcNumber) {
        return {
          ...log,
          transportType: 'Adda / Goods Transport',
          addaName: dc.addaName,
          biltyNumber: dc.biltyNumber,
          freightCharges: dc.freightCharges,
          isFreightFree: dc.isFreightFree,
          builtyAttached: true,
          builtyImage: dc.builtyImage,
          notes: dc.remarks
        };
      }
      return log;
    });

    prs[prIdx] = pr;
    saveAllPRs(prs);
    linkedPR = pr;
  }

  return {
    success: true,
    updatedDCs: dcs,
    updatedPRs: prs,
    linkedDC: dc,
    linkedPR,
    message: `✓ Builty #${dc.biltyNumber || ''} linked to ${dc.dcNumber} (${dc.siteName})`
  };
}

// Batch attach multiple builtys from Gemini OCR
export function attachMultipleBuiltysInStorage(
  builtys: GeminiBuiltyExtractionResult[]
): {
  attachedCount: number;
  unlinkedCount: number;
  updatedDCs: DCRecord[];
  updatedPRs: PRRecord[];
  results: { builtyNumber: string; dcNumber: string; success: boolean; message: string }[];
} {
  let dcs = getDCs();
  let prs = getPRs();
  let attachedCount = 0;
  let unlinkedCount = 0;
  const results: { builtyNumber: string; dcNumber: string; success: boolean; message: string }[] = [];

  for (const b of builtys) {
    const res = attachBuiltyToDCInStorage(b.dcNumber, b);
    if (res.success) {
      dcs = res.updatedDCs;
      prs = res.updatedPRs;
      attachedCount++;
      results.push({
        builtyNumber: b.builtyNumber,
        dcNumber: b.dcNumber,
        success: true,
        message: res.message || 'Attached'
      });
    } else {
      unlinkedCount++;
      results.push({
        builtyNumber: b.builtyNumber,
        dcNumber: b.dcNumber,
        success: false,
        message: res.error || 'DC not found'
      });
    }
  }

  return { attachedCount, unlinkedCount, updatedDCs: dcs, updatedPRs: prs, results };
}


// 3. Merge duplicate PRs into one primary record
export function mergeDuplicatePRsInStorage(
  primaryPrId: string,
  duplicatePrId: string
): { success: boolean; updatedPRs: PRRecord[]; updatedDCs: DCRecord[]; error?: string } {
  const prs = getPRs();
  let dcs = getDCs();

  const primaryIdx = prs.findIndex(p => p.id === primaryPrId);
  const dupIdx = prs.findIndex(p => p.id === duplicatePrId);

  if (primaryIdx === -1 || dupIdx === -1) {
    return { success: false, updatedPRs: prs, updatedDCs: dcs, error: 'One or both PRs not found.' };
  }

  const primary = { ...prs[primaryIdx] };
  const duplicate = prs[dupIdx];

  // Merge items
  const mergedItems = [...(primary.items || [])];
  (duplicate.items || []).forEach(dupItem => {
    const existing = mergedItems.find(it =>
      it.name.toLowerCase().trim() === dupItem.name.toLowerCase().trim()
    );
    if (existing) {
      existing.requestedQty = Math.max(existing.requestedQty, dupItem.requestedQty);
      existing.fulfilledQty = Math.max(existing.fulfilledQty, dupItem.fulfilledQty);
      existing.status = computeItemStatus(existing.requestedQty, existing.fulfilledQty);
    } else {
      mergedItems.push({ ...dupItem, id: `item-merged-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
    }
  });

  // Merge logs
  const combinedLogs = [...(primary.fulfillmentLogs || []), ...(duplicate.fulfillmentLogs || [])];
  const uniqueLogs: FulfillmentLog[] = [];
  const seenLogs = new Set<string>();
  combinedLogs.forEach(log => {
    const key = `${log.dcNumber}-${log.itemName}-${log.quantityShipped}`;
    if (!seenLogs.has(key)) {
      seenLogs.add(key);
      uniqueLogs.push(log);
    }
  });

  primary.items = mergedItems;
  primary.fulfillmentLogs = uniqueLogs;
  primary.status = computePRStatus(mergedItems);

  // Re-point any DCs that were linked to duplicate PR
  // Guard against empty / 'NO PR' matching which would corrupt all unlinked DCs across the database
  const dupPrNum = duplicate.prNumber?.trim();
  const isSpecialNoPR = !dupPrNum || dupPrNum.toUpperCase() === 'NO PR' || dupPrNum.toUpperCase() === 'WITHOUT PR';

  dcs = dcs.map(dc => {
    const matchesId = Boolean(dc.prId && dc.prId === duplicate.id);
    const matchesNumber = Boolean(!isSpecialNoPR && dc.prNumber && dupPrNum && dc.prNumber.trim().toUpperCase() === dupPrNum.toUpperCase());
    if (matchesId || matchesNumber) {
      return {
        ...dc,
        prId: primary.id,
        prNumber: primary.prNumber
      };
    }
    return dc;
  });

  // Remove duplicate PR
  const updatedPRs = prs.filter(p => p.id !== duplicatePrId);
  const updatedPrimaryIdx = updatedPRs.findIndex(p => p.id === primary.id);
  updatedPRs[updatedPrimaryIdx] = primary;

  saveAllPRs(updatedPRs);
  saveAllDCs(dcs);

  return { success: true, updatedPRs, updatedDCs: dcs };
}

// 4. Deduplicate line items within a single PR
export function deduplicateItemsInPRStorage(
  prId: string
): { success: boolean; updatedPRs: PRRecord[]; error?: string } {
  const prs = getPRs();
  const prIdx = prs.findIndex(p => p.id === prId);
  if (prIdx === -1) return { success: false, updatedPRs: prs, error: 'PR not found' };

  const pr = { ...prs[prIdx] };
  const uniqueItemsMap = new Map<string, LineItem>();

  (pr.items || []).forEach(it => {
    if (!it || !it.name?.trim()) {
      if (it) uniqueItemsMap.set(it.id || `item-incomplete-${uniqueItemsMap.size}`, it);
      return;
    }
    const key = it.name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (uniqueItemsMap.has(key)) {
      const existing = uniqueItemsMap.get(key)!;
      existing.requestedQty = Math.max(existing.requestedQty, it.requestedQty);
      existing.fulfilledQty = Math.max(existing.fulfilledQty, it.fulfilledQty);
      existing.status = computeItemStatus(existing.requestedQty, existing.fulfilledQty);
    } else {
      uniqueItemsMap.set(key, { ...it });
    }
  });

  pr.items = Array.from(uniqueItemsMap.values());
  pr.status = computePRStatus(pr.items);

  prs[prIdx] = pr;
  saveAllPRs(prs);

  return { success: true, updatedPRs: prs };
}

// 5. Merge duplicate DCs into a single clean DC entry
export function mergeDuplicateDCsInStorage(
  primaryDcId: string,
  duplicateDcId: string
): { success: boolean; updatedDCs: DCRecord[]; error?: string } {
  const dcs = getDCs();
  const primaryIdx = dcs.findIndex(d => d.id === primaryDcId);
  const dupIdx = dcs.findIndex(d => d.id === duplicateDcId);

  if (primaryIdx === -1 || dupIdx === -1) {
    return { success: false, updatedDCs: dcs, error: 'One or both DCs not found.' };
  }

  const primary = { ...dcs[primaryIdx] };
  const duplicate = dcs[dupIdx];

  // Merge items
  const mergedItems = [...(primary.itemsShipped || [])];
  (duplicate.itemsShipped || []).forEach(dupItem => {
    const existing = mergedItems.find(it =>
      it.itemName.toLowerCase().trim() === dupItem.itemName.toLowerCase().trim()
    );
    if (existing) {
      existing.quantity = Math.max(existing.quantity, dupItem.quantity);
    } else {
      mergedItems.push(dupItem);
    }
  });

  primary.itemsShipped = mergedItems;
  if (!primary.documentImage && duplicate.documentImage) {
    primary.documentImage = duplicate.documentImage;
  }
  if (!primary.builtyImage && duplicate.builtyImage) {
    primary.builtyImage = duplicate.builtyImage;
  }
  if (!primary.prDocumentImage && duplicate.prDocumentImage) {
    primary.prDocumentImage = duplicate.prDocumentImage;
  }
  if (!primary.driverName && duplicate.driverName) {
    primary.driverName = duplicate.driverName;
  }
  if (!primary.vehicleNumber && duplicate.vehicleNumber) {
    primary.vehicleNumber = duplicate.vehicleNumber;
  }

  const updatedDCs = dcs.filter(d => d.id !== duplicateDcId).map(d => d.id === primaryDcId ? primary : d);
  saveAllDCs(updatedDCs);
  return { success: true, updatedDCs };
}

// 6. Merge all duplicate DC groups automatically
export function mergeAllDuplicateDCsInStorage(): { success: boolean; updatedDCs: DCRecord[]; mergedCount: number } {
  const dcs = getDCs();
  const map = new Map<string, DCRecord[]>();
  dcs.forEach(dc => {
    const clean = dc.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (!clean) return;
    const list = map.get(clean) || [];
    list.push(dc);
    map.set(clean, list);
  });

  let currentDCs = [...dcs];
  let mergedCount = 0;

  map.forEach((records) => {
    if (records.length > 1) {
      const primary = records[0];
      for (let i = 1; i < records.length; i++) {
        const res = mergeDuplicateDCsInStorage(primary.id, records[i].id);
        if (res.success) {
          mergedCount++;
          currentDCs = res.updatedDCs;
        }
      }
    }
  });

  return { success: true, updatedDCs: currentDCs, mergedCount };
}

export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  // 1. Primary storage key
  const primary = localStorage.getItem(STORAGE_KEY_API_KEY);
  if (primary && primary.trim()) {
    return cleanApiKey(primary);
  }

  // 2. Common alias storage keys
  const aliases = ['gemini_api_key', 'GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'GOOGLE_API_KEY'];
  for (const alias of aliases) {
    const val = localStorage.getItem(alias);
    if (val && val.trim()) {
      const clean = cleanApiKey(val);
      localStorage.setItem(STORAGE_KEY_API_KEY, clean);
      return clean;
    }
  }

  // 3. Vite environment variable
  try {
    if (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
      return cleanApiKey((import.meta as any).env.VITE_GEMINI_API_KEY);
    }
  } catch {
    // ignore
  }

  return '';
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = cleanApiKey(key);
  if (!clean) {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
    localStorage.removeItem('gemini_api_key');
    return;
  }
  localStorage.setItem(STORAGE_KEY_API_KEY, clean);
  localStorage.setItem('gemini_api_key', clean);
}

export function getOpenAIApiKey(): string {
  if (typeof window === 'undefined') return '';
  return cleanApiKey(localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY));
}

export function saveOpenAIApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = cleanApiKey(key);
  if (clean) {
    localStorage.setItem(STORAGE_KEY_OPENAI_API_KEY, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY_OPENAI_API_KEY);
  }
}

export function getClaudeApiKey(): string {
  if (typeof window === 'undefined') return '';
  return cleanApiKey(localStorage.getItem(STORAGE_KEY_CLAUDE_API_KEY));
}

export function saveClaudeApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = cleanApiKey(key);
  if (clean) {
    localStorage.setItem(STORAGE_KEY_CLAUDE_API_KEY, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY_CLAUDE_API_KEY);
  }
}

export function getAgentRouterApiKey(): string {
  if (typeof window === 'undefined') return '';
  return cleanApiKey(localStorage.getItem(STORAGE_KEY_AGENTROUTER_API_KEY));
}

export function saveAgentRouterApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = cleanApiKey(key);
  if (clean) {
    localStorage.setItem(STORAGE_KEY_AGENTROUTER_API_KEY, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY_AGENTROUTER_API_KEY);
  }
}

export function getAgentRouterModel(): string {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(STORAGE_KEY_AGENTROUTER_MODEL) || '').trim();
}

export function saveAgentRouterModel(model: string): void {
  if (typeof window === 'undefined') return;
  const clean = model.trim();
  if (clean) {
    localStorage.setItem(STORAGE_KEY_AGENTROUTER_MODEL, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY_AGENTROUTER_MODEL);
  }
}

export type PreferredOCRProvider = 'auto' | 'gemini' | 'ollama' | 'claude' | 'openai';

export function getPreferredOCRProvider(): PreferredOCRProvider {
  if (typeof window === 'undefined') return 'auto';
  const val = localStorage.getItem(STORAGE_KEY_PREFERRED_OCR_PROVIDER) as PreferredOCRProvider;
  if (val && ['auto', 'gemini', 'ollama', 'claude', 'openai'].includes(val)) return val;
  return 'auto';
}

export function savePreferredOCRProvider(provider: PreferredOCRProvider): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PREFERRED_OCR_PROVIDER, provider);
}

export function getOllamaEndpoint(): string {
  if (typeof window === 'undefined') return '';
  const val = localStorage.getItem(STORAGE_KEY_OLLAMA_ENDPOINT);
  if (!val || val === 'DISABLED') return '';
  return val.trim();
}

export function saveOllamaEndpoint(endpoint: string): void {
  if (typeof window === 'undefined') return;
  const clean = endpoint.trim().replace(/\/+$/, '');
  if (clean) {
    localStorage.setItem(STORAGE_KEY_OLLAMA_ENDPOINT, clean);
  } else {
    localStorage.setItem(STORAGE_KEY_OLLAMA_ENDPOINT, 'DISABLED');
  }
}

export function getOllamaModel(): string {
  if (typeof window === 'undefined') return 'minicpm-v';
  return (localStorage.getItem(STORAGE_KEY_OLLAMA_MODEL) || 'minicpm-v').trim();
}

export function saveOllamaModel(model: string): void {
  if (typeof window === 'undefined') return;
  const clean = model.trim();
  if (clean) {
    localStorage.setItem(STORAGE_KEY_OLLAMA_MODEL, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY_OLLAMA_MODEL);
  }
}

// Security protected Master Reset (Wipes database to 100% empty slate)
export function masterResetWithPassword(confirmationPhrase: string): { success: boolean; prs: PRRecord[]; dcs: DCRecord[]; error?: string } {
  if (confirmationPhrase.trim() !== 'DELETE-ALL-DATA') {
    return { success: false, prs: getPRs(), dcs: getDCs(), error: 'Incorrect confirmation phrase. Type DELETE-ALL-DATA to confirm.' };
  }
  localStorage.setItem(STORAGE_KEY_PRS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEY_DCS, JSON.stringify([]));
  return { success: true, prs: [], dcs: [] };
}

export function resetToSeedData(): { prs: PRRecord[]; dcs: DCRecord[] } {
  localStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(INITIAL_PRS));
  localStorage.setItem(STORAGE_KEY_DCS, JSON.stringify(INITIAL_DCS));
  return { prs: INITIAL_PRS, dcs: INITIAL_DCS };
}
