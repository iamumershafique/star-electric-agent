import { readFile } from 'node:fs/promises';
import { after, before, describe, it } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { assertDemoEmulatorEnvironment, requireListeningEmulators } from './emulator-safety.mjs';

// Validate project and both explicit loopback addresses before opening any connection.
const endpoints = assertDemoEmulatorEnvironment(process.env);
let env;
before(async () => {
  await requireListeningEmulators(endpoints);
  env = await initializeTestEnvironment({
    projectId: 'demo-star-electric',
    firestore: { ...endpoints[0], rules: await readFile('firestore.rules', 'utf8') },
    storage: { ...endpoints[1], rules: await readFile('storage.rules', 'utf8') },
  });
  await env.withSecurityRulesDisabled(async context => {
    await context.firestore().doc('star_prs/original').set({ prNumber: 'PR-1', items: [] });
    await context.firestore().doc('star_dcs/original').set({ dcNumber: 'DC-1', itemsShipped: [] });
    await context.firestore().doc('demo_sync_receipts/another-operation').set({ actorId: 'other-editor', fingerprint: 'synthetic' });
    await context.storage().ref('scans/original').put(new Uint8Array([1, 2]), { contentType: 'image/png' });
  });
});
after(async () => { if (env) await env.cleanup(); });

describe('Firestore PR/DC authorization', () => {
  it('denies anonymous, unassigned and unknown roles', async () => {
    const contexts = [env.unauthenticatedContext(), env.authenticatedContext('unassigned'), env.authenticatedContext('unknown', { portalRole: 'manager' })];
    for (const ctx of contexts) {
      await assertFails(ctx.firestore().doc('star_prs/original').get());
      await assertFails(ctx.firestore().doc('star_dcs/new').set({ dcNumber: 'DC-2', itemsShipped: [] }));
    }
  });
  it('lets viewers read but not create, update or delete', async () => {
    const db = env.authenticatedContext('viewer', { portalRole: 'viewer' }).firestore();
    await assertSucceeds(db.doc('star_prs/original').get());
    await assertSucceeds(db.doc('star_dcs/original').get());
    await assertFails(db.doc('star_prs/viewer-new').set({ prNumber: 'PR-2', items: [] }));
    await assertFails(db.doc('star_prs/original').update({ prNumber: 'PR-changed' }));
    await assertFails(db.doc('star_dcs/original').delete());
  });
  it('lets editors create and edit but not delete', async () => {
    const db = env.authenticatedContext('editor', { portalRole: 'editor' }).firestore();
    await assertSucceeds(db.doc('star_prs/editor-new').set({ prNumber: 'PR-2', items: [] }));
    await assertSucceeds(db.doc('star_dcs/original').update({ dcNumber: 'DC-1', siteName: 'Site' }));
    await assertFails(db.doc('star_dcs/original').delete());
    await assertFails(db.doc('star_prs/editor-new').delete());
    await assertFails(db.doc('star_prs/invalid').set({ prNumber: '', items: [] }));
    await assertFails(db.doc('private/other').set({ name: 'other' }));
  });
  it('denies operation receipts, including forged creates and changes to another actor’s receipt', async () => {
    for (const role of ['viewer', 'editor', 'admin']) {
      const db = env.authenticatedContext(`receipt-${role}`, { portalRole: role }).firestore();
      await assertFails(db.doc('demo_sync_receipts/new-operation').set({ actorId: `receipt-${role}`, fingerprint: 'synthetic' }));
      await assertFails(db.doc('demo_sync_receipts/another-operation').get());
      await assertFails(db.doc('demo_sync_receipts/another-operation').update({ actorId: `receipt-${role}` }));
      await assertFails(db.doc('demo_sync_receipts/another-operation').delete());
    }
  });
  it('lets admins delete PRs and DCs', async () => {
    const db = env.authenticatedContext('admin', { portalRole: 'admin' }).firestore();
    await assertSucceeds(db.doc('star_prs/admin-temp').set({ prNumber: 'PR-temp', items: [] }));
    await assertSucceeds(db.doc('star_prs/admin-temp').delete());
    await assertSucceeds(db.doc('star_dcs/admin-temp').set({ dcNumber: 'DC-temp', itemsShipped: [] }));
    await assertSucceeds(db.doc('star_dcs/admin-temp').delete());
  });
});

describe('Storage scan authorization', () => {
  it('denies anonymous and unassigned access', async () => {
    await assertFails(env.unauthenticatedContext().storage().ref('scans/original').getDownloadURL());
    await assertFails(env.authenticatedContext('unassigned').storage().ref('scans/original').getDownloadURL());
  });
  it('lets viewers read scans but not create or delete', async () => {
    const storage = env.authenticatedContext('viewer', { portalRole: 'viewer' }).storage();
    await assertSucceeds(storage.ref('scans/original').getDownloadURL());
    await assertFails(storage.ref('scans/viewer').put(new Uint8Array([1]), { contentType: 'image/png' }));
    await assertFails(storage.ref('scans/original').delete());
  });
  it('lets editors upload allowed scans but not delete or upload another content type', async () => {
    const storage = env.authenticatedContext('editor', { portalRole: 'editor' }).storage();
    await assertSucceeds(storage.ref('scans/editor').put(new Uint8Array([1]), { contentType: 'image/png' }));
    await assertSucceeds(storage.ref('scans/editor').put(new Uint8Array([2]), { contentType: 'application/pdf' }));
    await assertFails(storage.ref('scans/editor').delete());
    await assertFails(storage.ref('scans/executable').put(new Uint8Array([1]), { contentType: 'application/octet-stream' }));
    await assertFails(storage.ref('other/file').put(new Uint8Array([1]), { contentType: 'image/png' }));
  });
  it('lets administrators delete scans', async () => {
    const storage = env.authenticatedContext('admin', { portalRole: 'admin' }).storage();
    await assertSucceeds(storage.ref('scans/admin-temp').put(new Uint8Array([1]), { contentType: 'image/png' }));
    await assertSucceeds(storage.ref('scans/admin-temp').delete());
  });
});
