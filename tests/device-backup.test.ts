// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cloud = vi.hoisted(() => ({ upload: vi.fn(async () => {}), get: vi.fn(async () => undefined) }));
vi.mock('../src/lib/cloudImages', () => ({ uploadScanToCloud: cloud.upload, getScanUrlFromCloud: cloud.get }));

const pr = { id: 'pr-1', prNumber: 'PR-1', date: '2026-01-01', siteName: 'Test', status: 'Pending' as const,
  items: [], fulfillmentLogs: [], createdTimestamp: 1, documentImage: 'indexeddb:pr_pr_1' };
const dc = { id: 'dc-1', dcNumber: 'DC-1', invoiceNumber: 'DC-1', prId: 'pr-1', prNumber: 'PR-1',
  date: '2026-01-02', siteName: 'Test', itemsShipped: [], createdTimestamp: 2,
  documentImage: 'https://example.com/external-scan.jpg' };

async function freshProfile() {
  vi.resetModules();
  Object.defineProperty(window, 'indexedDB', { configurable: true, value: new IDBFactory() });
  localStorage.clear();
  const images = await import('../src/lib/imageStorage');
  const backup = await import('../src/lib/deviceBackup');
  return { images, backup };
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
  cloud.upload.mockClear(); cloud.get.mockClear();
});

describe('portable device backup', () => {
  it('restores local PRs, DCs, links and stored scans in an isolated clean profile without cloud writes', async () => {
    const source = await freshProfile();
    await source.images.saveImageToMemory('pr', 'PR-1', 'data:image/png;base64,aGVsbG8=', { referenceNumber: 'PR-1' });
    const { json, summary } = await source.backup.createDeviceBackup([pr], [dc]);
    expect(summary).toEqual({ prs: 1, dcs: 1, localScans: 1, missingLocalReferences: 0, externalReferences: 1 });
    cloud.upload.mockClear();
    const target = await freshProfile();
    const verified = await target.backup.verifyDeviceBackup(json);
    await target.backup.restoreDeviceBackup(verified.payload);
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0]).toEqual(pr);
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_DCS_V2')!)[0]).toEqual(dc);
    expect((await target.images.getAllStoredImages())[0]).toMatchObject({ id: 'pr_pr_1', dataUrl: 'data:image/png;base64,aGVsbG8=' });
    expect(cloud.upload).not.toHaveBeenCalled();
    expect(cloud.get).not.toHaveBeenCalled();
  });

  it('moves inline scans to IndexedDB references before restoring records', async () => {
    const source = await freshProfile();
    const inlinePR = { ...pr, documentImage: 'data:image/png;base64,aW5saW5l' };
    const { json, summary } = await source.backup.createDeviceBackup([inlinePR], [dc]);
    expect(summary.localScans).toBe(1);
    const target = await freshProfile();
    const { payload } = await target.backup.verifyDeviceBackup(json);
    await target.backup.restoreDeviceBackup(payload);
    const stored = JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0];
    expect(stored.documentImage).toMatch(/^indexeddb:/);
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).not.toContain('data:image');
    expect((await target.images.getAllStoredImages())[0].dataUrl).toBe(inlinePR.documentImage);
  });

  it('detects tampering and missing local image references', async () => {
    const { backup } = await freshProfile();
    const { json, summary } = await backup.createDeviceBackup([pr], [dc]);
    expect(summary.missingLocalReferences).toBe(1);
    const changed = JSON.parse(json);
    changed.payload.prs[0].prNumber = 'PR-tampered';
    await expect(backup.verifyDeviceBackup(JSON.stringify(changed))).rejects.toThrow(/checksum/i);
    await expect(backup.verifyDeviceBackup('{bad json')).rejects.toThrow(/JSON/i);
    await expect(backup.verifyDeviceBackup(JSON.stringify({ version: '1.0', prs: [pr], dcs: [dc] }))).rejects.toThrow(/unsupported/i);
  });

  it('refuses to overwrite an existing cache or image store', async () => {
    const { backup, images } = await freshProfile();
    const { json } = await backup.createDeviceBackup([pr], [dc]);
    const { payload } = await backup.verifyDeviceBackup(json);
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', '[]');
    await expect(backup.restoreDeviceBackup(payload)).rejects.toThrow(/not empty/i);
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe('[]');
    localStorage.removeItem('STAR_ELECTRIC_PRS_V2');
    await images.saveImageToMemory('pr', 'other', 'data:image/png;base64,YQ==');
    await expect(backup.restoreDeviceBackup(payload)).rejects.toThrow(/not empty/i);
    expect((await images.getAllStoredImages())).toHaveLength(1);
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBeNull();
  });

  it('rolls back imported images and records when local storage runs out of space', async () => {
    const source = await freshProfile();
    await source.images.saveImageToMemory('pr', 'PR-1', 'data:image/png;base64,aGVsbG8=', { referenceNumber: 'PR-1' });
    const { json } = await source.backup.createDeviceBackup([pr], [dc]);
    const target = await freshProfile();
    const { payload } = await target.backup.verifyDeviceBackup(json);
    const original = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (key === 'STAR_ELECTRIC_DCS_V2') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    });
    try {
      await expect(target.backup.restoreDeviceBackup(payload)).rejects.toThrow();
      expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBeNull();
      expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBeNull();
      expect(await target.images.getAllStoredImages()).toEqual([]);
    } finally { spy.mockRestore(); }
  });
});
