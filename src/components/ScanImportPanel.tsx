import React, { useMemo, useRef, useState } from 'react';
import { FolderUp, Loader2, UploadCloud, CheckCircle2, AlertTriangle, HardDriveUpload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DCRecord, PRRecord } from '../types';
import { normalizeImageKey } from '../lib/scanKeys';
import { compressScanForCloud } from '../lib/scanCompression';
import { recordDocId, saveScanToCloud, setScanReferencesInCloud } from '../lib/firestoreService';
import { getAllStoredImages, saveImageToMemory } from '../lib/imageStorage';

type Target = { kind: 'pr' | 'dc'; id: string; label: string };
type Row = { file: File; path: string; targets: Target[]; manual: string; status: 'pending' | 'done' | 'error' | 'skipped'; error?: string };

const labelFor = (kind: 'pr' | 'dc', number: string) =>
  /^\s*(dc|pr)\b/i.test(number) ? number.trim() : `${kind.toUpperCase()} ${number.trim()}`;

const digits = (value: string | undefined) => (value || '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');

function detect(path: string): { kind: 'pr' | 'dc'; number: string } | null {
  const name = path.split('/').pop() || path;
  const dc = name.match(/\bD\.?\s*C\.?[\s._#-]*(\d{1,6})\b/i);
  if (dc) return { kind: 'dc', number: digits(dc[1]) };
  const pr = name.match(/\bP\.?\s*R\.?[\s._#-]*(?:PK)?(\d{1,10})\b/i);
  if (pr) return { kind: 'pr', number: digits(pr[1]) };
  const bare = name.match(/^0*(\d{1,6})\.[a-z]+$/i);
  if (bare && /dc[\s_-]*scan|challan/i.test(path)) return { kind: 'dc', number: digits(bare[1]) };
  return null;
}

const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
  reader.readAsDataURL(file);
});

export const ScanImportPanel: React.FC = () => {
  const { prs, dcs } = useApp();
  const [rows, setRows] = useState<Row[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const index = useMemo(() => {
    const dcByNumber = new Map<string, DCRecord[]>();
    dcs.forEach(dc => { const n = digits(dc.dcNumber); if (n) dcByNumber.set(n, [...(dcByNumber.get(n) || []), dc]); });
    const prByNumber = new Map<string, PRRecord[]>();
    prs.forEach(pr => { const n = digits(pr.prNumber); if (n) prByNumber.set(n, [...(prByNumber.get(n) || []), pr]); });
    const byLabel = new Map<string, Target>();
    dcs.forEach(dc => { const label = labelFor('dc', dc.dcNumber); byLabel.set(label, { kind: 'dc', id: dc.id, label }); });
    prs.forEach(pr => { const label = labelFor('pr', pr.prNumber); byLabel.set(label, { kind: 'pr', id: pr.id, label }); });
    return { dcByNumber, prByNumber, byLabel };
  }, [prs, dcs]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).filter(file => /^image\//.test(file.type) || /\.pdf$/i.test(file.name));
    setMessage(null);
    setRows(files.map(file => {
      const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      const found = detect(path);
      let targets: Target[] = [];
      if (found?.kind === 'dc') targets = (index.dcByNumber.get(found.number) || []).map(dc => ({ kind: 'dc', id: dc.id, label: labelFor('dc', dc.dcNumber) }));
      if (found?.kind === 'pr') targets = (index.prByNumber.get(found.number) || []).map(pr => ({ kind: 'pr', id: pr.id, label: labelFor('pr', pr.prNumber) }));
      return { file, path, targets, manual: '', status: 'pending' };
    }));
  };

  const setManual = (rowIndex: number, value: string) =>
    setRows(current => current.map((row, i) => i === rowIndex ? { ...row, manual: value } : row));

  const targetsFor = (row: Row): Target[] => {
    if (row.manual.trim()) {
      const typed = row.manual.trim();
      const exact = index.byLabel.get(typed);
      if (exact) return [exact];
      const found = detect(typed);
      if (found?.kind === 'dc') return (index.dcByNumber.get(found.number) || []).map(dc => ({ kind: 'dc' as const, id: dc.id, label: labelFor('dc', dc.dcNumber) }));
      if (found?.kind === 'pr') return (index.prByNumber.get(found.number) || []).map(pr => ({ kind: 'pr' as const, id: pr.id, label: labelFor('pr', pr.prNumber) }));
      return [];
    }
    return row.targets;
  };

  const matchedCount = rows.filter(row => targetsFor(row).length > 0).length;

  const recordFor = (target: Target) => target.kind === 'dc'
    ? dcs.find(dc => dc.id === target.id)
    : prs.find(pr => pr.id === target.id);

  const uploadOne = async (dataUrl: string, target: Target, fileName: string) => {
    const record = recordFor(target);
    if (!record) throw new Error(`${target.label} no longer exists.`);
    const number = target.kind === 'dc' ? (record as DCRecord).dcNumber : (record as PRRecord).prNumber;
    const key = normalizeImageKey(target.kind, number || record.id);
    const compressed = await compressScanForCloud(dataUrl);
    await saveScanToCloud(key, { type: target.kind, referenceNumber: number || record.id, dataUrl: compressed, fileName, updatedAt: Date.now() });
    await saveImageToMemory(target.kind, number || record.id, compressed, { referenceNumber: number, fileName, skipCloud: true });
    return { kind: target.kind, docId: recordDocId(record), field: 'documentImage' as const, reference: `indexeddb:${key}` };
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setMessage(null);
    const work = rows.map((row, i) => ({ row, i, targets: targetsFor(row) })).filter(item => item.targets.length > 0 && item.row.status !== 'done');
    setProgress({ done: 0, total: work.length });
    let pendingRefs: Parameters<typeof setScanReferencesInCloud>[0] = [];
    let failed = 0;
    for (let n = 0; n < work.length; n++) {
      const { row, i, targets } = work[n];
      try {
        const dataUrl = await readAsDataUrl(row.file);
        for (const target of targets) pendingRefs.push(await uploadOne(dataUrl, target, row.file.name));
        setRows(current => current.map((r, j) => j === i ? { ...r, status: 'done', error: undefined } : r));
      } catch (error) {
        failed++;
        setRows(current => current.map((r, j) => j === i ? { ...r, status: 'error', error: error instanceof Error ? error.message : String(error) } : r));
      }
      if (pendingRefs.length >= 20 || n === work.length - 1) {
        try { await setScanReferencesInCloud(pendingRefs); } catch (error) { failed++; setMessage(`Linking scans to records failed: ${error instanceof Error ? error.message : String(error)}`); }
        pendingRefs = [];
      }
      setProgress({ done: n + 1, total: work.length });
    }
    setIsUploading(false);
    setMessage(failed ? `${work.length - failed} scan(s) uploaded, ${failed} failed. Fix and upload again; finished rows are skipped.` : `${work.length} scan(s) uploaded and linked. They now open on every logged-in device.`);
  };

  const handleUploadBrowserScans = async () => {
    setIsUploading(true);
    setMessage(null);
    const stored = (await getAllStoredImages()).filter(item => item.dataUrl?.startsWith('data:') && item.type !== 'builty');
    setProgress({ done: 0, total: stored.length });
    const refs: Parameters<typeof setScanReferencesInCloud>[0] = [];
    let uploaded = 0;
    for (let n = 0; n < stored.length; n++) {
      const item = stored[n];
      const number = digits(item.referenceNumber);
      const target = item.type === 'dc'
        ? (index.dcByNumber.get(number) || [])[0]
        : (index.prByNumber.get(number) || [])[0];
      if (target) {
        try {
          const kind = item.type as 'pr' | 'dc';
          refs.push(await uploadOne(item.dataUrl, { kind, id: target.id, label: item.referenceNumber }, item.fileName || item.id));
          uploaded++;
        } catch (error) {
          console.warn('[ScanImport] Browser scan upload failed', item.id, error);
        }
      }
      setProgress({ done: n + 1, total: stored.length });
    }
    try { if (refs.length) await setScanReferencesInCloud(refs); } catch (error) { console.warn(error); }
    setIsUploading(false);
    setMessage(`${uploaded} of ${stored.length} scan(s) saved in this browser were uploaded and linked.`);
  };

  return (
    <section className="bg-white border-2 border-blue-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <HardDriveUpload className="w-4 h-4 text-blue-600" />
          Import DC &amp; PR Scans to the Cloud
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Download your Google Drive scan folders to this PC, then select them here. Files named like "DC 664.jpg" or "PR-139.jpg" are matched automatically; assign the rest by hand. Scans are compressed and stored in Firestore so they open on every logged-in device.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input ref={folderInput} type="file" multiple className="hidden"
          // @ts-expect-error non-standard folder picker attribute
          webkitdirectory=""
          onChange={event => { handleFiles(event.target.files); event.target.value = ''; }} />
        <input ref={fileInput} type="file" multiple accept="image/*,.pdf" className="hidden"
          onChange={event => { handleFiles(event.target.files); event.target.value = ''; }} />
        <button onClick={() => folderInput.current?.click()} disabled={isUploading}
          className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50">
          <FolderUp className="w-4 h-4" /> Select Folder
        </button>
        <button onClick={() => fileInput.current?.click()} disabled={isUploading}
          className="px-4 py-2.5 rounded-xl bg-white border border-blue-300 text-blue-900 hover:bg-blue-50 font-bold text-xs disabled:opacity-50">
          Select Files
        </button>
        <button onClick={handleUploadBrowserScans} disabled={isUploading}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs disabled:opacity-50">
          Upload scans saved in this browser
        </button>
      </div>

      {rows.length > 0 && (
        <>
          <div className="text-xs text-slate-700">
            <strong>{rows.length}</strong> files, <strong>{matchedCount}</strong> matched to a record, <strong>{rows.length - matchedCount}</strong> need a record (type e.g. "DC 685" or "PR 139", or leave blank to skip).
          </div>
          <datalist id="scan-import-targets">
            {Array.from(index.byLabel.keys()).map(label => <option key={label} value={label} />)}
          </datalist>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
            {rows.map((row, i) => {
              const targets = targetsFor(row);
              return (
                <div key={`${row.path}-${i}`} className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 text-[11px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate" title={row.path}>{row.path}</div>
                    <div className="text-slate-500">{Math.round(row.file.size / 1024)} KB{row.error ? ` · ${row.error}` : ''}</div>
                  </div>
                  <input
                    list="scan-import-targets"
                    value={row.manual}
                    onChange={event => setManual(i, event.target.value)}
                    placeholder={row.targets.length ? row.targets.map(t => t.label).join(', ') : 'Assign record…'}
                    disabled={isUploading || row.status === 'done'}
                    className="w-full sm:w-44 px-2 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                  <span className={`shrink-0 w-20 text-center font-bold ${
                    row.status === 'done' ? 'text-emerald-700' : row.status === 'error' ? 'text-rose-700' : targets.length ? 'text-blue-700' : 'text-slate-400'
                  }`}>
                    {row.status === 'done' ? 'Uploaded' : row.status === 'error' ? 'Failed' : targets.length ? 'Ready' : 'Skip'}
                  </span>
                </div>
              );
            })}
          </div>
          <button onClick={handleUpload} disabled={isUploading || matchedCount === 0}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {isUploading ? `Uploading ${progress.done} / ${progress.total}` : `Upload ${matchedCount} matched scan(s)`}
          </button>
        </>
      )}

      {isUploading && rows.length === 0 && (
        <p className="text-xs text-slate-600 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading {progress.done} / {progress.total}…</p>
      )}

      {message && (
        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${/failed/.test(message) ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'}`}>
          {/failed/.test(message) ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message}</span>
        </div>
      )}
    </section>
  );
};
