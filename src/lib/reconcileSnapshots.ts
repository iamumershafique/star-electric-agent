/** Non-destructive presentation of cloud snapshots. This is not conflict resolution or a retry queue. */
export interface LedgerSnapshotRecord { id: string }
export type SnapshotDifference = { id: string; number: string; reason: 'different' | 'local-only' | 'duplicate-id' | 'same-number' };

// Scan data can be stored as local bytes, an IndexedDB key, or a remote URL. Comparing those
// representations is not a reliable way to verify scans; scan reconciliation remains separate.
const imageFields = new Set(['documentImage', 'prDocumentImage', 'builtyImage']);
function comparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparable);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).filter(key => !imageFields.has(key) && record[key] !== undefined).sort().map(key => [key, comparable(record[key])]));
  }
  return value;
}
const normalize = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

export function reconcileSnapshot<T extends LedgerSnapshotRecord>(
  local: T[], cloud: T[], numberOf: (record: T) => string, authoritative: boolean
): { records: T[]; differences: SnapshotDifference[]; added: number } {
  const localById = new Map<string, T[]>();
  const cloudById = new Map<string, T[]>();
  const numberIds = new Map<string, Set<string>>();
  const index = (target: Map<string, T[]>, record: T) => {
    target.set(record.id, [...(target.get(record.id) || []), record]);
    const number = normalize(numberOf(record) || '');
    if (number) { const ids = numberIds.get(number) || new Set<string>(); ids.add(record.id); numberIds.set(number, ids); }
  };
  local.forEach(record => index(localById, record));
  cloud.forEach(record => index(cloudById, record));
  const differences: SnapshotDifference[] = [];
  for (const [id, items] of localById) {
    const remote = cloudById.get(id) || [];
    const number = numberOf(items[0]) || id;
    if (!id || items.length !== 1 || remote.length > 1) differences.push({ id, number, reason: 'duplicate-id' });
    else if (!remote.length) { if (authoritative) differences.push({ id, number, reason: 'local-only' }); }
    else if (JSON.stringify(comparable(items[0])) !== JSON.stringify(comparable(remote[0]))) differences.push({ id, number, reason: 'different' });
  }
  for (const [id, items] of cloudById) {
    if (!localById.has(id) && (!id || items.length !== 1)) differences.push({ id, number: numberOf(items[0]) || id, reason: 'duplicate-id' });
  }
  for (const [number, ids] of numberIds) {
    if (ids.size > 1) differences.push({ id: [...ids].join(', '), number, reason: 'same-number' });
  }
  // Preserve every local record; only append cloud records with a unique, previously unseen ID.
  const additions = cloud.filter(record => record.id && !localById.has(record.id) && cloudById.get(record.id)?.length === 1);
  return { records: additions.length ? [...local, ...additions] : local, differences, added: additions.length };
}
