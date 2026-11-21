import { deleteApp, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, doc, getFirestore, onSnapshot, runTransaction } from 'firebase/firestore';
import type { PRRecord } from '../../types';
import { commandFingerprint, containsScan, DEMO_PROJECT, ScanReviewRequired, SyncConflict, validateCommand, type DemoCommand } from './command';

/** Test-only transport for proposed-sync.rules. Fixed to a demo project and loopback. */
export function createProposedDemoBackend(port: number) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid local emulator port.');
  const app = initializeApp({ projectId: DEMO_PROJECT, apiKey: 'demo-only', appId: 'demo-only' }, `sync-proposed-${crypto.randomUUID()}`);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', port);

  async function commit(command: DemoCommand): Promise<'committed' | 'duplicate'> {
    validateCommand(command);
    const fingerprint = await commandFingerprint(command);
    const receiptRef = doc(db, 'star_sync_actors', command.actorId, 'operations', command.operationId);
    const refs = command.mutations.map(mutation => doc(db, mutation.kind === 'PR' ? 'star_prs' : 'star_dcs', mutation.id));
    const pr = command.mutations.find(mutation => mutation.kind === 'PR');
    const dc = command.mutations.find(mutation => mutation.kind === 'DC');
    return runTransaction(db, async tx => {
      const receipt = await tx.get(receiptRef);
      if (receipt.exists()) {
        if (receipt.data().fingerprint !== fingerprint || receipt.data().actor !== command.actorId || receipt.data().op !== command.operationId) throw new SyncConflict('Operation ID was reused for a different command.');
        return 'duplicate';
      }
      const snapshots = await Promise.all(refs.map(ref => tx.get(ref)));
      const remoteRecords = snapshots.map((snapshot, index) => ({ kind: command.mutations[index].kind, id: command.mutations[index].id, data: snapshot.exists() ? snapshot.data() : null }));
      snapshots.forEach((snapshot, index) => {
        const mutation = command.mutations[index];
        if (mutation.expectedRevision === null) {
          if (snapshot.exists()) throw new SyncConflict(`${mutation.kind} already exists.`, remoteRecords);
        } else {
          const sync = snapshot.exists() ? snapshot.data()._sync : undefined;
          if (!sync || sync.rev !== mutation.expectedRevision) throw new SyncConflict(`${mutation.kind} revision changed or is not managed by this protocol.`, remoteRecords);
          if (containsScan(snapshot.data())) throw new ScanReviewRequired('Existing scan-bearing record requires review.');
        }
      });
      command.mutations.forEach((mutation, index) => tx.set(refs[index], {
        ...mutation.data, _sync: { actor: command.actorId, op: command.operationId, rev: (mutation.expectedRevision ?? 0) + 1 },
      }, { merge: true }));
      tx.set(receiptRef, { actor: command.actorId, op: command.operationId, prId: pr?.id ?? '', dcId: dc?.id ?? '', prBefore: pr?.expectedRevision ?? 0, dcBefore: dc?.expectedRevision ?? 0, fingerprint });
      return 'committed';
    });
  }
  function subscribeSyntheticPR(onUpdate: (record: PRRecord) => void, onError: (error: unknown) => void) {
    // Only the hardcoded synthetic fixture; do not adopt cached or pending snapshots as a server baseline.
    return onSnapshot(doc(db, 'star_prs', 'demo-pr-1'), { includeMetadataChanges: true }, snapshot => {
      if (!snapshot.exists() || snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      const data = snapshot.data();
      if (data.id !== 'demo-pr-1' || !Array.isArray(data.items) || !Array.isArray(data.fulfillmentLogs)) return;
      onUpdate(data as PRRecord);
    }, onError);
  }
  return { db, commit, subscribeSyntheticPR, close: () => deleteApp(app) };
}
