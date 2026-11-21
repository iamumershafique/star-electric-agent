import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createServer, createConnection } from 'node:net';
import 'fake-indexeddb/auto';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { createDemoEmulatorBackend } from '../src/lib/demoSync/emulatorBackend';
import { createProposedDemoBackend } from '../src/lib/demoSync/proposedBackend';
import { DemoOutbox } from '../src/lib/demoSync/outbox';
import { SyncConflict, type DemoCommand } from '../src/lib/demoSync/command';
import { prepareDemoDelivery, prepareDemoPREdit, syntheticPR } from '../src/lib/demoSync/deliveryDemo';
import { assertDemoEmulatorEnvironment } from '../rules-tests/emulator-safety.mjs';

type Backend = ReturnType<typeof createDemoEmulatorBackend>;
let child: ChildProcess;
let backend: Backend;
let proposed: ReturnType<typeof createProposedDemoBackend>;
let emulatorPort: number;
async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}
async function waitForPort(port: number): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Local demo emulator exited: ${child.exitCode}`);
    const open = await new Promise<boolean>(resolve => {
      const socket = createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => { socket.destroy(); resolve(true); });
      socket.once('error', () => resolve(false));
    });
    if (open) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Local demo emulator did not start.');
}
const command = (id: string, prId: string, dcId: string, expectedRevision: number | null, value = 1): DemoCommand => ({
  operationId: id, actorId: 'demo-user', mutations: [
    { kind: 'PR', id: prId, expectedRevision, data: { id: prId, prNumber: 'PR-SYNTHETIC', items: [{ id: 'i', fulfilledQty: value }], fulfillmentLogs: [] } },
    { kind: 'DC', id: dcId, expectedRevision, data: { id: dcId, dcNumber: `DC-${dcId}`, prId, prNumber: 'PR-SYNTHETIC', itemsShipped: [{ itemId: 'i', quantity: value }] } },
  ]
});

beforeAll(async () => {
  // Reject conflicting project or non-loopback emulator configuration even though the
  // backend itself constructs a fixed demo app and explicitly connects to loopback.
  assertDemoEmulatorEnvironment({ ...process.env,
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:1',
    FIREBASE_STORAGE_EMULATOR_HOST: process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:1',
  });
  const port = await freePort();
  emulatorPort = port;
  // This non-Google emulator supports synthetic local tests; it does NOT implement Firebase Security Rules.
  child = spawn('node_modules/.bin/hidane', ['--host', '127.0.0.1', '--port', String(port), '--project_id', 'demo-star-electric', '--single_project_mode', 'true', '--single_project_mode_error', 'true'], { stdio: 'ignore' });
  await waitForPort(port);
  backend = createDemoEmulatorBackend(port);
  proposed = createProposedDemoBackend(port);
}, 15_000);
afterAll(async () => {
  if (backend) await backend.close();
  if (proposed) await proposed.close();
  if (child && child.exitCode === null) child.kill('SIGTERM');
});

describe('proposed receipt shape on a synthetic emulator (rules not enforced)', () => {
  it('seeds the fixed fixture only once and never overwrites an existing synthetic record', async () => {
    const env = { PATH: process.env.PATH, VITE_LINKED_DELIVERY_DEMO: 'true', VITE_FIREBASE_PROJECT_ID: 'demo-star-electric', VITE_DEMO_FIRESTORE_ENDPOINT: `127.0.0.1:${emulatorPort}` };
    const first = spawnSync(process.execPath, ['scripts/seed-demo-delivery.mjs'], { env, encoding: 'utf8', timeout: 10_000 });
    expect(first.status, first.stderr).toBe(0);
    expect((await getDoc(doc(proposed.db, 'star_prs', 'demo-pr-1'))).data()).toEqual(syntheticPR(''));
    await setDoc(doc(proposed.db, 'star_prs', 'demo-pr-1'), { siteName: 'Synthetic changed' }, { merge: true });
    const again = spawnSync(process.execPath, ['scripts/seed-demo-delivery.mjs'], { env, encoding: 'utf8', timeout: 10_000 });
    expect(again.status, again.stderr).toBe(0);
    expect((await getDoc(doc(proposed.db, 'star_prs', 'demo-pr-1'))).data()?.siteName).toBe('Synthetic changed');
    const rejected = spawnSync(process.execPath, ['scripts/seed-demo-delivery.mjs'], { env: { ...env, VITE_FIREBASE_PROJECT_ID: 'not-demo' }, encoding: 'utf8', timeout: 10_000 });
    expect(rejected.status).not.toBe(0);
  });
  it('enforces revision five against a stale PR edit across outbox restart', async () => {
    const base = { ...syntheticPR(''), notes: 'Initial', _sync: { actor: 'seed', op: 'seed', rev: 5 } };
    await setDoc(doc(proposed.db, 'star_prs', base.id), base);
    const a = prepareDemoPREdit({ ...base, notes: 'A wins' }, base, 'pr-rev-five-a');
    const b = prepareDemoPREdit({ ...base, notes: 'B draft' }, base, 'pr-rev-five-b');
    const nameA = `star-sync-demo-${crypto.randomUUID()}`;
    const nameB = `star-sync-demo-${crypto.randomUUID()}`;
    const boxA = await DemoOutbox.open(nameA, 'demo-user');
    let boxB = await DemoOutbox.open(nameB, 'demo-user');
    await boxA.enqueueExclusive(a.command); await boxB.enqueueExclusive(b.command);
    expect(await boxA.processOne(proposed.commit)).toBe('acknowledged');
    expect(await boxB.processOne(proposed.commit)).toBe('blocked');
    let stored = (await getDoc(doc(proposed.db, 'star_prs', base.id))).data()!;
    expect(stored.notes).toBe('A wins'); expect(stored._sync.rev).toBe(6);
    const conflict = (await boxB.list())[0];
    expect(conflict.state).toBe('conflict'); expect(conflict.command.mutations[0].data.notes).toBe('B draft');
    expect(conflict.conflictRecords?.[0].data?.notes).toBe('A wins');
    boxB.close(); boxB = await DemoOutbox.open(nameB, 'demo-user');
    expect(await boxB.processOne(proposed.commit)).toBe('blocked');
    stored = (await getDoc(doc(proposed.db, 'star_prs', base.id))).data()!;
    expect(stored.notes).toBe('A wins'); expect(stored._sync.rev).toBe(6);
    boxA.close(); boxB.close();
  });
  it('preserves an omitted scan in a draft and holds it for review', () => {
    const base = syntheticPR('scan');
    const updated = { ...base }; delete updated.documentImage;
    const prepared = prepareDemoPREdit(updated, base, 'pr-scan-preserve');
    expect(prepared.review).toBe('scan-review');
    expect(prepared.command.mutations[0].data.documentImage).toBe(base.documentImage);
  });
  it('retries the prepared form command after a lost acknowledgement without applying a delivery twice', async () => {
    const fixture = syntheticPR();
    await setDoc(doc(proposed.db, 'star_prs', fixture.id), fixture);
    const prepared = prepareDemoDelivery([fixture], [], {
      dcNumber: 'DC-DEMO-RETRY', invoiceNumber: 'DC-DEMO-RETRY', prId: fixture.id, prNumber: fixture.prNumber,
      date: '2026-01-02', siteName: fixture.siteName, itemsShipped: [],
    }, { 'demo-item-1': 4 }, 'op-prepared-retry');
    expect(prepared.review).toBeNull();
    let now = 1000; const dbName = `star-sync-demo-${crypto.randomUUID()}`;
    let outbox = await DemoOutbox.open(dbName, 'demo-user', () => now);
    await outbox.enqueueExclusive(prepared.command);
    expect(await outbox.processOne(async cmd => { await proposed.commit(cmd); throw Object.assign(new Error('acknowledgement lost'), { code: 'unavailable' }); })).toBe('retry');
    outbox.close(); outbox = await DemoOutbox.open(dbName, 'demo-user', () => now); now += 1000;
    expect(await outbox.processOne(proposed.commit)).toBe('acknowledged');
    const entry = (await outbox.list())[0]; expect(entry.command.operationId).toBe('op-prepared-retry');
    const pr = (await getDoc(doc(proposed.db, 'star_prs', fixture.id))).data()!;
    const dcMutation = prepared.command.mutations.find(m => m.kind === 'DC')!;
    const dc = (await getDoc(doc(proposed.db, 'star_dcs', dcMutation.id))).data()!;
    expect(pr.items[0].fulfilledQty).toBe(4); expect(pr.fulfillmentLogs).toHaveLength(1);
    expect(dc.itemsShipped[0].quantity).toBe(4); expect(pr._sync.rev).toBe(2); expect(dc._sync.rev).toBe(1);
    const matches = await getDocs(query(collection(proposed.db, 'star_dcs'), where('dcNumber', '==', 'DC-DEMO-RETRY')));
    expect(matches.size).toBe(1);
    outbox.close();
  });
  it('supports an individual PR with an actor-scoped immutable receipt', async () => {
    const op: DemoCommand = { operationId: 'new-single', actorId: 'actor-one', mutations: [{ kind: 'PR', id: 'single-pr', expectedRevision: null, data: { id: 'single-pr', prNumber: 'PR-SINGLE', items: [] } }] };
    expect(await proposed.commit(op)).toBe('committed');
    expect(await proposed.commit(op)).toBe('duplicate');
    const record = (await getDoc(doc(proposed.db, 'star_prs', 'single-pr'))).data()!;
    const receipt = (await getDoc(doc(proposed.db, 'star_sync_actors', 'actor-one', 'operations', 'new-single'))).data()!;
    expect(record._sync).toEqual({ actor: 'actor-one', op: 'new-single', rev: 1 });
    expect(receipt).toMatchObject({ actor: 'actor-one', op: 'new-single', prId: 'single-pr', dcId: '', prBefore: 0, dcBefore: 0 });
  });
  it('writes a linked pair with one receipt and refuses a stale retry under a different ID', async () => {
    await proposed.commit(command('new-create', 'new-pr', 'new-dc', null, 1));
    await proposed.commit(command('new-edit', 'new-pr', 'new-dc', 1, 4));
    await expect(proposed.commit(command('new-stale', 'new-pr', 'new-dc', 1, 6))).rejects.toBeInstanceOf(SyncConflict);
    expect(await proposed.commit(command('new-edit', 'new-pr', 'new-dc', 1, 4))).toBe('duplicate');
    const pr = (await getDoc(doc(proposed.db, 'star_prs', 'new-pr'))).data()!;
    const dc = (await getDoc(doc(proposed.db, 'star_dcs', 'new-dc'))).data()!;
    expect(pr._sync.rev).toBe(2); expect(dc._sync.rev).toBe(2);
    expect(pr.items[0].fulfilledQty).toBe(4); expect(dc.itemsShipped[0].quantity).toBe(4);
    expect((await getDoc(doc(proposed.db, 'star_sync_actors', 'demo-user', 'operations', 'new-stale'))).exists()).toBe(false);
  });
});

describe('synthetic local Firestore emulator: transactional protocol', () => {
  it('commits linked PR, DC and receipt atomically, then recognizes an identical retry', async () => {
    const op = command('op-atomic', 'pr-atomic', 'dc-atomic', null);
    expect(await backend.commit(op)).toBe('committed');
    expect(await backend.commit(op)).toBe('duplicate');
    expect((await getDoc(doc(backend.db, 'star_prs', 'pr-atomic'))).data()?._syncRevision).toBe(1);
    expect((await getDoc(doc(backend.db, 'star_dcs', 'dc-atomic'))).data()?._syncRevision).toBe(1);
    expect((await getDoc(doc(backend.db, 'demo_sync_receipts', 'op-atomic'))).exists()).toBe(true);
    await expect(backend.commit({ ...op, mutations: command('op-atomic', 'pr-atomic', 'dc-atomic', null, 3).mutations })).rejects.toBeInstanceOf(SyncConflict);
  });
  it('does not reapply an old operation after a later committed edit', async () => {
    const first = command('op-replay-original', 'pr-replay', 'dc-replay', null);
    await backend.commit(first);
    await backend.commit(command('op-replay-next', 'pr-replay', 'dc-replay', 1, 4));
    expect(await backend.commit(first)).toBe('duplicate');
    const pr = (await getDoc(doc(backend.db, 'star_prs', 'pr-replay'))).data()!;
    const dc = (await getDoc(doc(backend.db, 'star_dcs', 'dc-replay'))).data()!;
    expect(pr._syncRevision).toBe(2); expect(dc._syncRevision).toBe(2);
    expect(pr.items[0].fulfilledQty).toBe(4); expect(dc.itemsShipped[0].quantity).toBe(4);
  });
  it('does not automatically adopt an existing unversioned legacy record', async () => {
    await setDoc(doc(backend.db, 'star_prs', 'pr-legacy'), { id: 'pr-legacy', prNumber: 'PR-SYNTHETIC', items: [] });
    const op = command('op-legacy', 'pr-legacy', 'dc-legacy', 1);
    op.mutations[1].expectedRevision = null;
    await expect(backend.commit(op)).rejects.toBeInstanceOf(SyncConflict);
    expect((await getDoc(doc(backend.db, 'star_dcs', 'dc-legacy'))).exists()).toBe(false);
    expect((await getDoc(doc(backend.db, 'demo_sync_receipts', 'op-legacy'))).exists()).toBe(false);
  });
  it('rejects one stale member without writing either member or receipt', async () => {
    await backend.commit(command('op-create-conflict', 'pr-conflict', 'dc-conflict', null));
    const update = command('op-stale', 'pr-conflict', 'dc-conflict', 1, 2);
    update.mutations[1].expectedRevision = 9;
    await expect(backend.commit(update)).rejects.toBeInstanceOf(SyncConflict);
    expect((await getDoc(doc(backend.db, 'star_prs', 'pr-conflict'))).data()?._syncRevision).toBe(1);
    expect((await getDoc(doc(backend.db, 'star_dcs', 'dc-conflict'))).data()?._syncRevision).toBe(1);
    expect((await getDoc(doc(backend.db, 'demo_sync_receipts', 'op-stale'))).exists()).toBe(false);
  });
  it('allows only one of two simultaneous edits based on the same revisions', async () => {
    await backend.commit(command('op-concurrent-create', 'pr-concurrent', 'dc-concurrent', null));
    const results = await Promise.allSettled([
      backend.commit(command('op-concurrent-a', 'pr-concurrent', 'dc-concurrent', 1, 2)),
      backend.commit(command('op-concurrent-b', 'pr-concurrent', 'dc-concurrent', 1, 3)),
    ]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    const pr = (await getDoc(doc(backend.db, 'star_prs', 'pr-concurrent'))).data()!;
    const dc = (await getDoc(doc(backend.db, 'star_dcs', 'dc-concurrent'))).data()!;
    expect(pr._syncRevision).toBe(2); expect(dc._syncRevision).toBe(2);
    expect(pr.items[0].fulfilledQty).toBe(dc.itemsShipped[0].quantity);
  });
  it('retains the submitted and server versions in the outbox after a conflict and reopen', async () => {
    await backend.commit(command('op-review-create', 'pr-review', 'dc-review', null));
    await backend.commit(command('op-review-remote', 'pr-review', 'dc-review', 1, 4));
    const name = `star-sync-demo-${crypto.randomUUID()}`;
    let outbox = await DemoOutbox.open(name, 'demo-user');
    await outbox.enqueue(command('op-review-local', 'pr-review', 'dc-review', 1, 2));
    expect(await outbox.processOne(backend.commit)).toBe('blocked');
    outbox.close(); outbox = await DemoOutbox.open(name, 'demo-user');
    const [entry] = await outbox.list();
    expect(entry.state).toBe('conflict');
    expect((entry.command.mutations[0].data.items as Array<{ fulfilledQty: number }>)[0].fulfilledQty).toBe(2);
    expect((entry.conflictRecords![0].data!.items as Array<{ fulfilledQty: number }>)[0].fulfilledQty).toBe(4);
    expect(entry.conflictRecords![1].data?._syncRevision).toBe(2);
    outbox.close();
  });
  it('refuses to modify existing scan-bearing data and preserves both records', async () => {
    await backend.commit(command('op-scan-create', 'pr-scan', 'dc-scan', null));
    await setDoc(doc(backend.db, 'star_prs', 'pr-scan'), { documentImage: 'indexeddb:demo-scan' }, { merge: true });
    await expect(backend.commit(command('op-scan-update', 'pr-scan', 'dc-scan', 1, 2))).rejects.toMatchObject({ code: 'sync/scan-review' });
    expect((await getDoc(doc(backend.db, 'star_prs', 'pr-scan'))).data()?.documentImage).toBe('indexeddb:demo-scan');
    expect((await getDoc(doc(backend.db, 'star_dcs', 'dc-scan'))).data()?._syncRevision).toBe(1);
  });
  it('recovers an expired in-flight lease after a commit and simulated abrupt page closure', async () => {
    let now = 1000; const name = `star-sync-demo-${crypto.randomUUID()}`;
    const op = command('op-crash', 'pr-crash', 'dc-crash', null);
    const first = await DemoOutbox.open(name, 'demo-user', () => now);
    await first.enqueue(op);
    let saved!: () => void; const committed = new Promise<void>(resolve => { saved = resolve; });
    let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
    const abandoned = first.processOne(async cmd => { await backend.commit(cmd); saved(); await gate; }).catch(error => error);
    await committed;
    // Simulate a page dying after the server committed, before its IndexedDB acknowledgement.
    first.close(); now += 30_001;
    const reopened = await DemoOutbox.open(name, 'demo-user', () => now);
    expect(await reopened.processOne(backend.commit)).toBe('acknowledged');
    expect((await reopened.list())[0].state).toBe('acknowledged');
    expect((await getDoc(doc(backend.db, 'star_prs', 'pr-crash'))).data()?._syncRevision).toBe(1);
    expect((await getDoc(doc(backend.db, 'star_dcs', 'dc-crash'))).data()?._syncRevision).toBe(1);
    release(); await abandoned; reopened.close();
  });
  it('recovers from a lost acknowledgement after closing and reopening its durable queue', async () => {
    let now = 1000;
    const name = `star-sync-demo-${crypto.randomUUID()}`;
    const op = command('op-restart', 'pr-restart', 'dc-restart', null);
    let outbox = await DemoOutbox.open(name, 'demo-user', () => now);
    await outbox.enqueue(op);
    expect(await outbox.processOne(async cmd => { await backend.commit(cmd); throw Object.assign(new Error('lost acknowledgement'), { code: 'unavailable' }); })).toBe('retry');
    outbox.close();
    outbox = await DemoOutbox.open(name, 'demo-user', () => now);
    expect(await outbox.processOne(backend.commit)).toBe('waiting');
    now += 1000;
    expect(await outbox.processOne(backend.commit)).toBe('acknowledged');
    expect((await outbox.list())[0].attempts).toBe(2);
    expect((await getDoc(doc(backend.db, 'star_prs', 'pr-restart'))).data()?._syncRevision).toBe(1);
    expect((await getDoc(doc(backend.db, 'star_dcs', 'dc-restart'))).data()?._syncRevision).toBe(1);
    outbox.close();
  });
});
