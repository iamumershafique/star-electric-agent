// @vitest-environment jsdom
// Real modal and sync service; synthetic fetch, OCR and state writers only.
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DriveSyncModal } from '../src/components/DriveSyncModal';

const mocks = vi.hoisted(() => ({ ocr: vi.fn(), setDCs: vi.fn(), save: vi.fn(async () => {}), app: { prs: [], dcs: [], geminiApiKey: '', canEdit: true, isDemoDeliveryMode: false } }));
vi.mock('../src/context/AppContext', () => ({ useApp: () => ({ ...mocks.app, setDCs: mocks.setDCs, saveDCToCloud: mocks.save }) }));
vi.mock('../src/lib/aiOcr', () => ({ processDCWithAI: mocks.ocr }));
vi.mock('../src/lib/gemini', () => ({ getActiveGeminiApiKey: () => '' }));

const folder = 'syntheticFolder00000000000000001';
const one = 'syntheticFile000000000000000001';
const two = 'syntheticFile000000000000000002';
const other = 'syntheticFile000000000000000003';
const meta = (id: string, name: string, mimeType = 'image/jpeg') => ({ id, name, mimeType });
const json = (data: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
const image = (status = 200) => ({ ok: status >= 200 && status < 300, status, statusText: 'Not Found', blob: async () => new Blob(['synthetic'], { type: 'image/jpeg' }) });
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_DRIVE_API_KEY', 'synthetic-key');
  localStorage.setItem('STAR_PORTAL_DRIVE_SYNC_CONFIG', JSON.stringify({ folderId: folder, autoSyncEnabled: false, pollIntervalMinutes: 1, autoRescanOnImageChange: true }));
  mocks.ocr.mockReset(); mocks.setDCs.mockReset(); mocks.save.mockReset(); mocks.save.mockResolvedValue(undefined);
  mocks.app = { prs: [], dcs: [], geminiApiKey: '', canEdit: true, isDemoDeliveryMode: false };
  mocks.ocr.mockImplementation(async files => [{ dcNumber: files[0].name.includes('Second') ? 'DC-22' : 'DC-21', shippedItems: [] }]);
  fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
function mount() { render(<DriveSyncModal isOpen onClose={() => {}}/>); }
function sync() { fireEvent.click(screen.getByRole('button', { name: /Sync & Auto-Scan Google Drive Now/ })); }
function requestFor(downloadId: string) { return fetchMock.mock.calls.filter(([url]) => new URL(String(url)).searchParams.get('alt') === 'media' && new URL(String(url)).pathname.endsWith(`/${downloadId}`)); }

describe('Drive sync modal with synthetic Drive responses', () => {
  it('uses the selected folder with blank optional links and never downloads the folder', async () => {
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'DC 21.jpg')] }) : image());
    mount(); expect((screen.getByLabelText('Drive file or folder links') as HTMLTextAreaElement).value).toBe(''); sync();
    expect(await screen.findByText(/Sync complete — 1 attempted, 0 failed, 1 added/)).toBeTruthy();
    expect(requestFor(folder)).toHaveLength(0); expect(requestFor(one)).toHaveLength(1);
    expect(mocks.ocr.mock.calls[0][0][0].name).toBe('DC 21.jpg'); expect(mocks.save).toHaveBeenCalledTimes(1);
  });
  it('lists every page, selects supported files and ignores subfolders', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.startsWith('https://www.googleapis.com/drive/v3/files?')) return new URL(url).searchParams.has('pageToken')
        ? json({ files: [meta(two, 'Second DC 22.png', 'image/png'), meta(other, 'Child folder', 'application/vnd.google-apps.folder')] })
        : json({ files: [meta(one, 'First DC 21.jpg')], nextPageToken: 'synthetic-page' });
      return image();
    });
    mount(); sync();
    expect(await screen.findByText(/Sync complete — 2 attempted, 0 failed, 2 added/)).toBeTruthy();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/drive/v3/files?'))).toHaveLength(2);
    expect(requestFor(folder)).toHaveLength(0); expect(requestFor(other)).toHaveLength(0);
    expect(mocks.ocr.mock.calls.map(call => call[0][0].name)).toEqual(['First DC 21.jpg', 'Second DC 22.png']);
  });
  it('looks up an individual file and uses its actual metadata', async () => {
    fetchMock.mockImplementation(async (url: string) => url.includes('/drive/v3/files/') && !url.includes('alt=media') ? json(meta(one, 'Real scan name.png', 'image/png')) : image());
    mount(); fireEvent.change(screen.getByLabelText('Drive file or folder links'), { target: { value: `https://drive.google.com/file/d/${one}/view` } }); sync();
    expect(await screen.findByText(/Sync complete — 1 attempted, 0 failed, 1 added/)).toBeTruthy();
    expect(mocks.ocr.mock.calls[0][0][0].name).toBe('Real scan name.png'); expect(requestFor(folder)).toHaveLength(0);
  });
  it('resolves a bare ID before deciding whether it is a folder', async () => {
    fetchMock.mockImplementation(async (url: string) => url.includes('/drive/v3/files/') && !url.includes('alt=media') ? json(meta(folder, 'Synthetic folder', 'application/vnd.google-apps.folder')) : url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'DC 21.jpg')] }) : image());
    mount(); fireEvent.change(screen.getByLabelText('Drive file or folder links'), { target: { value: folder } }); sync();
    expect(await screen.findByText(/Sync complete — 1 attempted, 0 failed, 1 added/)).toBeTruthy();
    expect(requestFor(folder)).toHaveLength(0); expect(requestFor(one)).toHaveLength(1);
  });
  it('distinguishes an empty folder without OCR or writes', async () => {
    fetchMock.mockResolvedValue(json({ files: [] })); mount(); sync();
    expect(await screen.findByText(/Folder is empty or contains no supported scan files — 0 attempted, 0 failed, 0 added/)).toBeTruthy();
    expect(mocks.ocr).not.toHaveBeenCalled(); expect(mocks.setDCs).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled(); expect(requestFor(folder)).toHaveLength(0);
  });
  it('reports a folder 404 exactly as a failed run without fallback, OCR or writes', async () => {
    fetchMock.mockResolvedValue(json({ error: { message: `sensitive ${folder}` } }, 404)); mount(); sync();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Sync failed — 1 attempted, 1 failed, 0 added. Folder could not be opened. (HTTP 404)');
    expect(alert.className).toContain('rose'); expect(screen.getByText('Folder could not be opened. (HTTP 404)')).toBeTruthy();
    expect(document.body.textContent).not.toContain(folder); expect(requestFor(folder)).toHaveLength(0);
    expect(mocks.ocr).not.toHaveBeenCalled(); expect(mocks.setDCs).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it('does not process a partial listing if a later page fails', async () => {
    fetchMock.mockImplementation(async (url: string) => new URL(url).searchParams.has('pageToken') ? json({}, 404) : json({ files: [meta(one, 'DC 21.jpg')], nextPageToken: 'next' }));
    mount(); sync(); expect((await screen.findByRole('alert')).textContent).toContain('Folder could not be opened');
    expect(requestFor(one)).toHaveLength(0); expect(requestFor(folder)).toHaveLength(0); expect(mocks.ocr).not.toHaveBeenCalled(); expect(mocks.setDCs).not.toHaveBeenCalled();
  });
  it('reports a failed download without OCR or record changes', async () => {
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, `${one}.jpg`)] }) : image(404));
    mount(); sync(); expect(await screen.findByText('Sync failed — 1 attempted, 1 failed, 0 added.')).toBeTruthy();
    expect(mocks.ocr).not.toHaveBeenCalled(); expect(mocks.setDCs).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain(one); expect(requestFor(folder)).toHaveLength(0);
  });
  it('reports a partial failure and only processes successful downloads', async () => {
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'First DC 21.jpg'), meta(two, 'Second DC 22.jpg')] }) : url.includes(two) ? image(404) : image());
    mount(); sync(); const alert = await screen.findByText('Sync partially failed — 2 attempted, 1 failed, 1 added.');
    expect(alert.parentElement?.className).toContain('amber'); expect(mocks.ocr).toHaveBeenCalledTimes(1); expect(mocks.save).toHaveBeenCalledTimes(1);
    expect(requestFor(folder)).toHaveLength(0); expect(document.body.textContent).not.toContain(two);
  });
  it('fails closed before any Drive request if the Drive API key is missing', async () => {
    vi.stubEnv('VITE_GOOGLE_DRIVE_API_KEY', ''); mount(); sync();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('0 attempted, 0 failed, 0 added. Drive API access is not configured.');
    expect(fetchMock).not.toHaveBeenCalled(); expect(mocks.ocr).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it('does not report green success when a mocked cloud save fails', async () => {
    mocks.save.mockRejectedValue(new Error('synthetic failure'));
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'DC 21.jpg')] }) : image());
    mount(); sync(); const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('cloud saves failed'); expect(alert.className).toContain('rose');
  });
  it('downloads supported PDF media before OCR', async () => {
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'DC 21.pdf', 'application/pdf')] }) : ({ ok: true, status: 200, blob: async () => new Blob(['synthetic'], { type: 'application/pdf' }) }));
    mount(); sync(); await screen.findByText(/Sync complete — 1 attempted, 0 failed, 1 added/);
    expect(mocks.ocr.mock.calls[0][0][0].base64).toMatch(/^data:application\/pdf;base64,/);
    expect(requestFor(one)).toHaveLength(1); expect(requestFor(folder)).toHaveLength(0);
  });
  it('preserves an existing scan and record when its replacement download fails', async () => {
    const existing = { id: 'synthetic-record', dcNumber: 'DC-22', documentImage: 'synthetic-old-reference', driveFileId: 'synthetic-old-file', itemsShipped: [] };
    mocks.app.dcs = [existing] as never[];
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'First DC 21.jpg'), meta(two, 'Second DC 22.jpg')] }) : url.includes(two) ? image(404) : image());
    mount(); sync(); await screen.findByText('Sync partially failed — 2 attempted, 1 failed, 1 added.');
    const apply = mocks.setDCs.mock.calls[0][0]; const next = apply([existing]);
    expect(next.find((dc: { id: string }) => dc.id === existing.id)).toEqual(existing);
    expect(mocks.ocr).toHaveBeenCalledTimes(1); expect(mocks.save).toHaveBeenCalledTimes(1);
    expect(mocks.save.mock.calls[0][0].id).not.toBe(existing.id);
  });
  it('requires review when neither metadata nor OCR identifies a DC', async () => {
    mocks.ocr.mockResolvedValue([{ dcNumber: '', shippedItems: [] }]);
    fetchMock.mockImplementation(async (url: string) => url.startsWith('https://www.googleapis.com/drive/v3/files?') ? json({ files: [meta(one, 'scan_2026.jpg')] }) : image());
    mount(); sync(); expect(await screen.findByText('Sync failed — 1 attempted, 1 failed, 0 added.')).toBeTruthy();
    expect(mocks.setDCs).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it('does not silently start polling from a previously saved setting', async () => {
    vi.useFakeTimers();
    localStorage.setItem('STAR_PORTAL_DRIVE_SYNC_CONFIG', JSON.stringify({ folderId: folder, autoSyncEnabled: true, pollIntervalMinutes: 1 }));
    mount(); await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).not.toHaveBeenCalled(); vi.useRealTimers();
  });
  it('uses the same folder discovery when browser polling is enabled', async () => {
    vi.useFakeTimers();
    localStorage.setItem('STAR_PORTAL_DRIVE_SYNC_CONFIG', JSON.stringify({ folderId: folder, autoSyncEnabled: false, pollIntervalMinutes: 1 }));
    fetchMock.mockResolvedValue(json({ files: [] })); mount();
    fireEvent.click(screen.getByRole('checkbox', { name: /Live Background Polling/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1); expect(requestFor(folder)).toHaveLength(0);
    expect(screen.getByText(/Folder is empty/)).toBeTruthy(); expect(mocks.ocr).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
