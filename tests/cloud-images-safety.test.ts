import { beforeEach, describe, expect, it, vi } from 'vitest';
const cloud = vi.hoisted(() => ({ configured: true, app: {} as object | null, upload: vi.fn() }));
vi.mock('../src/lib/firebase', () => ({ getFirebaseApp: () => cloud.app, isFirebaseConfigured: () => cloud.configured }));
vi.mock('firebase/storage', () => ({ getStorage: vi.fn(() => ({})), ref: vi.fn(() => ({})), uploadString: cloud.upload, getDownloadURL: vi.fn() }));
import { uploadScanToCloud } from '../src/lib/cloudImages';
beforeEach(() => { cloud.configured = true; cloud.app = {}; cloud.upload.mockReset(); });
describe('cloud scan writes', () => {
  it('propagates errors rather than claiming upload success', async () => {
    cloud.upload.mockRejectedValue(new Error('storage permission denied'));
    await expect(uploadScanToCloud('dc_1', 'data:image/png;base64,YQ==')).rejects.toThrow('storage permission denied');
    cloud.configured = false;
    await expect(uploadScanToCloud('dc_1', 'data:image/png;base64,YQ==')).rejects.toThrow(/unavailable/i);
    await expect(uploadScanToCloud('dc_1', 'https://example.org/scan')).rejects.toThrow(/requires image data/i);
  });
});
