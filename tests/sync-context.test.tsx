// @vitest-environment jsdom
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  auth: null as null | ((user: unknown) => void),
  prUpdate: null as null | ((records: unknown[], metadata: { fromCache: boolean }) => void),
  prError: null as null | ((error: unknown) => void),
  savePR: vi.fn(), saveDC: vi.fn(), deletePR: vi.fn(), deleteDC: vi.fn(),
}));
vi.mock('../src/lib/firebase', () => ({ isFirebaseConfigured: () => true, getFirebaseAuth: () => ({}) }));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'local', browserSessionPersistence: 'session',
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => { mocks.auth = callback; return () => { mocks.auth = null; }; },
  setPersistence: vi.fn(), signInWithEmailAndPassword: vi.fn(), signOut: vi.fn(),
}));
vi.mock('../src/lib/imageStorage', () => ({
  initImageMemory: vi.fn(async () => 0), getImageFromMemorySync: vi.fn(), saveImageToMemory: vi.fn(),
  normalizeImageKey: (type: string, value: string) => `${type}_${value}`,
}));
vi.mock('../src/lib/firestoreService', () => ({
  subscribeToCloudPRs: (update: typeof mocks.prUpdate, error: typeof mocks.prError) => { mocks.prUpdate = update; mocks.prError = error; return () => {}; },
  subscribeToCloudDCs: () => () => {},
  savePRToCloud: mocks.savePR, saveDCToCloud: mocks.saveDC, deletePRFromCloud: mocks.deletePR, deleteDCFromCloud: mocks.deleteDC,
}));
import { AppProvider, useApp } from '../src/context/AppContext';
import { CloudSyncBanner } from '../src/components/CloudSyncBanner';
const pr = { id: 'p1', prNumber: 'PR-1', date: '2026-01-01', siteName: 'Fixture', status: 'Pending' as const, items: [], fulfillmentLogs: [], createdTimestamp: 1 };
function Probe() {
  const { addNewPR, pushAllToCloud, prs, recordDeliveryChallan } = useApp();
  const [bulkError, setBulkError] = useState('');
  return <><CloudSyncBanner/><span data-testid="pr-numbers">{prs.map(p => p.prNumber).join(',')}</span><button onClick={() => addNewPR(pr)}>Add PR</button>
    <button onClick={() => void pushAllToCloud().catch((e: Error) => setBulkError(e.message))}>Bulk</button><span>{bulkError}</span>
    <button onClick={() => recordDeliveryChallan({ dcNumber: 'DC-1', invoiceNumber: 'DC-1', prNumber: 'PR-1', prId: 'p1', date: '2026-01-02', siteName: 'Fixture', itemsShipped: [] }, { i1: 12 })}>Record overdelivery</button></>;
}
function start() { render(<AppProvider><Probe /></AppProvider>); act(() => mocks.auth?.({ email: 'staff@example.com' })); }

describe('cloud warning integration', () => {
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear(); mocks.auth = null; mocks.prUpdate = null; mocks.prError = null;
    mocks.savePR.mockReset(); mocks.saveDC.mockReset(); mocks.deletePR.mockReset(); mocks.deleteDC.mockReset();
    mocks.savePR.mockResolvedValue(undefined); mocks.saveDC.mockResolvedValue(undefined);
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });
  it('shows a failed cloud write even when the caller swallows the rejection', async () => {
    mocks.savePR.mockRejectedValue(new Error('permission denied'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    start(); act(() => screen.getByRole('button', { name: 'Add PR' }).click());
    await waitFor(() => expect(screen.getByText(/Save PR PR-1: failed/)).toBeTruthy());
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toContain('PR-1');
  });
  it('shows pending while an offline write never receives confirmation', async () => {
    mocks.savePR.mockImplementation(() => new Promise<void>(() => {}));
    start(); act(() => screen.getByRole('button', { name: 'Add PR' }).click());
    expect(screen.getByText(/Save PR PR-1: awaiting cloud confirmation/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Acknowledge' })).toBeNull();
  });
  it('surfaces listener failures and does not clear them for a cached snapshot', async () => {
    start();
    act(() => mocks.prError?.(new Error('listener stopped')));
    expect(screen.getByText(/Live PR updates stopped: failed/)).toBeTruthy();
    act(() => mocks.prUpdate?.([], { fromCache: true }));
    expect(screen.getByText(/Live PR updates stopped: failed/)).toBeTruthy();
    act(() => mocks.prUpdate?.([], { fromCache: false }));
    await waitFor(() => expect(screen.queryByText(/Live PR updates stopped: failed/)).toBeNull());
  });
  it('reports a failed local cache save without deleting pending images', async () => {
    start(); localStorage.setItem('star_electric_pending_image', 'important');
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
  it('requires confirmation and preserves the actual overdelivered quantity when accepted', async () => {
    const record = { ...pr, items: [{ id: 'i1', name: 'Cable', brand: 'Pakistan Cables', unit: 'm', requestedQty: 10, fulfilledQty: 0, status: 'Pending' }] };
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([record]));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    start(); act(() => screen.getByRole('button', { name: 'Record overdelivery' }).click());
    expect(confirm).toHaveBeenCalledOnce(); expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBeNull();
    expect(mocks.saveDC).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    act(() => screen.getByRole('button', { name: 'Record overdelivery' }).click());
    await waitFor(() => expect(mocks.saveDC).toHaveBeenCalledOnce());
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_DCS_V2')!)[0].itemsShipped[0].quantity).toBe(12);
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)[0].items[0].fulfilledQty).toBe(12);
  });
  it('blocks the unsafe bulk push rather than reporting success', async () => {
    start(); act(() => screen.getByRole('button', { name: 'Bulk' }).click());
    await waitFor(() => expect(screen.getByText(/Bulk push is disabled/)).toBeTruthy());
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
});
