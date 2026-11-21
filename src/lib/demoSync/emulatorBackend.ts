import { deleteApp, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, doc, getFirestore, runTransaction } from 'firebase/firestore';
import { commandFingerprint, containsScan, DEMO_PROJECT, ScanReviewRequired, SyncConflict, validateCommand, type DemoCommand } from './command';

/**
 * LOCAL EMULATOR ONLY. Never accepts a production Firebase app, project or host.
 * This prototype needs an atomic receipt collection; current portal rules deny it.
 */
export function createDemoEmulatorBackend(port: number) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid local emulator port.');
  const app = initializeApp({ projectId: DEMO_PROJECT, apiKey: 'demo-only', appId: 'demo-only' }, `sync-demo-${crypto.randomUUID()}`);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', port);

  async function commit(command: DemoCommand): Promise<'committed' | 'duplicate'> {
    validateCommand(command);
    const fingerprint = await commandFingerprint(command);
    const receiptRef = doc(db, 'demo_sync_receipts', command.operationId);
    const recordRefs = command.mutations.map(mutation => doc(db, mutation.kind === 'PR' ? 'star_prs' : 'star_dcs', mutation.id));
    return runTransaction(db, async transaction => {
      const receipt = await transaction.get(receiptRef);
      if (receipt.exists()) {
        if (receipt.data().fingerprint !== fingerprint || receipt.data().actorId !== command.actorId) throw new SyncConflict('Operation ID was reused for a different command.');
        return 'duplicate';
      }
      // Firestore requires all reads before writes. Both documents and the receipt share one transaction.
      const snapshots = await Promise.all(recordRefs.map(ref => transaction.get(ref)));
      const remoteRecords = snapshots.map((snapshot, index) => ({
        kind: command.mutations[index].kind, id: command.mutations[index].id,
        data: snapshot.exists() ? snapshot.data() : null
      }));
      snapshots.forEach((snapshot, index) => {
        const mutation = command.mutations[index];
        if (mutation.expectedRevision === null) {
          if (snapshot.exists()) throw new SyncConflict(`${mutation.kind} already exists.`, remoteRecords);
        } else {
          if (!snapshot.exists() || snapshot.data()._syncRevision !== mutation.expectedRevision) throw new SyncConflict(`${mutation.kind} revision changed or is not managed by this protocol.`, remoteRecords);
          // Never overwrite scan fields, including nested scan data in arrays. This is a
          // deliberate blocker until scan-aware reconciliation is designed and tested.
          if (containsScan(snapshot.data())) throw new ScanReviewRequired('Existing scan-bearing record requires review.');
        }
      });
      command.mutations.forEach((mutation, index) => {
        transaction.set(recordRefs[index], { ...mutation.data, _syncRevision: (mutation.expectedRevision ?? 0) + 1 }, { merge: true });
      });
      transaction.set(receiptRef, { actorId: command.actorId, fingerprint });
      return 'committed';
    });
  }
  return { db, commit, close: () => deleteApp(app) };
}
