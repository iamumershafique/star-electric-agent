// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  configured: true,
  listener: null as null | ((user: unknown) => void),
  persistence: vi.fn(),
  role: 'admin' as string | null,
  token: vi.fn(),
}));
vi.mock('../src/lib/firebase', () => ({
  isFirebaseConfigured: () => mocks.configured,
  getFirebaseAuth: () => mocks.configured ? {} : null,
}));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'local', browserSessionPersistence: 'session',
  onIdTokenChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    mocks.listener = callback;
    return () => { mocks.listener = null; };
  },
  getIdTokenResult: mocks.token,
  setPersistence: mocks.persistence,
  signInWithEmailAndPassword: vi.fn(async () => ({ user: { email: 'staff@example.com' } })),
  signOut: vi.fn(async () => {}),
}));
vi.mock('../src/lib/imageStorage', () => ({
  initImageMemory: vi.fn(async () => 0),
  getImageFromMemorySync: vi.fn(),
  saveImageToMemory: vi.fn(),
  normalizeImageKey: (type: string, value: string) => `${type}_${value}`,
}));
vi.mock('../src/lib/firestoreService', () => ({
  subscribeToCloudPRs: vi.fn(() => null), subscribeToCloudDCs: vi.fn(() => null),
  savePRToCloud: vi.fn(async () => {}), saveDCToCloud: vi.fn(async () => {}), deletePRFromCloud: vi.fn(async () => {}), deleteDCFromCloud: vi.fn(async () => {}),
}));
import { AppProvider, useApp } from '../src/context/AppContext';
function Probe() {
  const { isAuthenticated, isAuthLoading, authError, login, importBackupJSON, canEdit, canDelete, addNewPR, deletePR } = useApp();
  return <div><div data-testid="state">{isAuthLoading ? 'loading' : isAuthenticated ? 'signed in' : 'signed out'}</div>
    <div>{authError}</div><span data-testid="permission">{canEdit ? 'edit' : 'read'} / {canDelete ? 'delete' : 'no-delete'}</span>
    <button onClick={() => addNewPR({ id: 'new', prNumber: 'PR-2', date: '', siteName: '', status: 'Pending', items: [], fulfillmentLogs: [], createdTimestamp: 1 })}>Add record</button>
    <button onClick={() => deletePR('p')}>Delete record</button><button onClick={() => void login('staff@example.com', 'password', false)}>Sign in</button>
    <button onClick={() => void importBackupJSON('{}').catch(error => { (window as Window & { restoreError?: string }).restoreError = error.message; })}>Restore</button></div>;
}

describe('authentication safety', () => {
  beforeEach(() => { localStorage.clear(); mocks.configured = true; mocks.listener = null; mocks.persistence.mockReset(); mocks.role = 'admin'; mocks.token.mockReset().mockImplementation(async () => ({ claims: { portalRole: mocks.role } })); });
  afterEach(cleanup);
  it('does not trust an old or forged local session when Firebase reports no user', async () => {
    localStorage.setItem('STAR_PORTAL_AUTH_SESSION', JSON.stringify({ authenticated: true, user: { username: 'fake' } }));
    render(<AppProvider><Probe /></AppProvider>);
    expect(screen.getByTestId('state').textContent).toBe('loading');
    act(() => mocks.listener?.(null));
    expect(screen.getByTestId('state').textContent).toBe('signed out');
  });
  it('locks the portal when Firebase is not configured', async () => {
    mocks.configured = false;
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('signed out'));
    expect(screen.getByText(/Secure sign-in is not configured/)).toBeTruthy();
  });
  it('locks the portal again when Firebase signs the user out', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(screen.getByTestId('state').textContent).toBe('signed in');
    act(() => mocks.listener?.(null));
    expect(screen.getByTestId('state').textContent).toBe('signed out');
  });
  it('does not rewrite ledger records when an authenticated session starts', async () => {
    const prData = JSON.stringify([{ id: 'p', prNumber: 'PR-60', date: '2024-01-01', siteName: 'Test', items: [], fulfillmentLogs: [] }]);
    const dcData = JSON.stringify([{ id: 'd', dcNumber: 'DC-652', prNumber: 'PR-60', date: '2024-02-01', siteName: 'Test', driverName: 'Original', itemsShipped: [] }]);
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', prData);
    localStorage.setItem('STAR_ELECTRIC_DCS_V2', dcData);
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe(prData);
    expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBe(dcData);
  });
  it('rejects device restore in a Firebase-connected session before touching the backup', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    act(() => screen.getByRole('button', { name: 'Restore' }).click());
    await waitFor(() => expect((window as Window & { restoreError?: string }).restoreError).toMatch(/isolated development/i));
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBeNull();
    expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBeNull();
  });
  it('rejects accounts without a valid portal role', async () => {
    mocks.role = null;
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(screen.getByTestId('state').textContent).toBe('signed out');
    expect(screen.getByText(/no portal role/i)).toBeTruthy();
  });
  it('keeps a viewer read-only and prevents local cache changes', async () => {
    mocks.role = 'viewer'; vi.spyOn(window, 'alert').mockImplementation(() => {});
    const original = JSON.stringify([{ id: 'p', prNumber: 'PR-1', date: '', siteName: '', status: 'Pending', items: [], fulfillmentLogs: [] }]);
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', original);
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(screen.getByTestId('permission').textContent).toBe('read / no-delete');
    act(() => screen.getByRole('button', { name: 'Add record' }).click());
    act(() => screen.getByRole('button', { name: 'Delete record' }).click());
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe(original);
    vi.restoreAllMocks();
  });
  it('allows editors to add but not delete records', async () => {
    mocks.role = 'editor'; vi.spyOn(window, 'alert').mockImplementation(() => {});
    const original = [{ id: 'p', prNumber: 'PR-1', date: '', siteName: '', status: 'Pending', items: [], fulfillmentLogs: [] }];
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify(original));
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(screen.getByTestId('permission').textContent).toBe('edit / no-delete');
    act(() => screen.getByRole('button', { name: 'Add record' }).click());
    act(() => screen.getByRole('button', { name: 'Delete record' }).click());
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!).map((p: {id: string}) => p.id)).toEqual(['new', 'p']);
    vi.restoreAllMocks();
  });
  it('allows administrators to delete and follows later token role changes', async () => {
    mocks.role = 'admin';
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([{ id: 'p', prNumber: 'PR-1', date: '', siteName: '', status: 'Pending', items: [], fulfillmentLogs: [] }]));
    render(<AppProvider><Probe /></AppProvider>);
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(screen.getByTestId('permission').textContent).toBe('edit / delete');
    act(() => screen.getByRole('button', { name: 'Delete record' }).click());
    expect(JSON.parse(localStorage.getItem('STAR_ELECTRIC_PRS_V2')!)).toHaveLength(0);
    mocks.role = 'viewer';
    await act(async () => { mocks.listener?.({ email: 'staff@example.com' }); });
    expect(screen.getByTestId('permission').textContent).toBe('read / no-delete');
  });
  it('does not restore access if a role lookup resolves after sign-out', async () => {
    let resolve!: (value: unknown) => void;
    mocks.token.mockImplementation(() => new Promise(res => { resolve = res; }));
    render(<AppProvider><Probe /></AppProvider>);
    act(() => mocks.listener?.({ email: 'staff@example.com' }));
    act(() => mocks.listener?.(null));
    await act(async () => resolve({ claims: { portalRole: 'admin' } }));
    expect(screen.getByTestId('state').textContent).toBe('signed out');
  });
  it('uses session-only persistence when remember me is disabled', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    act(() => mocks.listener?.(null));
    act(() => screen.getByRole('button', { name: 'Sign in' }).click());
    await waitFor(() => expect(mocks.persistence).toHaveBeenCalledWith(expect.anything(), 'session'));
  });
});
