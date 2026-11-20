import React from 'react';
import { useApp } from '../context/AppContext';

/** A warning log, not an offline queue or an indication that all records are synced. */
export const CloudSyncBanner: React.FC = () => {
  const { cloudSyncIssues, syncTrackingUnavailable, localPersistenceFailed, isLocalOnlyMode, acknowledgeCloudSyncIssue } = useApp();
  const [isOffline, setIsOffline] = React.useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  React.useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  if (!cloudSyncIssues.length && !syncTrackingUnavailable && !localPersistenceFailed && !isLocalOnlyMode && !isOffline) return null;
  return (
    <section role="alert" className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {isOffline && <p className="font-bold">Your browser reports that it is offline. Cloud updates may be unavailable.</p>}
      {isLocalOnlyMode && <p className="font-semibold">Development local-only mode: changes are not saved to Firebase.</p>}
      {localPersistenceFailed && <p className="font-bold">A local ledger save failed. Keep this tab open, preserve the data, and contact the administrator; the cloud may differ.</p>}
      {syncTrackingUnavailable && <p className="font-bold">Sync warnings cannot be saved in this tab. Do not rely on warnings surviving a reload.</p>}
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
