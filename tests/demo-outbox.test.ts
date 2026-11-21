import { afterEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { DemoOutbox } from '../src/lib/demoSync/outbox';
import { startDemoRetryWorker } from '../src/lib/demoSync/runner';
import type { DemoCommand } from '../src/lib/demoSync/command';

const command = (operationId: string): DemoCommand => ({ operationId, actorId: 'demo-user', mutations: [
  { kind: 'PR', id: 'p1', expectedRevision: 1, data: { id: 'p1', prNumber: 'PR-SYNTHETIC', items: [] } },
  { kind: 'DC', id: 'd1', expectedRevision: null, data: { id: 'd1', dcNumber: 'DC-SYNTHETIC', prId: 'p1', prNumber: 'PR-SYNTHETIC', itemsShipped: [] } },
] });
const name = () => `star-sync-demo-${crypto.randomUUID()}`;
const unavailable = () => Object.assign(new Error('offline'), { code: 'unavailable' });
afterEach(() => vi.useRealTimers());

describe('durable synthetic outbox', () => {
  it('persists a frozen operation across reopen, and rejects reused operation IDs', async () => {
    const db = name(); const original = command('op-frozen');
    let outbox = await DemoOutbox.open(db, 'demo-user');
    await outbox.enqueue(original); original.mutations[0].data.prNumber = 'CHANGED';
    outbox.close(); outbox = await DemoOutbox.open(db, 'demo-user');
    expect((await outbox.list())[0].command.mutations[0].data.prNumber).toBe('PR-SYNTHETIC');
    await outbox.enqueue(command('op-frozen'));
    expect(await outbox.list()).toHaveLength(1);
    const collision = command('op-frozen'); collision.mutations[0].data.siteName = 'different';
    await expect(outbox.enqueue(collision)).rejects.toMatchObject({ code: 'sync/conflict' });
    expect(await outbox.list()).toHaveLength(1);
    outbox.close();
  });
  it('retains operations and applies backoff to transient failures across restarts', async () => {
    let now = 100; const db = name(); let outbox = await DemoOutbox.open(db, 'demo-user', () => now);
    await outbox.enqueue(command('op-offline'));
    expect(await outbox.processOne(async () => { throw unavailable(); })).toBe('retry');
    outbox.close(); outbox = await DemoOutbox.open(db, 'demo-user', () => now);
    const commit = vi.fn(async () => {});
    expect(await outbox.processOne(commit)).toBe('waiting');
    now += 1000;
    expect(await outbox.processOne(commit)).toBe('acknowledged');
    expect((await outbox.list())[0]).toMatchObject({ state: 'acknowledged', attempts: 2 });
    expect(commit).toHaveBeenCalledOnce(); outbox.close();
  });
  it('retains conflicts and prevents later operations overtaking them', async () => {
    const outbox = await DemoOutbox.open(name(), 'demo-user');
    await outbox.enqueue(command('op-first')); await outbox.enqueue(command('op-second'));
    const failure = vi.fn(async () => { throw Object.assign(new Error('revision conflict'), { code: 'sync/conflict' }); });
    expect(await outbox.processOne(failure)).toBe('blocked');
    expect(await outbox.processOne(failure)).toBe('blocked');
    expect((await outbox.list()).map(entry => entry.state)).toEqual(['conflict', 'pending']);
    expect(failure).toHaveBeenCalledOnce(); outbox.close();
  });
  it('retains permission failures rather than reporting success or retrying indefinitely', async () => {
    const outbox = await DemoOutbox.open(name(), 'demo-user');
    await outbox.enqueue(command('op-denied'));
    expect(await outbox.processOne(async () => { throw Object.assign(new Error('denied'), { code: 'permission-denied' }); })).toBe('blocked');
    expect((await outbox.list())[0].state).toBe('rejected');
    expect(await outbox.processOne(async () => {})).toBe('blocked'); outbox.close();
  });
  it('atomically reserves the linked PR against concurrent demo submissions', async () => {
    const db = name(); const first = await DemoOutbox.open(db, 'demo-user'); const second = await DemoOutbox.open(db, 'demo-user');
    const other = command('op-reserve-b'); other.mutations[1].id = 'd2'; other.mutations[1].data.id = 'd2'; other.mutations[1].data.dcNumber = 'DC-OTHER';
    const results = await Promise.allSettled([first.enqueueExclusive(command('op-reserve-a')), second.enqueueExclusive(other)]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
    expect(await first.list()).toHaveLength(1); first.close(); second.close();
  });
  it('prevents simultaneous workers from executing the same active lease', async () => {
    const db = name(); const first = await DemoOutbox.open(db, 'demo-user'); const second = await DemoOutbox.open(db, 'demo-user');
    await first.enqueue(command('op-lease'));
    let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
    let started!: () => void; const running = new Promise<void>(resolve => { started = resolve; });
    const task = first.processOne(async () => { started(); await gate; });
    await running;
    const competing = vi.fn(async () => {});
    expect(await second.processOne(competing)).toBe('waiting'); expect(competing).not.toHaveBeenCalled();
    release(); expect(await task).toBe('acknowledged');
    first.close(); second.close();
  });
  it('allows an expired lease to recover without an old worker undoing the acknowledgement', async () => {
    let now = 100; const db = name();
    const first = await DemoOutbox.open(db, 'demo-user', () => now); const second = await DemoOutbox.open(db, 'demo-user', () => now);
    await first.enqueue(command('op-expired'));
    let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
    let started!: () => void; const running = new Promise<void>(resolve => { started = resolve; });
    const task = first.processOne(async () => { started(); await gate; }); await running;
    now += 30_001;
    expect(await second.processOne(async () => {})).toBe('acknowledged');
    release(); expect(await task).toBe('waiting');
    expect((await second.list())[0].state).toBe('acknowledged'); first.close(); second.close();
  });
  it('durably retains a legacy edit for review without interpreting an unknown revision as a create', async () => {
    const db = name(); let outbox = await DemoOutbox.open(db, 'demo-user');
    const draft = command('op-legacy-review');
    draft.mutations[0].expectedRevision = null;
    draft.mutations[0].data.documentImage = 'indexeddb:unresolved-synthetic';
    await outbox.enqueueForReview(draft, 'legacy-review');
    outbox.close(); outbox = await DemoOutbox.open(db, 'demo-user');
    const [entry] = await outbox.list();
    expect(entry.state).toBe('legacy-review');
    expect(entry.command.mutations[0].data.documentImage).toBe('indexeddb:unresolved-synthetic');
    const commit = vi.fn(async () => {});
    expect(await outbox.processOne(commit)).toBe('blocked'); expect(commit).not.toHaveBeenCalled();
    outbox.close();
  });
  it('never processes a different actor’s queued operation', async () => {
    const db = name(); const first = await DemoOutbox.open(db, 'demo-user');
    await first.enqueue(command('op-other-actor')); first.close();
    const second = await DemoOutbox.open(db, 'other-demo-user'); const commit = vi.fn(async () => {});
    expect(await second.processOne(commit)).toBe('blocked'); expect(commit).not.toHaveBeenCalled();
    expect((await second.list())[0].state).toBe('pending'); second.close();
  });
  it('refuses scan-bearing operations without touching the existing scan store', async () => {
    const scanName = `synthetic-scan-${crypto.randomUUID()}`;
    const request = indexedDB.open(scanName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('scans');
    const scanDb = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const tx = scanDb.transaction('scans', 'readwrite'); tx.objectStore('scans').put('synthetic-image-bytes', 'scan-1');
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    const outbox = await DemoOutbox.open(name(), 'demo-user');
    const op = command('op-with-scan'); op.mutations[0].data.documentImage = 'indexeddb:scan-1';
    await expect(outbox.enqueue(op)).rejects.toMatchObject({ code: 'sync/scan-review' });
    expect(await outbox.list()).toEqual([]);
    const read = scanDb.transaction('scans', 'readonly').objectStore('scans').get('scan-1');
    expect(await new Promise(resolve => { read.onsuccess = () => resolve(read.result); })).toBe('synthetic-image-bytes');
    outbox.close(); scanDb.close();
  });
  it('automatically retries an offline command when the online event fires', async () => {
    let now = 0; const outbox = await DemoOutbox.open(name(), 'demo-user', () => now);
    await outbox.enqueue(command('op-worker'));
    let attempts = 0; let finished!: () => void;
    const success = new Promise<void>(resolve => { finished = resolve; });
    const events = new EventTarget();
    const stop = startDemoRetryWorker(outbox, async () => { attempts++; if (attempts === 1) throw unavailable(); finished(); }, { intervalMs: 10_000, onlineEvents: events });
    // Wait until the first failed transaction has been durably recorded.
    await vi.waitFor(async () => expect((await outbox.list())[0].state).toBe('retry'));
    now = 1000; events.dispatchEvent(new Event('online')); await success;
    await vi.waitFor(async () => expect((await outbox.list())[0].state).toBe('acknowledged'));
    stop(); outbox.close(); expect(attempts).toBe(2);
  });
});
