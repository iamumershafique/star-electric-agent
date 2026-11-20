import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ configured: false, db: null as null | object, setDoc: vi.fn(), deleteDoc: vi.fn(), onSnapshot: vi.fn() }));
vi.mock('../src/lib/firebase', () => ({ getFirestoreDb: () => mock.db, isFirestoreConfigured: () => mock.configured }));
vi.mock('firebase/firestore', () => ({ collection: vi.fn(() => ({})), doc: vi.fn(() => ({})),
  setDoc: mock.setDoc, deleteDoc: mock.deleteDoc, onSnapshot: mock.onSnapshot }));
import { savePRToCloud, saveDCToCloud, deletePRFromCloud, deleteDCFromCloud, subscribeToCloudPRs } from '../src/lib/firestoreService';
const pr = { id: 'p1', prNumber: 'PR-1', date: '', siteName: '', status: 'Pending' as const, items: [], fulfillmentLogs: [], createdTimestamp: 1 };
const dc = { id: 'd1', dcNumber: 'DC-1', invoiceNumber: 'DC-1', prNumber: '', prId: '', date: '', siteName: '', itemsShipped: [], createdTimestamp: 1 };
describe('Firestore failures', () => {
  beforeEach(() => { mock.configured = false; mock.db = null; mock.setDoc.mockReset(); mock.deleteDoc.mockReset(); mock.onSnapshot.mockReset(); vi.restoreAllMocks(); });
  it('rejects writes and deletes instead of pretending success when Firestore is unavailable', async () => {
    await expect(savePRToCloud(pr)).rejects.toThrow(/not available/i);
    await expect(saveDCToCloud(dc)).rejects.toThrow(/not available/i);
    await expect(deletePRFromCloud('p1')).rejects.toThrow(/not available/i);
    await expect(deleteDCFromCloud('d1')).rejects.toThrow(/not available/i);
    expect(mock.setDoc).not.toHaveBeenCalled();
  });
  it('passes cache metadata along with snapshots so a cached result is not treated as server recovery', () => {
    mock.db = {}; mock.configured = true;
    mock.onSnapshot.mockImplementation((_ref, update) => {
      update({ metadata: { fromCache: true }, forEach: () => {} });
      return () => {};
    });
    const update = vi.fn();
    subscribeToCloudPRs(update, vi.fn());
    expect(update).toHaveBeenCalledWith([], { fromCache: true });
  });
  it('propagates rejected Firebase writes to the caller', async () => {
    mock.db = {}; mock.configured = true; mock.setDoc.mockRejectedValue(new Error('rules rejected write'));
    await expect(savePRToCloud(pr)).rejects.toThrow('rules rejected write');
  });
  it('exposes listener failures instead of only logging them', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onError = vi.fn();
    expect(subscribeToCloudPRs(vi.fn(), onError)).toBeNull();
    expect(onError).toHaveBeenCalledOnce();
    mock.db = {}; mock.configured = true;
    mock.onSnapshot.mockImplementation((_ref, _update, failure) => { failure(new Error('permission denied')); return () => {}; });
    subscribeToCloudPRs(vi.fn(), onError);
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
