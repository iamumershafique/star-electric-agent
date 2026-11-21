// Official emulator tests for the separate experimental rules; synthetic fixtures only.
import { readFile } from 'node:fs/promises';
import { after, before, describe, it } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { assertDemoEmulatorEnvironment, requireListeningEmulators } from './emulator-safety.mjs';
const endpoints = assertDemoEmulatorEnvironment(process.env);
let env;
const fingerprint = 'a'.repeat(64);
const marker = (actor, op, rev) => ({ actor, op, rev });
const receipt = (actor, op, prId, dcId, prBefore, dcBefore) => ({ actor, op, prId, dcId, prBefore, dcBefore, fingerprint });
const user = (id, role = 'editor') => env.authenticatedContext(id, { portalRole: role }).firestore();
const refs = (db, actor, op, pr, dc) => ({ receipt: db.doc(`star_sync_actors/${actor}/operations/${op}`), pr: db.doc(`star_prs/${pr}`), dc: db.doc(`star_dcs/${dc}`) });
const p = (actor, op, rev, quantity = 0) => ({ id: 'p', prNumber: 'PR-SYNTHETIC', items: [{ fulfilledQty: quantity }], fulfillmentLogs: [], _sync: marker(actor, op, rev) });
const d = (actor, op, rev, quantity = 0) => ({ id: 'd', dcNumber: 'DC-SYNTHETIC', prId: 'p', itemsShipped: [{ quantity }], _sync: marker(actor, op, rev) });
before(async () => {
  await requireListeningEmulators(endpoints);
  env = await initializeTestEnvironment({ projectId: 'demo-star-electric', firestore: { ...endpoints[0], rules: await readFile('rules-tests/proposed-sync.rules', 'utf8') } });
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await db.doc('star_prs/p').set({ ...p('seed', 'seed-pr', 1), documentImage: 'indexeddb:synthetic-unresolved' });
    await db.doc('star_dcs/d').set({ ...d('seed', 'seed-dc', 1), documentImage: 'indexeddb:synthetic-dc' });
    await db.doc('star_prs/legacy').set({ prNumber: 'PR-LEGACY', items: [] });
  });
});
after(async () => { if (env) await env.cleanup(); });

describe('experimental transactional rules (official emulator)', () => {
  it('permits viewer reads but denies writes', async () => {
    const db = user('viewer', 'viewer');
    await assertSucceeds(db.doc('star_prs/p').get());
    await assertFails(db.doc('star_prs/p').update({ prNumber: 'forbidden' }));
    await assertFails(db.doc('star_dcs/d').delete());
  });
  it('permits an editor single PR creation with its own matching receipt', async () => {
    const db = user('editor'); const op = 'create-single'; const batch = db.batch();
    batch.set(db.doc('star_prs/new-pr'), { id: 'new-pr', prNumber: 'PR-NEW', items: [], _sync: marker('editor', op, 1) });
    batch.set(db.doc(`star_sync_actors/editor/operations/${op}`), receipt('editor', op, 'new-pr', '', 0, 0));
    await assertSucceeds(batch.commit());
    await assertFails(db.doc('star_prs/new-pr').delete());
  });
  it('rejects direct stale writes, forged receipts, and partial linked updates', async () => {
    const db = user('editor');
    await assertFails(db.doc('star_prs/p').update({ prNumber: 'STALE' }));
    await assertFails(db.doc('star_sync_actors/other/operations/forged').set(receipt('other', 'forged', 'p', 'd', 1, 1)));
    await assertFails(db.doc('star_sync_actors/editor/operations/empty').set(receipt('editor', 'empty', 'p', 'd', 1, 1)));
    const { receipt: rr, pr } = refs(db, 'editor', 'partial', 'p', 'd');
    const batch = db.batch();
    batch.update(pr, { items: [{ fulfilledQty: 4 }], _sync: marker('editor', 'partial', 2) });
    batch.set(rr, receipt('editor', 'partial', 'p', 'd', 1, 1));
    await assertFails(batch.commit());
  });
  it('denies adoption of legacy records without trusted revision', async () => {
    const db = user('editor'); const batch = db.batch(); const op = 'legacy';
    batch.update(db.doc('star_prs/legacy'), { _sync: marker('editor', op, 1) });
    batch.set(db.doc(`star_sync_actors/editor/operations/${op}`), receipt('editor', op, 'legacy', '', 0, 0));
    await assertFails(batch.commit());
  });
  it('accepts both records and one actor-bound receipt together and keeps scans', async () => {
    const db = user('editor'); const op = 'linked'; const { receipt: rr, pr, dc } = refs(db, 'editor', op, 'p', 'd');
    const batch = db.batch();
    batch.update(pr, { items: [{ fulfilledQty: 4 }], _sync: marker('editor', op, 2) });
    batch.update(dc, { itemsShipped: [{ quantity: 4 }], _sync: marker('editor', op, 2) });
    batch.set(rr, receipt('editor', op, 'p', 'd', 1, 1));
    await assertSucceeds(batch.commit());
    const snapPR = await assertSucceeds(pr.get()); const snapDC = await assertSucceeds(dc.get());
    if (snapPR.data().items[0].fulfilledQty !== 4 || snapDC.data().itemsShipped[0].quantity !== 4) throw new Error('Synthetic quantities differ.');
    if (snapPR.data().documentImage !== 'indexeddb:synthetic-unresolved' || snapDC.data().documentImage !== 'indexeddb:synthetic-dc') throw new Error('Synthetic scan reference lost.');
    await assertFails(rr.update({ fingerprint: 'b'.repeat(64) }));
    await assertFails(rr.delete());
    await assertFails(user('other').doc(`star_sync_actors/editor/operations/${op}`).get());
  });
  it('rejects deleting scan references even with matching revision and receipt', async () => {
    const db = user('editor'); const op = 'erase-scan'; const { receipt: rr, pr, dc } = refs(db, 'editor', op, 'p', 'd');
    const batch = db.batch();
    batch.set(pr, p('editor', op, 3, 5));
    batch.update(dc, { _sync: marker('editor', op, 3) });
    batch.set(rr, receipt('editor', op, 'p', 'd', 2, 2));
    await assertFails(batch.commit());
  });
  it('allows admin deletion but not editor deletion', async () => {
    await assertFails(user('editor').doc('star_dcs/d').delete());
    await assertSucceeds(user('admin', 'admin').doc('star_dcs/d').delete());
  });
});
