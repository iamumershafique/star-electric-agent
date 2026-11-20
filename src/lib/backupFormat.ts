import type { DCRecord, PRRecord } from '../types';
import type { StoredImageRecord } from './imageStorage';

const FORMAT = 'star-electric-device-backup';

export type BackupPayload = {
  format: typeof FORMAT;
  version: 2;
  createdAt: string;
  prs: PRRecord[];
  dcs: DCRecord[];
  images: StoredImageRecord[];
  legacyMetadata?: Record<string, unknown>;
};
export interface BackupSummary {
  prs: number;
  dcs: number;
  localScans: number;
  missingLocalReferences: number;
  externalReferences: number;
}
type BackupFile = { payload: BackupPayload; sha256: string };

async function digest(value: unknown): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Backup verification requires a secure browser context (HTTPS or localhost).');
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function validatePayload(value: unknown): asserts value is BackupPayload {
  if (!isObject(value) || value.format !== FORMAT || value.version !== 2 ||
      typeof value.createdAt !== 'string' || !Array.isArray(value.prs) || !Array.isArray(value.dcs) || !Array.isArray(value.images)) {
    throw new Error('Unsupported backup format. This restore only accepts version 2 device backups.');
  }
  for (const [records, numberKey, itemsKey] of [[value.prs, 'prNumber', 'items'], [value.dcs, 'dcNumber', 'itemsShipped']] as const) {
    const ids = new Set<string>();
    for (const record of records) {
      if (!isObject(record) || typeof record.id !== 'string' || !record.id.trim() || ids.has(record.id) ||
          typeof record[numberKey] !== 'string' || !record[numberKey].trim() || !Array.isArray(record[itemsKey])) {
        throw new Error(`Backup contains an invalid or duplicate ${numberKey} record. No data was restored.`);
      }
      if (!(record[itemsKey] as unknown[]).every(isObject) ||
          (numberKey === 'prNumber' && record.fulfillmentLogs !== undefined &&
            (!Array.isArray(record.fulfillmentLogs) || !record.fulfillmentLogs.every(isObject)))) {
        throw new Error(`Backup contains malformed ${numberKey} line items or fulfillment logs. No data was restored.`);
      }
      ids.add(record.id);
    }
  }
  const imageIds = new Set<string>();
  for (const image of value.images) {
    if (!isObject(image) || typeof image.id !== 'string' || !image.id || imageIds.has(image.id) ||
        !['pr', 'dc', 'builty'].includes(String(image.type)) || typeof image.referenceNumber !== 'string' ||
        typeof image.dataUrl !== 'string' || !image.dataUrl || typeof image.updatedAt !== 'number' || !Number.isFinite(image.updatedAt)) {
      throw new Error('Backup contains invalid or duplicate scan entries. No data was restored.');
    }
    imageIds.add(image.id);
  }
}

function summarize(payload: BackupPayload): BackupSummary {
  const imagesById = new Map(payload.images.map(image => [image.id, image]));
  const resolves = (id: string, seen = new Set<string>()): boolean => {
    if (seen.has(id)) return false;
    seen.add(id);
    const image = imagesById.get(id);
    if (!image) return false;
    return image.dataUrl.startsWith('indexeddb:') ? resolves(image.dataUrl.slice('indexeddb:'.length), seen) : !!image.dataUrl;
  };
  const missing = new Set<string>();
  const external = new Set<string>();
  // Scan fields may also appear in fulfillment logs. Count unique references, not files.
  function visit(value: unknown, key = ''): void {
    if (typeof value === 'string' && (key.toLowerCase().includes('image') || key === 'dataUrl')) {
      if (value.startsWith('indexeddb:')) {
        if (!resolves(value.slice('indexeddb:'.length))) missing.add(value);
      } else if (value && !value.startsWith('data:')) external.add(value);
    } else if (Array.isArray(value)) value.forEach(item => visit(item));
    else if (isObject(value)) Object.entries(value).forEach(([k, v]) => visit(v, k));
  }
  visit(payload.prs); visit(payload.dcs); visit(payload.images);
  return { prs: payload.prs.length, dcs: payload.dcs.length, localScans: payload.images.filter(image => image.dataUrl.startsWith('data:')).length,
    missingLocalReferences: missing.size, externalReferences: external.size };
}

/** Build a portable device archive without contacting Firebase. */
export async function createBackupFromRecords(prs: PRRecord[], dcs: DCRecord[], images: StoredImageRecord[], legacyMetadata?: Record<string, unknown>): Promise<{ json: string; summary: BackupSummary }> {
  // Clone to the exact JSON representation that will be verified after re-reading the file.
  const payload: BackupPayload = JSON.parse(JSON.stringify({ format: FORMAT, version: 2, createdAt: new Date().toISOString(), prs, dcs, images, legacyMetadata }));
  validatePayload(payload);
  // In-memory records can contain large data URLs. Move them into the image archive so
  // a restore does not try to fit image bytes into the browser's small localStorage quota.
  const knownIds = new Set(payload.images.map(image => image.id));
  const inlineImages = new Map<string, string>();
  payload.images.forEach(image => {
    if (image.dataUrl.startsWith('data:')) inlineImages.set(`${image.type}:${image.dataUrl}`, image.id);
  });
  let nextImage = 0;
  const archiveInline = (value: string | undefined, type: StoredImageRecord['type'], referenceNumber: string): string | undefined => {
    if (!value?.startsWith('data:')) return value;
    const key = `${type}:${value}`;
    let id = inlineImages.get(key);
    if (!id) {
      do { id = `${type}_backup_${++nextImage}`; } while (knownIds.has(id));
      knownIds.add(id);
      inlineImages.set(key, id);
      payload.images.push({ id, type, referenceNumber, dataUrl: value, updatedAt: Date.now() });
    }
    return `indexeddb:${id}`;
  };
  payload.prs.forEach(pr => {
    pr.documentImage = archiveInline(pr.documentImage, 'pr', pr.prNumber);
    (pr.fulfillmentLogs || []).forEach(log => { log.builtyImage = archiveInline(log.builtyImage, 'builty', log.dcNumber); });
  });
  payload.dcs.forEach(dc => {
    dc.documentImage = archiveInline(dc.documentImage, 'dc', dc.dcNumber);
    dc.builtyImage = archiveInline(dc.builtyImage, 'builty', dc.dcNumber);
    dc.prDocumentImage = archiveInline(dc.prDocumentImage, 'pr', dc.prNumber || dc.prId);
  });
  validatePayload(payload);
  const file: BackupFile = { payload, sha256: await digest(payload) };
  return { json: JSON.stringify(file), summary: summarize(payload) };
}

export async function verifyDeviceBackup(json: string): Promise<{ payload: BackupPayload; summary: BackupSummary }> {
  let file: unknown;
  try { file = JSON.parse(json); } catch { throw new Error('Backup is not valid JSON.'); }
  if (!isObject(file) || typeof file.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(file.sha256)) {
    throw new Error('Unsupported or incomplete backup file. No data was restored.');
  }
  validatePayload(file.payload);
  if (await digest(file.payload) !== file.sha256) throw new Error('Backup checksum failed. The file may be damaged or modified.');
  return { payload: file.payload, summary: summarize(file.payload) };
}
