// @vitest-environment jsdom
// Component tests: the actual QuickDispatch form and AppProvider; Firebase transport is mocked.
import React from 'react';
import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  savePR: vi.fn(), saveDC: vi.fn(), commit: vi.fn(), createBackend: vi.fn(), close: vi.fn(async () => {}),
}));
vi.mock('../src/lib/firestoreService', () => ({
  subscribeToCloudPRs: vi.fn(() => null), subscribeToCloudDCs: vi.fn(() => null),
  savePRToCloud: mocks.savePR, saveDCToCloud: mocks.saveDC, deletePRFromCloud: vi.fn(), deleteDCFromCloud: vi.fn(),
}));
vi.mock('../src/lib/demoSync/proposedBackend', () => ({
  createProposedDemoBackend: (port: number) => { mocks.createBackend(port); return { commit: mocks.commit, close: mocks.close }; },
}));
vi.mock('../src/lib/imageStorage', () => ({
  initImageMemory: vi.fn(async () => 0), getImageFromMemorySync: vi.fn(), saveImageToMemory: vi.fn(),
  normalizeImageKey: (type: string, value: string) => `${type}_${value}`,
}));

let AppProvider: typeof import('../src/context/AppContext').AppProvider;
let useApp: typeof import('../src/context/AppContext').useApp;
let QuickDispatchModal: typeof import('../src/components/QuickDispatchModal').QuickDispatchModal;
let CloudSyncBanner: typeof import('../src/components/CloudSyncBanner').CloudSyncBanner;
let DemoOutbox: typeof import('../src/lib/demoSync/outbox').DemoOutbox;
let port = 22000;
beforeAll(async () => {
  vi.stubEnv('VITE_LINKED_DELIVERY_DEMO', 'true');
  ({ AppProvider, useApp } = await import('../src/context/AppContext'));
  ({ QuickDispatchModal } = await import('../src/components/QuickDispatchModal'));
  ({ CloudSyncBanner } = await import('../src/components/CloudSyncBanner'));
  ({ DemoOutbox } = await import('../src/lib/demoSync/outbox'));
});
function Harness() {
  const app = useApp();
  return <><CloudSyncBanner/><button onClick={() => { const pr = app.prs[0]; app.setQuickDispatchTarget({ pr, items: pr.items }); app.setIsQuickDispatchOpen(true); }}>Open synthetic dispatch</button>
    <span data-testid="quantity">{app.prs[0]?.items[0]?.fulfilledQty}</span><span data-testid="dc-count">{app.dcs.length}</span><QuickDispatchModal/></>;
}
async function start() {
  render(<AppProvider><Harness/></AppProvider>);
  await waitFor(() => expect(mocks.createBackend).toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Open synthetic dispatch' }));
  await screen.findByRole('dialog', { name: /Mark Delivered & Issue DC/i });
  fireEvent.change(screen.getByPlaceholderText('e.g. DC-612'), { target: { value: 'DC-SYNTHETIC-1' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /Synthetic Cable dispatch quantity/i }), { target: { value: '4' } });
}
function submit() { fireEvent.click(screen.getByRole('button', { name: /Save & Issue DC/i })); }
async function openQueue() { const fixture = import.meta.env.VITE_DEMO_FIXTURE; return DemoOutbox.open(`star-sync-demo-linked-${port}${fixture ? `-${fixture}` : ''}`, 'demo-user'); }

beforeEach(() => {
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: new IDBFactory() });
  port++;
  vi.stubEnv('VITE_LINKED_DELIVERY_DEMO', 'true');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'demo-star-electric');
  vi.stubEnv('VITE_DEMO_FIRESTORE_ENDPOINT', `127.0.0.1:${port}`);
  vi.stubEnv('VITE_DEMO_FIXTURE', '');
  mocks.savePR.mockReset(); mocks.saveDC.mockReset(); mocks.createBackend.mockReset(); mocks.commit.mockReset(); mocks.close.mockClear();
  mocks.commit.mockImplementation(() => new Promise(() => {}));
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('component: synthetic quick dispatch form to durable outbox', () => {
  it('persists one operation and closes only after the IndexedDB transaction, with no legacy writes', async () => {
    await start();
    const enqueue = DemoOutbox.prototype.enqueueExclusive;
    let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
    vi.spyOn(DemoOutbox.prototype, 'enqueueExclusive').mockImplementation(async function(command) { await gate; return enqueue.call(this, command); });
    submit();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Save & Issue DC/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText(/Saved on this device/)).toBeNull();
    await act(async () => { release(); });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText(/Saved on this device/)).toBeTruthy();
    expect(screen.queryByText(/Synced/)).toBeNull();
    const queue = await openQueue(); const entries = await queue.list(); queue.close();
    expect(entries).toHaveLength(1);
    expect(entries[0].command.mutations).toHaveLength(2);
    expect(entries[0].command.mutations[0].expectedRevision).toBe(1);
    expect(entries[0].command.mutations[1].expectedRevision).toBeNull();
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
  it('keeps the dialog and values if enqueue fails', async () => {
    await start();
    vi.spyOn(DemoOutbox.prototype, 'enqueueExclusive').mockRejectedValue(new Error('Synthetic IndexedDB quota error'));
    submit();
    await screen.findByText('Synthetic IndexedDB quota error');
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect((screen.getByPlaceholderText('e.g. DC-612') as HTMLInputElement).value).toBe('DC-SYNTHETIC-1');
    expect((screen.getByRole('spinbutton', { name: /Synthetic Cable dispatch quantity/i }) as HTMLInputElement).value).toBe('4');
    const queue = await openQueue(); expect(await queue.list()).toHaveLength(0); queue.close();
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
  it('reopens with the pending operation and projected synthetic quantities', async () => {
    await start(); submit();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(screen.getByTestId('quantity').textContent).toBe('4'));
    cleanup(); mocks.createBackend.mockClear();
    render(<AppProvider><Harness/></AppProvider>);
    await waitFor(() => expect(mocks.createBackend).toHaveBeenCalled());
    expect(screen.getByText(/Saved on this device.*Pending emulator acknowledgement/)).toBeTruthy();
    expect(screen.getByTestId('quantity').textContent).toBe('4');
    expect(screen.getByTestId('dc-count').textContent).toBe('1');
    const queue = await openQueue(); expect(await queue.list()).toHaveLength(1); queue.close();
  });
  it.each(['legacy', 'scan'])('preserves a %s draft for review without sending it', async fixture => {
    vi.stubEnv('VITE_DEMO_FIXTURE', fixture); await start(); submit();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText(fixture === 'legacy' ? /Legacy revision — review required; not sent/ : /Scan reference — review required; not sent/)).toBeTruthy();
    const queue = await openQueue(); const entries = await queue.list(); queue.close();
    expect(entries).toHaveLength(1); expect(entries[0].state).toBe(fixture === 'legacy' ? 'legacy-review' : 'scan-review');
    if (fixture === 'scan') expect(entries[0].command.mutations[0].data.documentImage).toBe('indexeddb:synthetic-unresolved');
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('reuses the same operation after a simulated lost acknowledgement and applies quantity once', async () => {
    let applied = 0; let firstId = '';
    mocks.commit.mockImplementation(async command => {
      if (!firstId) { firstId = command.operationId; applied += (command.mutations[1].data.itemsShipped[0].quantity as number); throw Object.assign(new Error('Synthetic acknowledgement lost'), { code: 'unavailable' }); }
      expect(command.operationId).toBe(firstId); return 'duplicate';
    });
    await start(); submit();
    await screen.findByText(/Saved on this device/);
    await waitFor(() => expect(screen.getByText(/Saved on this device.*Synced/)).toBeTruthy(), { timeout: 6000 });
    expect(mocks.commit).toHaveBeenCalledTimes(2); expect(applied).toBe(4);
    expect(screen.getByTestId('quantity').textContent).toBe('4'); expect(screen.getByTestId('dc-count').textContent).toBe('1');
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
  it.each([{ project: 'not-demo', endpoint: '127.0.0.1:1234' }, { project: 'demo-star-electric', endpoint: 'example.com:1234' }])('fails closed for invalid demo configuration', async config => {
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', config.project); vi.stubEnv('VITE_DEMO_FIRESTORE_ENDPOINT', config.endpoint);
    render(<AppProvider><Harness/></AppProvider>);
    await waitFor(() => expect(screen.getByText(/Demo delivery requires/)).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Open synthetic dispatch' })); submit();
    await waitFor(() => expect(screen.getAllByText(/Demo delivery requires/).length).toBeGreaterThan(0));
    expect(screen.getByRole('dialog')).toBeTruthy(); expect(mocks.createBackend).not.toHaveBeenCalled();
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
});
