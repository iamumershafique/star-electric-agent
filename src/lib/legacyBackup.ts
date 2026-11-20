import type { DCRecord, PRRecord } from '../types';

export interface LegacyBackup {
  prs: PRRecord[];
  dcs: DCRecord[];
  metadata: Record<string, unknown>;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const normal = (value: unknown): string => typeof value === 'string' ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

/** Parse without changing or repairing any source record. */
export function parseLegacyBackup(json: string): LegacyBackup {
  let data: unknown;
  try { data = JSON.parse(json); } catch { throw new Error('The source is not valid JSON.'); }
  if (!isObject(data) || data.version !== '1.0' || !Array.isArray(data.prs) || !Array.isArray(data.dcs)) {
    throw new Error('Expected a version 1.0 backup containing PR and DC arrays.');
  }
  if (!data.prs.every(isObject) || !data.dcs.every(isObject)) {
    throw new Error('The source contains malformed record entries. No conversion was attempted.');
  }
  const { prs, dcs, ...metadata } = data;
  // Fields remain untrusted at this point; inspection checks them and conversion
  // validates their structure before it can produce an archive.
  return { prs: prs as unknown as PRRecord[], dcs: dcs as unknown as DCRecord[], metadata };
}

export interface DanglingLink {
  dcNumber: string;
  prNumber: string;
  matchingPRNumbers: number;
}

export function inspectLegacyBackup(backup: LegacyBackup) {
  const { prs, dcs } = backup;
  const byId = new Map<string, PRRecord[]>();
  const byNumber = new Map<string, PRRecord[]>();
  const add = (map: Map<string, PRRecord[]>, key: string, pr: PRRecord) => {
    if (!key) return;
    map.set(key, [...(map.get(key) || []), pr]);
  };
  for (const pr of prs) {
    add(byId, typeof pr.id === 'string' ? pr.id : '', pr);
    add(byNumber, normal(pr.prNumber), pr);
  }
  const danglingLinks: DanglingLink[] = [];
  const conflictingLinks: Array<{ dcNumber: string; recordedPRNumber: string; linkedPRNumber: string }> = [];
  for (const dc of dcs) {
    if (typeof dc.prId !== 'string' || !dc.prId) continue;
    const targets = byId.get(dc.prId) || [];
    if (!targets.length) {
      const key = normal(dc.prNumber);
      danglingLinks.push({ dcNumber: typeof dc.dcNumber === 'string' ? dc.dcNumber : '',
        prNumber: typeof dc.prNumber === 'string' ? dc.prNumber : '', matchingPRNumbers: key ? (byNumber.get(key)?.length || 0) : 0 });
    } else if (targets.length === 1 && normal(dc.prNumber) && normal(dc.prNumber) !== normal(targets[0].prNumber)) {
      conflictingLinks.push({ dcNumber: typeof dc.dcNumber === 'string' ? dc.dcNumber : '', recordedPRNumber: dc.prNumber, linkedPRNumber: targets[0].prNumber });
    }
  }
  const imageValues = { embedded: 0, indexeddbReferences: 0, externalOrOther: 0 };
  const localRefs = new Set<string>();
  const visit = (value: unknown, key = ''): void => {
    if (typeof value === 'string' && key.toLowerCase().includes('image') && value) {
      if (value.startsWith('data:')) imageValues.embedded++;
      else if (value.startsWith('indexeddb:')) { imageValues.indexeddbReferences++; localRefs.add(value); }
      else imageValues.externalOrOther++;
    } else if (Array.isArray(value)) value.forEach(item => visit(item));
    else if (isObject(value)) Object.entries(value).forEach(([k, v]) => visit(v, k));
  };
  visit(prs); visit(dcs);
  const duplicateGroups = (values: string[]) => {
    const counts = new Map<string, number>();
    values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
    return [...counts.values()].filter(count => count > 1).length;
  };
  const invalidPRs = prs.filter(pr => typeof pr.id !== 'string' || !pr.id.trim() || typeof pr.prNumber !== 'string' || !pr.prNumber.trim() || !Array.isArray(pr.items) || (pr.fulfillmentLogs !== undefined && !Array.isArray(pr.fulfillmentLogs))).length;
  const invalidDCs = dcs.filter(dc => typeof dc.id !== 'string' || !dc.id.trim() || typeof dc.dcNumber !== 'string' || !dc.dcNumber.trim() || !Array.isArray(dc.itemsShipped)).length;
  return {
    prCount: prs.length, dcCount: dcs.length, invalidPRs, invalidDCs,
    duplicatePRIds: duplicateGroups(prs.map(pr => typeof pr.id === 'string' ? pr.id : '')),
    duplicateDCIds: duplicateGroups(dcs.map(dc => typeof dc.id === 'string' ? dc.id : '')),
    duplicateNormalizedPRNumbers: duplicateGroups(prs.map(pr => normal(pr.prNumber))),
    duplicateNormalizedDCNumbers: duplicateGroups(dcs.map(dc => normal(dc.dcNumber))),
    danglingLinkCount: danglingLinks.length,
    danglingWithUniqueNumberMatch: danglingLinks.filter(link => link.matchingPRNumbers === 1).length,
    danglingWithAmbiguousNumberMatch: danglingLinks.filter(link => link.matchingPRNumbers > 1).length,
    danglingWithoutNumberMatch: danglingLinks.filter(link => link.matchingPRNumbers === 0).length,
    conflictingLinkNumbers: conflictingLinks.length, imageValues, uniqueIndexedDBReferences: localRefs.size, danglingLinks, conflictingLinks,
    duplicatePRNumbers: [...byNumber.values()].filter(group => group.length > 1).map(group => ({ prNumbers: group.map(pr => pr.prNumber), count: group.length }))
  };
}
