// @vitest-environment jsdom
// Actual form/provider with isolated fake IndexedDB clients and a mocked server, not browser profiles.
import React from 'react';
import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { PRRecord } from '../src/types';
import type { DemoCommand } from '../src/lib/demoSync/command';
import * as storage from '../src/lib/storage';

const mocks = vi.hoisted(() => ({ savePR: vi.fn(), saveDC: vi.fn(), create: vi.fn(), commit: vi.fn(), subscribe: vi.fn(), close: vi.fn(async () => {}) }));
vi.mock('../src/lib/firestoreService', () => ({ subscribeToCloudPRs: vi.fn(() => null), subscribeToCloudDCs: vi.fn(() => null), savePRToCloud: mocks.savePR, saveDCToCloud: mocks.saveDC, deletePRFromCloud: vi.fn(), deleteDCFromCloud: vi.fn() }));
vi.mock('../src/lib/demoSync/proposedBackend', () => ({ createProposedDemoBackend: () => { mocks.create(); return { commit: mocks.commit, subscribeSyntheticPR: mocks.subscribe, close: mocks.close }; } }));
vi.mock('../src/lib/imageStorage', () => ({ initImageMemory: vi.fn(async () => 0), getImageFromMemorySync: vi.fn(), saveImageToMemory: vi.fn(), normalizeImageKey: (type: string, value: string) => `${type}_${value}` }));

let AppProvider: typeof import('../src/context/AppContext').AppProvider;
let useApp: typeof import('../src/context/AppContext').useApp;
let PREditModal: typeof import('../src/components/PREditModal').PREditModal;
let CloudSyncBanner: typeof import('../src/components/CloudSyncBanner').CloudSyncBanner;
let DemoOutbox: typeof import('../src/lib/demoSync/outbox').DemoOutbox;
let syntheticPR: typeof import('../src/lib/demoSync/deliveryDemo').syntheticPR;
let SyncConflict: typeof import('../src/lib/demoSync/command').SyncConflict;
let server: PRRecord;
let listeners: Set<(pr: PRRecord) => void>;
let port = 24000;
const setFactory = (factory: IDBFactory) => Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: factory });
const clone = <T,>(value: T): T => structuredClone(value);
const rev = (value: PRRecord) => (value as PRRecord & { _sync: { rev: number } })._sync.rev;

beforeAll(async () => {
  vi.stubEnv('VITE_LINKED_DELIVERY_DEMO', 'true');
  ({ AppProvider, useApp } = await import('../src/context/AppContext'));
  ({ PREditModal } = await import('../src/components/PREditModal'));
  ({ CloudSyncBanner } = await import('../src/components/CloudSyncBanner'));
  ({ DemoOutbox } = await import('../src/lib/demoSync/outbox'));
  ({ syntheticPR } = await import('../src/lib/demoSync/deliveryDemo'));
  ({ SyncConflict } = await import('../src/lib/demoSync/command'));
});
function Harness() {
  const app = useApp();
  return <><CloudSyncBanner/><button onClick={() => { app.setEditingPR(app.prs[0]); app.setIsPREditOpen(true); }}>Open edit</button>
    <button onClick={() => app.setEditingPR(app.prs[0])}>Replace editing snapshot</button>
    <button onClick={() => app.updateExistingPR({ ...app.prs[0], notes: "Outside form" }, app.prs[0])}>Outside form edit</button>
    <span data-testid="current-notes">{app.prs[0]?.notes}</span><PREditModal/></>;
}
async function mount(factory: IDBFactory) {
  setFactory(factory);
  const root = document.createElement('div'); document.body.appendChild(root);
  const view = render(<AppProvider><Harness/></AppProvider>, { container: root, baseElement: root });
  await waitFor(() => expect(listeners.size).toBeGreaterThan(0));
  await waitFor(() => expect(view.getByTestId('current-notes').textContent).toBe(server.notes || ''));
  return view;
}
function open(view: ReturnType<typeof render>) { fireEvent.click(view.getByRole('button', { name: 'Open edit' })); }
function note(view: ReturnType<typeof render>, value: string) { fireEvent.change(view.getByLabelText('Notes and instructions'), { target: { value } }); }
function save(view: ReturnType<typeof render>) { fireEvent.click(view.getByRole('button', { name: 'Save Changes' })); }
async function queue(factory: IDBFactory) { setFactory(factory); return DemoOutbox.open(`star-sync-demo-linked-${port}`, 'demo-user'); }

beforeEach(() => {
  port++; listeners = new Set();
  server = { ...syntheticPR(''), notes: 'Initial five', _sync: { actor: 'seed', op: 'seed', rev: 5 } } as PRRecord;
  vi.stubEnv('VITE_LINKED_DELIVERY_DEMO', 'true'); vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'demo-star-electric');
  vi.stubEnv('VITE_DEMO_FIRESTORE_ENDPOINT', `127.0.0.1:${port}`); vi.stubEnv('VITE_DEMO_FIXTURE', '');
  mocks.savePR.mockReset(); mocks.saveDC.mockReset(); mocks.create.mockReset(); mocks.commit.mockReset(); mocks.subscribe.mockReset();
  mocks.subscribe.mockImplementation((callback: (pr: PRRecord) => void) => { listeners.add(callback); callback(clone(server)); return () => listeners.delete(callback); });
  mocks.commit.mockImplementation(async (command: DemoCommand) => {
    const mutation = command.mutations[0];
    if (mutation.expectedRevision !== rev(server)) throw new SyncConflict('Revision changed', [{ kind: 'PR', id: server.id, data: clone(server) as unknown as Record<string, unknown> }]);
    server = { ...clone(mutation.data), _sync: { actor: command.actorId, op: command.operationId, rev: rev(server) + 1 } } as PRRecord;
    for (const listener of listeners) listener(clone(server));
    return 'committed';
  });
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(storage, 'savePR');
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('mocked independent clients using the real PR form and provider', () => {
  it('retains the base and B draft through A revision 6, durable conflict and restart', async () => {
    const factoryA = new IDBFactory(), factoryB = new IDBFactory();
    const a = await mount(factoryA); open(a); note(a, 'Client A edit');
    const b = await mount(factoryB); await waitFor(() => expect(listeners.size).toBe(2)); open(b); note(b, 'Client B edit');
    save(a);
    await waitFor(() => expect(rev(server)).toBe(6), { timeout: 5000 });
    await waitFor(() => expect(b.getByTestId('current-notes').textContent).toBe('Client A edit'));
    fireEvent.click(b.getByRole('button', { name: 'Replace editing snapshot' }));
    expect((b.getByLabelText('Notes and instructions') as HTMLTextAreaElement).value).toBe('Client B edit');
    save(b);
    await waitFor(() => expect(b.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(b.getByText(/Conflict — review required/)).toBeTruthy(), { timeout: 5000 });
    expect(server.notes).toBe('Client A edit'); expect(rev(server)).toBe(6);
    const box = await queue(factoryB); const entries = await box.list(); box.close();
    expect(entries[0].state).toBe('conflict'); expect(entries[0].command.mutations[0].expectedRevision).toBe(5);
    expect(entries[0].command.mutations[0].data.notes).toBe('Client B edit');
    expect(entries[0].conflictRecords?.[0].data?.notes).toBe('Client A edit');
    b.getByText('Review synthetic PR versions').click();
    expect(b.getByText(/Client B edit/)).toBeTruthy(); expect(b.getAllByText(/Client A edit/).length).toBeGreaterThan(0);
    b.unmount(); const calls = mocks.commit.mock.calls.length;
    const reopened = await mount(factoryB);
    expect(reopened.getByText(/Conflict — review required/)).toBeTruthy();
    expect(reopened.getByText(/Client B edit/)).toBeTruthy(); expect(reopened.getAllByText(/Client A edit/).length).toBeGreaterThan(0);
    const retry = await queue(factoryB); expect(await retry.processOne(mocks.commit)).toBe('blocked'); retry.close();
    expect(mocks.commit).toHaveBeenCalledTimes(calls); expect(server.notes).toBe('Client A edit'); expect(rev(server)).toBe(6);
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled(); expect(storage.savePR).not.toHaveBeenCalled();
  });
  it('keeps form values on failed enqueue and prevents close and repeated saves while saving', async () => {
    const view = await mount(new IDBFactory()); open(view); note(view, 'Unsaved text');
    let reject!: (error: Error) => void;
    vi.spyOn(DemoOutbox.prototype, 'enqueueExclusive').mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
    save(view);
    expect((view.getByRole('button', { name: 'Save Changes' }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByRole('button', { name: 'Close dialog' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' }); expect(view.getByRole('dialog')).toBeTruthy();
    await act(async () => reject(new Error('Synthetic IndexedDB failure')));
    expect(view.getByText('Synthetic IndexedDB failure')).toBeTruthy();
    expect((view.getByLabelText('Notes and instructions') as HTMLTextAreaElement).value).toBe('Unsaved text');
    expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
  it.each(['legacy', 'scan'])('keeps %s edits in review', async fixture => {
    vi.stubEnv('VITE_DEMO_FIXTURE', fixture); server = syntheticPR(fixture);
    const factory = new IDBFactory(); const view = await mount(factory); open(view); note(view, 'Review draft'); save(view);
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    expect(view.getByText(fixture === 'scan' ? /Scan reference — review required/ : /Legacy revision — review required/)).toBeTruthy();
    setFactory(factory); const box = await DemoOutbox.open(`star-sync-demo-linked-${port}-${fixture}`, 'demo-user');
    const [entry] = await box.list(); box.close(); expect(entry.state).toBe(`${fixture === 'scan' ? 'scan' : 'legacy'}-review`);
    if (fixture === 'scan') expect(entry.command.mutations[0].data.documentImage).toBe('indexeddb:synthetic-unresolved');
    expect(mocks.commit).not.toHaveBeenCalled(); expect(mocks.savePR).not.toHaveBeenCalled();
  });
  it('preserves an existing scan when a server snapshot omits it', async () => {
    vi.stubEnv('VITE_DEMO_FIXTURE', 'scan'); server = syntheticPR('scan'); delete server.documentImage;
    const factory = new IDBFactory(); const view = await mount(factory);
    open(view); note(view, 'Preserve scan'); save(view);
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    setFactory(factory); const box = await DemoOutbox.open(`star-sync-demo-linked-${port}-scan`, 'demo-user');
    const [entry] = await box.list(); box.close();
    expect(entry.state).toBe('scan-review');
    expect(entry.command.mutations[0].data.documentImage).toBe('indexeddb:synthetic-unresolved');
    expect(mocks.commit).not.toHaveBeenCalled(); expect(storage.savePR).not.toHaveBeenCalled();
  });
  it('does not enable other updateExistingPR callers in demo mode', async () => {
    const factory = new IDBFactory(); const view = await mount(factory);
    fireEvent.click(view.getByRole('button', { name: 'Outside form edit' }));
    const box = await queue(factory); expect(await box.list()).toHaveLength(0); box.close();
    expect(mocks.commit).not.toHaveBeenCalled(); expect(storage.savePR).not.toHaveBeenCalled();
  });
  it('fails closed with invalid configuration before legacy writes', async () => {
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'wrong'); setFactory(new IDBFactory());
    const view = render(<AppProvider><Harness/></AppProvider>);
    await waitFor(() => expect(view.getByText(/Demo delivery requires/)).toBeTruthy());
    open(view); note(view, 'Preserved'); save(view);
    await waitFor(() => expect(view.getAllByText(/Demo delivery requires/).length).toBeGreaterThan(1));
    expect((view.getByLabelText('Notes and instructions') as HTMLTextAreaElement).value).toBe('Preserved');
    expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.savePR).not.toHaveBeenCalled(); expect(mocks.saveDC).not.toHaveBeenCalled();
  });
});
