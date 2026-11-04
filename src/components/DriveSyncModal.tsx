import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cloud, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  FolderSync, 
  Layers, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  getDriveFolderConfig, 
  saveDriveFolderConfig, 
  parseDriveLinksText, 
  syncDriveScansWithAI, 
  RECENT_DRIVE_SCANS,
  KNOWN_SCAN_FOLDERS,
  type DriveFolderConfig, 
  type DriveScannedFile 
} from '../lib/driveSyncService';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({ isOpen, onClose }) => {
  const { prs, dcs, setDCs, geminiApiKey, saveDCToCloud } = useApp();

  const [config, setConfig] = useState<DriveFolderConfig>(getDriveFolderConfig());
  const [pastedLinks, setPastedLinks] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message: string; dcNumber?: string } | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getDriveFolderConfig());
      setStatusMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSyncing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSyncing, onClose]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveDriveFolderConfig(config);
    setStatusMessage({ type: 'success', text: 'Google Drive configuration saved successfully.' });
  };

  const handleStartSync = async (filesToSync?: DriveScannedFile[]) => {
    setIsSyncing(true);
    setStatusMessage(null);
    setSyncLogs([]);

    try {
      let targetFiles = filesToSync || [];

      // If no explicit files passed, parse any pasted links or prepare folder scans
      if (targetFiles.length === 0) {
        if (pastedLinks.trim()) {
          targetFiles = parseDriveLinksText(pastedLinks);
        } else {
          // Pre-mapped DC Scans 694 to 740 in Google Drive
          targetFiles = RECENT_DRIVE_SCANS;
        }
      }

      if (targetFiles.length === 0) {
        throw new Error('Please paste at least one Google Drive scan link or file ID to sync.');
      }

      const res = await syncDriveScansWithAI({
        scannedFiles: targetFiles,
        currentDCs: dcs,
        currentPRs: prs,
        geminiApiKey,
        autoRescanOnImageChange: config.autoRescanOnImageChange,
        onProgress: (p) => setSyncProgress(p)
      });

      setSyncLogs(res.logs);

      if (res.updatedDCs.length > 0) {
        setDCs(res.updatedDCs);
        // Persist newly added/updated DCs to Firestore
        res.updatedDCs.forEach(dc => {
          const original = dcs.find(d => d.id === dc.id);
          if (!original || original.documentImage !== dc.documentImage || original.driveFileId !== dc.driveFileId) {
            saveDCToCloud(dc).catch(err => console.error('[DriveSync] Firestore update error:', err));
          }
        });
      }

      setStatusMessage({
        type: 'success',
        text: `Sync complete! Added: ${res.addedCount}, Updated (Scan Replaced): ${res.updatedCount}, Unchanged: ${res.unchangedCount}`
      });
      setPastedLinks('');
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Drive sync encountered an error.'
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Cloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 id="drive-sync-modal-title" className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Google Drive AI Auto-Sync
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Gemini Vision OCR
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Auto-upload, detect updated scan images, and transcribe handwritten DCs directly from Google Drive.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSyncing}
            aria-label="Close dialog"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            role="alert"
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Sync Progress Bar */}
        {syncProgress && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                {syncProgress.message}
              </span>
              <span>{syncProgress.current} / {syncProgress.total}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.round((syncProgress.current / syncProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Connected Drive Folder Info */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FolderSync className="w-4 h-4 text-blue-600" />
              Target Google Drive Folder ID / URL
            </label>
            <a 
              href={`https://drive.google.com/drive/folders/${config.folderId}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Open in Drive <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex gap-2">
            <select
              value={config.folderId}
              onChange={(e) => setConfig({ ...config, folderId: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer max-w-[200px]"
            >
              {KNOWN_SCAN_FOLDERS.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={config.folderId}
              onChange={(e) => setConfig({ ...config, folderId: e.target.value })}
              placeholder="e.g. 1QirE97-gMrqZ5kQT_hZZGmRFB-efREro"
              className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer transition-colors"
            >
              Save
            </button>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1 border-t border-slate-200/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={config.autoRescanOnImageChange}
                onChange={(e) => setConfig({ ...config, autoRescanOnImageChange: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                <strong>Auto-Rescan Replaced Images:</strong> If a DC scan is removed and replaced with a new photo in Drive, automatically re-run Gemini AI to update its details.
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={config.autoSyncEnabled}
                onChange={(e) => setConfig({ ...config, autoSyncEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                <strong>Live Background Polling:</strong> Continuously monitor Google Drive for newly published scans every {config.pollIntervalMinutes} minutes.
              </span>
            </label>
          </div>
        </div>

        {/* Quick Ingest / Link Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              Sync Scans from Google Drive Links
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Paste Drive file / folder URLs or IDs</span>
          </label>
          <textarea
            rows={3}
            value={pastedLinks}
            onChange={(e) => setPastedLinks(e.target.value)}
            placeholder="Paste Google Drive links (e.g. https://drive.google.com/file/d/1fe36xeEiKP15ORQeeWNd_imEtw9WhJzx/view) or leave blank to sync default Drive folder..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => handleStartSync()}
          disabled={isSyncing}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Google Drive Scans with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Sync &amp; Auto-Scan Google Drive Now</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </>
          )}
        </button>

        {/* Background Watcher Info Card */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 font-medium">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>24/7 Automated Background Daemon</span>
          </div>
          <p className="text-[11px] text-amber-800">
            To watch Google Drive continuously in the background on your computer or server without keeping the browser tab open, run:
            <code className="block mt-1 p-1.5 rounded bg-amber-100 text-slate-900 font-mono text-[11px]">npm run drive:watch</code>
          </p>
        </div>

        {/* Live Logs */}
        {syncLogs.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Sync Activity Log
            </label>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] max-h-40 overflow-y-auto space-y-1">
              {syncLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DriveSyncModal;

