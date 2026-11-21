// @vitest-environment jsdom
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  auth: null as null | ((user: unknown) => void),
  prUpdate: null as null | ((records: unknown[], metadata: { fromCache: boolean; hasPendingWrites?: boolean; rejectedCount?: number }) => void),
  prError: null as null | ((error: unknown) => void),
  dcUpdate: null as null | ((records: unknown[], metadata: { fromCache: boolean; hasPendingWrites?: boolean; rejectedCount?: number }) => void),
  savePR: vi.fn(), saveDC: vi.fn(), deletePR: vi.fn(), deleteDC: vi.fn(),
}));
vi.mock('../src/lib/firebase', () => ({ isFirebaseConfigured: () => true, getFirebaseAuth: () => ({}) }));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'local', browserSessionPersistence: 'session',
  onIdTokenChanged: (_auth: unknown, callback: (user: unknown) => void) => { mocks.auth = callback; return () => { mocks.auth = null; }; },
  getIdTokenResult: vi.fn(async () => ({ claims: { portalRole: 'admin' } })),
  setPersistence: vi.fn(), signInWithEmailAndPassword: vi.fn(), signOut: vi.fn(),
}));
vi.mock('../src/lib/imageStorage', () => ({
  initImageMemory: vi.fn(async () => 0), getImageFromMemorySync: vi.fn(), saveImageToMemory: vi.fn(),
  normalizeImageKey: (type: string, value: string) => `${type}_${value}`,
}));
vi.mock('../src/lib/firestoreService', () => ({
  subscribeToCloudPRs: (update: typeof mocks.prUpdate, error: typeof mocks.prError) => { mocks.prUpdate = update; mocks.prError = error; return () => {}; },
  subscribeToCloudDCs: (update: typeof mocks.dcUpdate) => { mocks.dcUpdate = update; return () => {}; },
  savePRToCloud: mocks.savePR, saveDCToCloud: mocks.saveDC, deletePRFromCloud: mocks.deletePR, deleteDCFromCloud: mocks.deleteDC,
}));
import { AppProvider, useApp } from '../src/context/AppContext';
import { CloudSyncBanner } from '../src/components/CloudSyncBanner';
import { saveImageToMemory } from '../src/lib/imageStorage';
const pr = { id: 'p1', prNumber: 'PR-1', date: '2026-01-01', siteName: 'Fixture', status: 'Pending' as const, items: [], fulfillmentLogs: [], createdTimestamp: 1 };
const dc = { id: 'd1', dcNumber: 'DC-1', invoiceNumber: 'DC-1', prNumber: '', prId: '', date: '2026-01-01', siteName: 'Fixture', itemsShipped: [], createdTimestamp: 1 };
function Probe() {
  const { addNewPR, updateExistingPR, updateDC, pushAllToCloud, prs, recordDeliveryChallan } = useApp();
  const [bulkError, setBulkError] = useState('');
  return <><CloudSyncBanner/><span data-testid="pr-numbers">{prs.map(p => p.prNumber).join(',')}</span><button onClick={() => addNewPR(pr)}>Add PR</button><button onClick={() => updateExistingPR({ ...pr, siteName: 'Changed locally' }, prs.find(p => p.id === pr.id) || pr)}>Edit PR</button><button onClick={() => updateExistingPR({ ...pr, siteName: 'Stale edit' }, pr)}>Stale edit</button>
    <button onClick={() => updateDC({ ...dc, siteName: 'Stale edit' }, dc)}>Stale DC edit</button>
    <button onClick={() => void pushAllToCloud().catch((e: Error) => setBulkError(e.message))}>Bulk</button><span>{bulkError}</span>
    <button onClick={() => recordDeliveryChallan({ dcNumber: 'DC-1', invoiceNumber: 'DC-1', prNumber: 'PR-1', prId: 'p1', date: '2026-01-02', siteName: 'Fixture', itemsShipped: [] }, { i1: 12 })}>Record overdelivery</button></>;
}
async function start() { render(<AppProvider><Probe /></AppProvider>); await act(async () => { mocks.auth?.({ email: 'staff@example.com' }); }); }

describe('cloud warning integration', () => {
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear(); mocks.auth = null; mocks.prUpdate = null; mocks.prError = null; mocks.dcUpdate = null;
    mocks.savePR.mockReset(); mocks.saveDC.mockReset(); mocks.deletePR.mockReset(); mocks.deleteDC.mockReset();
    mocks.savePR.mockResolvedValue(undefined); mocks.saveDC.mockResolvedValue(undefined);
    vi.mocked(saveImageToMemory).mockClear();
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });
  it('shows a failed cloud write even when the caller swallows the rejection', async () => {
    mocks.savePR.mockRejectedValue(new Error('permission denied'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await start(); act(() => screen.getByRole('button', { name: 'Add PR' }).click());
    await waitFor(() => expect(screen.getByText(/Save PR PR-1: failed/)).toBeTruthy());
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toContain('PR-1');
  });
  it('shows pending while an offline write never receives confirmation', async () => {
    mocks.savePR.mockImplementation(() => new Promise<void>(() => {}));
    await start(); act(() => screen.getByRole('button', { name: 'Add PR' }).click());
    expect(screen.getByText(/Save PR PR-1: awaiting cloud confirmation/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Acknowledge' })).toBeNull();
  });
  it('surfaces listener failures and does not clear them for a cached snapshot', async () => {
    await start();
    act(() => mocks.prError?.(new Error('listener stopped')));
    expect(screen.getByText(/Live PR updates stopped: failed/)).toBeTruthy();
    act(() => mocks.prUpdate?.([], { fromCache: true }));
    expect(screen.getByText(/Live PR updates stopped: failed/)).toBeTruthy();
    act(() => mocks.prUpdate?.([], { fromCache: false }));
    await waitFor(() => expect(screen.queryByText(/Live PR updates stopped: failed/)).toBeNull());
  });
  it('preserves differing local PRs and exposes the conflict instead of overwriting them', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([{ ...pr, siteName: 'Local Site' }]));
    await start();
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Remote Site' }], { fromCache: false }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Local Site');
    expect(screen.getByText(/PR PR-1: local and cloud details differ/)).toBeTruthy();
  });
  it('refreshes an unchanged local PR after a later authoritative server update', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    await start();
    act(() => mocks.prUpdate?.([pr], { fromCache: false }));
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Updated remotely' }], { fromCache: false }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Updated remotely');
    expect(screen.queryByText(/PR PR-1: local and cloud details differ/)).toBeNull();
  });
  it('retains a synthetic remote scan reference on refresh when this device has none', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    await start();
    act(() => mocks.prUpdate?.([pr], { fromCache: false }));
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Updated remotely', documentImage: 'indexeddb:unresolved-synthetic' }], { fromCache: false }));
    const record = JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0];
    expect(record.documentImage).toBe('indexeddb:unresolved-synthetic');
    expect(record.siteName).toBe('Updated remotely');
  });
  it('rejects a stale open PR edit after the cache has refreshed', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    await start();
    act(() => mocks.prUpdate?.([pr], { fromCache: false }));
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Updated remotely' }], { fromCache: false }));
    act(() => screen.getByRole('button', { name: 'Stale edit' }).click());
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('changed while it was open'));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Updated remotely');
    expect(mocks.savePR).not.toHaveBeenCalled();
  });
  it('preserves an unsynced local edit when another device changes the same PR', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    mocks.savePR.mockImplementation(() => new Promise<void>(() => {}));
    await start();
    act(() => mocks.prUpdate?.([pr], { fromCache: false }));
    act(() => screen.getByRole('button', { name: 'Edit PR' }).click());
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Changed remotely' }], { fromCache: false }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Changed locally');
    expect(screen.getByText(/PR PR-1: local and cloud details differ/)).toBeTruthy();
  });
  it('refreshes an unchanged local DC after a later server update and rejects an old form', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('STAR_ELECTRIC_DCS_V2', JSON.stringify([dc]));
    await start();
    act(() => mocks.dcUpdate?.([dc], { fromCache: false }));
    act(() => mocks.dcUpdate?.([{ ...dc, siteName: 'Updated remotely' }], { fromCache: false }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_DCS_V2')!)[0].siteName).toBe('Updated remotely');
    act(() => screen.getByRole('button', { name: 'Stale DC edit' }).click());
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('changed while it was open'));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_DCS_V2')!)[0].siteName).toBe('Updated remotely');
    expect(mocks.saveDC).not.toHaveBeenCalled();
  });
  it('does not replace local data from pending or incomplete server updates', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    await start();
    act(() => mocks.prUpdate?.([pr], { fromCache: false }));
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Pending' }], { fromCache: false, hasPendingWrites: true }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Fixture');
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Incomplete' }], { fromCache: false, rejectedCount: 1 }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Fixture');
    // An invalid snapshot invalidates the old baseline; a later one must not overwrite the cache.
    act(() => mocks.prUpdate?.([{ ...pr, siteName: 'After incomplete' }], { fromCache: false }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Fixture');
  });
  it('blocks ordinary cloud writes for a known conflict while preserving the local edit', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([{ ...pr, siteName: 'Local Site' }]));
    await start(); act(() => mocks.prUpdate?.([{ ...pr, siteName: 'Remote Site' }], { fromCache: false }));
    expect(screen.getByText(/PR PR-1: local and cloud details differ/)).toBeTruthy();
    act(() => screen.getByRole('button', { name: 'Edit PR' }).click());
    await waitFor(() => expect(screen.getByText(/Save PR PR-1: failed/)).toBeTruthy());
    expect(mocks.savePR).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].siteName).toBe('Changed locally');
  });
  it('does not call a snapshot with pending writes authoritative', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    await start(); act(() => mocks.prUpdate?.([], { fromCache: false, hasPendingWrites: true }));
    expect(screen.queryByText(/PR PR-1: not in current server snapshot/)).toBeNull();
    act(() => mocks.prUpdate?.([], { fromCache: false, hasPendingWrites: false }));
    expect(screen.getByText(/PR PR-1: not in current server snapshot/)).toBeTruthy();
  });
  it('preserves local DCs when an empty authoritative cloud snapshot arrives', async () => {
    const dc = { id: 'd1', dcNumber: 'DC-1', invoiceNumber: 'DC-1', prNumber: '', prId: '', date: '2026-01-01', siteName: 'Site', itemsShipped: [], createdTimestamp: 1 };
    localStorage.setItem('STAR_ELECTRIC_DCS_V2', JSON.stringify([dc]));
    await start(); act(() => mocks.dcUpdate?.([], { fromCache: false }));
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_DCS_V2')!)).toHaveLength(1);
    expect(screen.getByText(/DC DC-1: not in current server snapshot/)).toBeTruthy();
  });
  it('shows distinct cloud records even when their numbers match a local record', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    await start(); act(() => mocks.prUpdate?.([{ ...pr, id: 'p2' }], { fromCache: true }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)).toHaveLength(2));
    expect(screen.getByText(/same number belongs to different IDs/)).toBeTruthy();
  });
  it('does not re-upload hydrated local scans when adding cloud-only records to the cache', async () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([{ ...pr, documentImage: 'data:image/png;base64,YQ==' }]));
    await start(); act(() => mocks.prUpdate?.([{ ...pr, id: 'p2', prNumber: 'PR-2' }], { fromCache: true }));
    await waitFor(() => expect(saveImageToMemory).toHaveBeenCalled());
    expect(vi.mocked(saveImageToMemory).mock.calls[0][3]).toMatchObject({ uploadToCloud: false });
  });
  it('reports a failed local cache save without deleting pending images', async () => {
    await start(); localStorage.setItem('star_electric_pending_image', 'important');
    const real = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (this === localStorage && key === 'STAR_ELECTRIC_PRS_V2') throw new DOMException('Quota', 'QuotaExceededError');
      return real.call(this, key, value);
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => screen.getByRole('button', { name: 'Add PR' }).click());
    await waitFor(() => expect(screen.getByText(/A local ledger save failed/)).toBeTruthy());
    expect(localStorage.getItem('star_electric_pending_image')).toBe('important');
    expect(screen.getByTestId('pr-numbers').textContent).toContain('PR-1');
  });
  it('displays pending and failed scan uploads plus local scan persistence failures', async () => {
    await start(); let reject!: (error: Error) => void;
    const upload = new Promise<void>((_, rej) => { reject = rej; });
    act(() => window.dispatchEvent(new CustomEvent('star-ledger-scan-upload', { detail: { key: 'dc_dc_1', upload } })));
    expect(screen.getByText(/Upload scan dc_dc_1: awaiting cloud confirmation/)).toBeTruthy();
    await act(async () => reject(new Error('storage rules denied')));
    expect(screen.getByText(/Upload scan dc_dc_1: failed/)).toBeTruthy();
    act(() => window.dispatchEvent(new Event('star-ledger-scan-save-failed')));
    expect(screen.getByText(/A scan could not be saved in this browser/)).toBeTruthy();
  });
  it('requires confirmation and preserves the actual overdelivered quantity when accepted', async () => {
    const record = { ...pr, items: [{ id: 'i1', name: 'Cable', brand: 'Pakistan Cables', unit: 'm', requestedQty: 10, fulfilledQty: 0, status: 'Pending' }] };
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([record]));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await start(); act(() => screen.getByRole('button', { name: 'Record overdelivery' }).click());
    expect(confirm).toHaveBeenCalledOnce(); expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBeNull();
    expect(mocks.saveDC).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    act(() => screen.getByRole('button', { name: 'Record overdelivery' }).click());
    await waitFor(() => expect(mocks.saveDC).toHaveBeenCalledOnce());
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_DCS_V2')!)[0].itemsShipped[0].quantity).toBe(12);
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].items[0].fulfilledQty).toBe(12);
  });
  it('blocks the unsafe bulk push rather than reporting success', async () => {
    await start(); act(() => screen.getByRole('button', { name: 'Bulk' }).click());
    await waitFor(() => expect(screen.getByText(/Bulk push is disabled/)).toBeTruthy());
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
});
