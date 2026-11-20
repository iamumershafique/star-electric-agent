// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  configured: true,
  listener: null as null | ((user: unknown) => void),
  persistence: vi.fn(),
}));
vi.mock('../src/lib/firebase', () => ({
  isFirebaseConfigured: () => mocks.configured,
  getFirebaseAuth: () => mocks.configured ? {} : null,
}));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: 'local', browserSessionPersistence: 'session',
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    mocks.listener = callback;
    return () => { mocks.listener = null; };
  },
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
  savePRToCloud: vi.fn(), saveDCToCloud: vi.fn(), deletePRFromCloud: vi.fn(), deleteDCFromCloud: vi.fn(),
}));
import { AppProvider, useApp } from '../src/context/AppContext';
function Probe() {
  const { isAuthenticated, isAuthLoading, authError, login, importBackupJSON } = useApp();
  return <div><div data-testid="state">{isAuthLoading ? 'loading' : isAuthenticated ? 'signed in' : 'signed out'}</div>
    <div>{authError}</div><button onClick={() => void login('staff@example.com', 'password', false)}>Sign in</button>
    <button onClick={() => void importBackupJSON('{}').catch(error => { (window as Window & { restoreError?: string }).restoreError = error.message; })}>Restore</button></div>;
}

describe('authentication safety', () => {
  beforeEach(() => { localStorage.clear(); mocks.configured = true; mocks.listener = null; mocks.persistence.mockReset(); });
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
    act(() => mocks.listener?.({ email: 'staff@example.com' }));
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
    act(() => mocks.listener?.({ email: 'staff@example.com' }));
    await act(async () => { await Promise.resolve(); });
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe(prData);
    expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBe(dcData);
  });
  it('rejects device restore in a Firebase-connected session before touching the backup', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    act(() => mocks.listener?.({ email: 'staff@example.com' }));
    act(() => screen.getByRole('button', { name: 'Restore' }).click());
    await waitFor(() => expect((window as Window & { restoreError?: string }).restoreError).toMatch(/isolated development/i));
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBeNull();
    expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBeNull();
  });
  it('uses session-only persistence when remember me is disabled', async () => {
    render(<AppProvider><Probe /></AppProvider>);
    act(() => mocks.listener?.(null));
    act(() => screen.getByRole('button', { name: 'Sign in' }).click());
    await waitFor(() => expect(mocks.persistence).toHaveBeenCalledWith(expect.anything(), 'session'));
  });
});
