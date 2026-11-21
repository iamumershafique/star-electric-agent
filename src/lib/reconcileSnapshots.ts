/** Non-destructive presentation of cloud snapshots. This is not conflict resolution or a retry queue. */
export interface LedgerSnapshotRecord { id: string }
export type SnapshotDifference = { id: string; number: string; reason: 'different' | 'local-only' | 'duplicate-id' | 'same-number' };

// Scan data can be stored as local bytes, an IndexedDB key, or a remote URL. Comparing those
// representations is not a reliable way to verify scans; scan reconciliation remains separate.
const imageFields = new Set(['documentImage', 'prDocumentImage', 'builtyImage']);
function comparable(value: unknown, ignoreImages: boolean): unknown {
  if (Array.isArray(value)) return value.map(item => comparable(item, ignoreImages));
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).filter(key => (!ignoreImages || !imageFields.has(key)) && record[key] !== undefined).sort().map(key => [key, comparable(record[key], ignoreImages)]));
  }
  return value;
}
export const sameLedgerDetails = (a: unknown, b: unknown) => JSON.stringify(comparable(a, true)) === JSON.stringify(comparable(b, true));
export const sameRecordData = (a: unknown, b: unknown) => JSON.stringify(comparable(a, false)) === JSON.stringify(comparable(b, false));
const normalize = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

export function reconcileSnapshot<T extends LedgerSnapshotRecord>(
  local: T[], cloud: T[], numberOf: (record: T) => string, authoritative: boolean,
  previousServerSnapshot?: T[]
): { records: T[]; differences: SnapshotDifference[]; added: number; updated: number } {
  const localById = new Map<string, T[]>();
  const cloudById = new Map<string, T[]>();
  const previousById = new Map<string, T[]>();
  const numberIds = new Map<string, Set<string>>();
  const index = (target: Map<string, T[]>, record: T) => {
    target.set(record.id, [...(target.get(record.id) || []), record]);
    const number = normalize(numberOf(record) || '');
    if (number) { const ids = numberIds.get(number) || new Set<string>(); ids.add(record.id); numberIds.set(number, ids); }
  };
  local.forEach(record => index(localById, record));
  cloud.forEach(record => index(cloudById, record));
  previousServerSnapshot?.forEach(record => index(previousById, record));

  // Only apply a later server value if a trusted earlier server value exactly matches the
  // current local non-image fields. Never infer deletion, and never update ambiguous IDs or
  // business numbers. The first snapshot cannot establish that local data is unmodified.
  let updated = 0;
  const refreshed = local.map(record => {
    const previous = previousById.get(record.id) || [];
    const remote = cloudById.get(record.id) || [];
    if (!authoritative || !previousServerSnapshot || !record.id || localById.get(record.id)?.length !== 1 || previous.length !== 1 || remote.length !== 1) return record;
    const numbers = [record, previous[0], remote[0]].map(value => normalize(numberOf(value) || ''));
    if (numbers.some(number => !number || (numberIds.get(number)?.size || 0) !== 1)) return record;
    if (!sameLedgerDetails(record, previous[0]) || sameLedgerDetails(record, remote[0])) return record;
    // Preserve local scan bytes/references, but never discard a server reference merely
    // because this device has no value. This is not scan verification or reconciliation.
    const replacement = { ...remote[0] } as Record<string, unknown>;
    const source = record as T & Record<string, unknown>;
    for (const field of imageFields) {
      if (source[field] !== undefined && source[field] !== null && source[field] !== '') replacement[field] = source[field];
    }
    updated++;
    return replacement as T;
  });

  const differences: SnapshotDifference[] = [];
  for (const record of refreshed) {
    const items = localById.get(record.id) || [];
    const remote = cloudById.get(record.id) || [];
    const number = numberOf(record) || record.id;
    if (!record.id || items.length !== 1 || remote.length > 1) differences.push({ id: record.id, number, reason: 'duplicate-id' });
    else if (!remote.length) { if (authoritative) differences.push({ id: record.id, number, reason: 'local-only' }); }
    else if (!sameLedgerDetails(record, remote[0])) differences.push({ id: record.id, number, reason: 'different' });
  }
  for (const [id, items] of cloudById) {
    if (!localById.has(id) && (!id || items.length !== 1)) differences.push({ id, number: numberOf(items[0]) || id, reason: 'duplicate-id' });
  }
  for (const [number, ids] of numberIds) {
    if (ids.size > 1) differences.push({ id: [...ids].join(', '), number, reason: 'same-number' });
  }
  // Preserve every local record; only append cloud records with a unique, previously unseen ID.
  const additions = cloud.filter(record => record.id && !localById.has(record.id) && cloudById.get(record.id)?.length === 1);
  return { records: additions.length ? [...refreshed, ...additions] : updated ? refreshed : local, differences, added: additions.length, updated };
}
