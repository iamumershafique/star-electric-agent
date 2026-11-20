// @vitest-environment jsdom
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const cloud = vi.hoisted(() => ({ configured: true, upload: vi.fn(), get: vi.fn() }));
vi.mock('../src/lib/firebase', () => ({ isFirebaseConfigured: () => cloud.configured }));
vi.mock('../src/lib/cloudImages', () => ({ uploadScanToCloud: cloud.upload, getScanUrlFromCloud: cloud.get }));
beforeEach(() => {
  vi.resetModules(); cloud.configured = true; cloud.upload.mockReset().mockResolvedValue(undefined); cloud.get.mockReset();
  Object.defineProperty(window, 'indexedDB', { configurable: true, value: new IDBFactory() });
});
afterEach(() => vi.restoreAllMocks());
describe('scan persistence and upload warnings', () => {
  it('exposes the upload promise so failures can be tracked independently of the local save', async () => {
    const { saveImageToMemory, getAllStoredImages } = await import('../src/lib/imageStorage');
    let reject!: (error: Error) => void;
    cloud.upload.mockReturnValue(new Promise<void>((_, rej) => { reject = rej; }));
    const listener = vi.fn(); window.addEventListener('star-ledger-scan-upload', listener);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await saveImageToMemory('dc', 'DC-1', 'data:image/png;base64,YQ==');
      expect((await getAllStoredImages())).toHaveLength(1);
      expect(listener).toHaveBeenCalledOnce();
      const detail = (listener.mock.calls[0][0] as CustomEvent<{ key: string; upload: Promise<void> }>).detail;
      expect(detail.key).toBe('dc_dc_1');
      reject(new Error('permission denied'));
      await expect(detail.upload).rejects.toThrow('permission denied');
    } finally { window.removeEventListener('star-ledger-scan-upload', listener); }
  });
  it('emits a warning when local IndexedDB is unavailable', async () => {
    Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });
    cloud.configured = false;
    const { saveImageToMemory } = await import('../src/lib/imageStorage');
    const listener = vi.fn(); window.addEventListener('star-ledger-scan-save-failed', listener);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    try { await saveImageToMemory('pr', 'PR-1', 'data:image/png;base64,YQ=='); await Promise.resolve(); expect(listener).toHaveBeenCalledOnce(); expect(cloud.upload).not.toHaveBeenCalled(); }
    finally { window.removeEventListener('star-ledger-scan-save-failed', listener); }
  });
  it('does not upload local scans as a side effect of snapshot cache persistence', async () => {
    const { saveImageToMemory } = await import('../src/lib/imageStorage');
    await saveImageToMemory('pr', 'PR-1', 'data:image/png;base64,YQ==', { uploadToCloud: false });
    expect(cloud.upload).not.toHaveBeenCalled();
  });
});
