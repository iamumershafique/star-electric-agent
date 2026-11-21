import type { DCRecord, PRRecord } from '../../types';
import { prepareDCAndFulfillPR } from '../storage';
import { containsScan, DEMO_PROJECT, type DemoCommand } from './command';
import type { QueueEntry } from './outbox';

export const DEMO_ACTOR = 'demo-user';
export const demoRequested = () => import.meta.env.VITE_LINKED_DELIVERY_DEMO === 'true';
export function demoConfig(env: { DEV: boolean; VITE_FIREBASE_PROJECT_ID?: string; VITE_DEMO_FIRESTORE_ENDPOINT?: string; VITE_DEMO_FIXTURE?: string }, hostname: string) {
  if (!env.DEV || env.VITE_FIREBASE_PROJECT_ID !== DEMO_PROJECT) throw new Error('Demo delivery requires a development build and demo-star-electric project.');
  if (!['127.0.0.1', 'localhost', '[::1]', '::1'].includes(hostname)) throw new Error('Demo delivery requires a loopback browser origin.');
  const match = /^127\.0\.0\.1:([0-9]{1,5})$/.exec(env.VITE_DEMO_FIRESTORE_ENDPOINT || '');
  const port = match ? Number(match[1]) : 0;
  if (!port || port > 65535) throw new Error('Demo delivery requires a 127.0.0.1 Firestore emulator endpoint and valid port.');
  const fixture = env.VITE_DEMO_FIXTURE || '';
  if (!['', 'legacy', 'scan'].includes(fixture)) throw new Error('Unknown synthetic demo fixture.');
  return { port, databaseName: `star-sync-demo-linked-${port}${fixture ? `-${fixture}` : ''}` };
}

/** Synthetic fixture only. Seed the demo emulator with this exact record before syncing. */
export function syntheticPR(fixture = import.meta.env?.VITE_DEMO_FIXTURE): PRRecord {
  const record = {
    id: 'demo-pr-1', prNumber: 'PR-DEMO-1', date: '2026-01-01', siteName: 'Synthetic Site', status: 'Pending', createdTimestamp: 1,
    items: [{ id: 'demo-item-1', name: 'Synthetic Cable', brand: 'Pakistan Cables', unit: 'Meters', requestedQty: 10, fulfilledQty: 0, status: 'Pending' }],
    fulfillmentLogs: [], _sync: { actor: 'demo-seed', op: 'demo-seed', rev: 1 },
  } as PRRecord & { _sync?: { actor: string; op: string; rev: number } };
  if (fixture === 'legacy') delete record._sync;
  if (fixture === 'scan') record.documentImage = 'indexeddb:synthetic-unresolved';
  return record;
}

function jsonRecord(value: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

/** Preserve existing scan fields when a new snapshot or edit omits them; never migrate scans. */
export function preserveDemoScans(previous: PRRecord, next: PRRecord): PRRecord {
  const copy = { ...next } as PRRecord & Record<string, unknown>;
  const old = previous as PRRecord & Record<string, unknown>;
  for (const field of ['documentImage', 'prDocumentImage', 'builtyImage']) {
    if (old[field] !== undefined && old[field] !== null && old[field] !== '' && (copy[field] === undefined || copy[field] === null || copy[field] === '')) copy[field] = old[field];
  }
  copy.fulfillmentLogs = next.fulfillmentLogs.map(log => {
    const existing = previous.fulfillmentLogs.find(item => item.id === log.id);
    return existing?.builtyImage && !log.builtyImage ? { ...log, builtyImage: existing.builtyImage } : log;
  });
  return copy;
}

/** Prepare an edit using the form-open baseline, never the latest live snapshot. */
export function prepareDemoPREdit(updated: PRRecord, base: PRRecord, operationId: string) {
  if (!base.id || updated.id !== base.id) throw new Error('The synthetic PR edit does not match its original record.');
  const source = jsonRecord(base);
  const marker = source._sync as { rev?: unknown } | undefined;
  const revision = marker && Number.isSafeInteger(marker.rev) && Number(marker.rev) > 0 ? Number(marker.rev) : null;
  const data = jsonRecord(preserveDemoScans(base, updated)); delete data._sync; delete data._syncRevision;
  const command: DemoCommand = { operationId, actorId: DEMO_ACTOR, mutations: [{ kind: 'PR', id: base.id, expectedRevision: revision, data }] };
  const review = containsScan(source) || containsScan(data) ? 'scan-review' : revision === null ? 'legacy-review' : null;
  return { command, review } as const;
}

export function prepareDemoDelivery(prs: PRRecord[], dcs: DCRecord[], dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>, fulfillmentMap: Record<string, number>, operationId: string) {
  const original = prs.find(pr => pr.id === dcData.prId);
  if (!original) throw new Error('Select the synthetic PR before saving this demo delivery.');
  const prepared = prepareDCAndFulfillPR(prs, dcs, dcData, fulfillmentMap, { allowOverdelivery: true });
  if (!prepared.changedPR) throw new Error('The demo path requires a linked delivery that changes a PR quantity.');
  const nextPR = prepared.updatedPRs.find(pr => pr.id === original.id)!;
  const source = jsonRecord(original);
  const marker = source._sync as { rev?: unknown } | undefined;
  const revision = marker && Number.isSafeInteger(marker.rev) && Number(marker.rev) > 0 ? Number(marker.rev) : null;
  const prData = jsonRecord(nextPR); delete prData._sync; delete prData._syncRevision;
  const dcRecord = jsonRecord(prepared.newDC); delete dcRecord._sync; delete dcRecord._syncRevision;
  const command: DemoCommand = { operationId, actorId: DEMO_ACTOR, mutations: [
    { kind: 'PR', id: original.id, expectedRevision: revision, data: prData },
    { kind: 'DC', id: prepared.newDC.id, expectedRevision: null, data: dcRecord },
  ] };
  const review = containsScan(source) || containsScan(prData) || containsScan(dcRecord) ? 'scan-review' : revision === null ? 'legacy-review' : null;
  return { command, review } as const;
}

/** Restore the demo-only view from the durable queue, never from the portal cache. */
export function projectDemoQueue(entries: QueueEntry[], serverPR?: PRRecord): { prs: PRRecord[]; dcs: DCRecord[] } {
  let prs = [serverPR || syntheticPR()];
  let dcs: DCRecord[] = [];
  for (const entry of entries) {
    if (entry.state === 'conflict') {
      const remote = entry.conflictRecords?.find(record => record.kind === 'PR' && record.id === 'demo-pr-1')?.data;
      if (remote && !serverPR) prs = [preserveDemoScans(prs[0], remote as unknown as PRRecord)];
      continue;
    }
    if (entry.state === 'legacy-review' || entry.state === 'scan-review' || entry.state === 'rejected') continue;
    for (const mutation of entry.command.mutations) {
      if (mutation.kind === 'PR') {
        const current = prs.find(pr => pr.id === mutation.id);
        const currentSync = current ? (current as PRRecord & { _sync?: { rev?: number } })._sync : undefined;
        const resultRevision = (mutation.expectedRevision ?? 0) + 1;
        // A later authoritative server version must not be replaced by an older acknowledgement.
        if (typeof currentSync?.rev === 'number' && (entry.state === 'acknowledged' ? currentSync.rev >= resultRevision : currentSync.rev > (mutation.expectedRevision ?? 0))) continue;
        // Unsynced edits keep their original expected revision; only an acknowledgement advances it.
        const revision = entry.state === 'acknowledged' ? resultRevision : mutation.expectedRevision;
        const candidate = { ...mutation.data, _sync: { actor: entry.command.actorId, op: entry.command.operationId, rev: revision } } as unknown as PRRecord;
        const record = current ? preserveDemoScans(current, candidate) : candidate;
        prs = [...prs.filter(pr => pr.id !== mutation.id), record];
      } else {
        const record = { ...mutation.data, _sync: { actor: entry.command.actorId, op: entry.command.operationId, rev: (mutation.expectedRevision ?? 0) + 1 } } as unknown as DCRecord;
        dcs = [...dcs.filter(dc => dc.id !== mutation.id), record];
      }
    }
  }
  return { prs, dcs };
}
