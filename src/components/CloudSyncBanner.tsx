import React from 'react';
import { useApp } from '../context/AppContext';

/** A warning log, not an offline queue or an indication that all records are synced. */
export const CloudSyncBanner: React.FC = () => {
  const { cloudSyncIssues, snapshotDifferences, syncTrackingUnavailable, localPersistenceFailed, localScanPersistenceFailed, isLocalOnlyMode, acknowledgeCloudSyncIssue } = useApp();
  const [isOffline, setIsOffline] = React.useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  React.useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  if (!cloudSyncIssues.length && !snapshotDifferences.length && !syncTrackingUnavailable && !localPersistenceFailed && !localScanPersistenceFailed && !isLocalOnlyMode && !isOffline) return null;
  return (
    <section role="alert" className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {isOffline && <p className="font-bold">Your browser reports that it is offline. Cloud updates may be unavailable.</p>}
      {isLocalOnlyMode && <p className="font-semibold">Development local-only mode: changes are not saved to Firebase.</p>}
      {localScanPersistenceFailed && <p className="font-bold">A scan could not be saved in this browser. Keep this tab open, preserve the original file, and verify any cloud copy.</p>}
      {localPersistenceFailed && <p className="font-bold">A local ledger save failed. Keep this tab open, preserve the data, and contact the administrator; the cloud may differ.</p>}
      {syncTrackingUnavailable && <p className="font-bold">Sync warnings cannot be saved in this tab. Do not rely on warnings surviving a reload.</p>}
      {snapshotDifferences.length > 0 && <div className="mb-2">
        <p className="font-bold">Local and cloud ledger snapshots need review ({snapshotDifferences.length}).</p>
        <p>Local versions are preserved, not automatically overwritten or deleted. Do not push or reconcile these records until both versions are backed up and reviewed.</p>
        <ul className="mt-1 list-disc pl-5">{snapshotDifferences.slice(0, 20).map((issue, index) => <li key={`${issue.collection}-${issue.id}-${issue.reason}-${index}`}>
          {issue.collection} {issue.number}: {issue.reason === 'different' ? 'local and cloud details differ' : issue.reason === 'local-only' ? 'not in current server snapshot; may be local-only or deleted' : issue.reason === 'duplicate-id' ? 'duplicate or missing record ID' : 'same number belongs to different IDs'}
        </li>)}</ul>
        {snapshotDifferences.length > 20 && <p>Showing the first 20; {snapshotDifferences.length - 20} more need review.</p>}
        <p className="text-xs mt-1">This comparison excludes scan bytes and cannot detect every conflict or guarantee synchronization.</p>
      </div>}
      {cloudSyncIssues.length > 0 && <>
        <p className="font-bold">Cloud writes or live updates need attention ({cloudSyncIssues.length}).</p>
        <p>Pending writes may be offline. Failed or unconfirmed operations require manual verification; this warning does not retry them.</p>
        <ul className="mt-2 space-y-1">
          {cloudSyncIssues.map(issue => <li key={issue.id} className="flex flex-wrap items-center gap-2">
            <span>{issue.label}: {issue.state === 'pending' ? 'awaiting cloud confirmation' : issue.state === 'failed' ? 'failed' : 'unconfirmed after reload'}</span>
            {issue.kind === 'listener' && <span className="font-semibold">Reload or sign in again to reconnect; verify updates afterwards.</span>}
            {issue.state !== 'pending' && issue.kind !== 'listener' && <button type="button" className="underline font-semibold" onClick={() => {
              if (window.confirm('Acknowledge this warning only after checking the record. This does not retry or confirm synchronization.')) acknowledgeCloudSyncIssue(issue.id);
            }}>Acknowledge</button>}
          </li>)}
        </ul>
        <p className="mt-1 text-xs">Warnings survive reload in this tab when session storage is available, but are not a durable queue and may be lost when the tab closes.</p>
      </>}
    </section>
  );
};
