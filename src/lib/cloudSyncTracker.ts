/** Tracks acknowledgements and errors, not a retry queue or a proof of cloud completeness. */
export type CloudSyncIssueState = 'pending' | 'failed' | 'unconfirmed';
export interface CloudSyncIssue { id: string; label: string; state: CloudSyncIssueState; kind: 'write' | 'listener' }
export interface CloudSyncSnapshot { issues: CloudSyncIssue[]; trackingUnavailable: boolean }
const KEY = 'STAR_ELECTRIC_SYNC_WARNINGS_V1';

type WarningStorage = Pick<Storage, 'getItem' | 'setItem'>;
export class CloudSyncTracker {
  private snapshot: CloudSyncSnapshot;
  private listeners = new Set<() => void>();
  private next = 0;
  private readonly storage: WarningStorage | null;

  constructor(storage: WarningStorage | null) {
    this.storage = storage;
    let issues: CloudSyncIssue[] = [];
    let unavailable = !storage;
    try {
      const raw = storage?.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.every(item => item && typeof item.id === 'string' && typeof item.label === 'string' && ['pending', 'failed', 'unconfirmed'].includes(item.state))) {
          throw new Error('Invalid stored sync warnings');
        }
        // A pending operation from an earlier page lifetime has no observable completion.
        issues = parsed.map((item: CloudSyncIssue) => ({ ...item, kind: item.kind === 'listener' ? 'listener' : 'write', state: item.state === 'pending' ? 'unconfirmed' : item.state }));
      }
    } catch { unavailable = true; }
    this.snapshot = { issues, trackingUnavailable: unavailable };
  }

  getSnapshot = (): CloudSyncSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private setIssues(issues: CloudSyncIssue[]): void {
    let trackingUnavailable = this.snapshot.trackingUnavailable;
    try {
      if (!this.storage) throw new Error('Session storage unavailable');
      this.storage.setItem(KEY, JSON.stringify(issues));
    } catch { trackingUnavailable = true; }
    this.snapshot = { issues, trackingUnavailable };
    this.listeners.forEach(listener => listener());
  }
  private newId(): string {
    return `${Date.now()}-${++this.next}-${Math.random().toString(36).slice(2, 9)}`;
  }
  reportFailure(label: string): void {
    if (this.snapshot.issues.some(issue => issue.label === label && issue.state === 'failed')) return;
    this.setIssues([...this.snapshot.issues, { id: this.newId(), label, state: 'failed', kind: 'listener' }]);
  }
  resolveListener(label: string): void {
    const remaining = this.snapshot.issues.filter(item => !(item.kind === 'listener' && item.label === label));
    if (remaining.length !== this.snapshot.issues.length) this.setIssues(remaining);
  }
  acknowledge(id: string): void {
    const issue = this.snapshot.issues.find(item => item.id === id);
    if (!issue || issue.state === 'pending' || issue.kind === 'listener') return;
    this.setIssues(this.snapshot.issues.filter(item => item.id !== id));
  }
  async track(label: string, operation: () => Promise<void>): Promise<void> {
    const id = this.newId();
    this.setIssues([...this.snapshot.issues, { id, label, state: 'pending', kind: 'write' }]);
    try {
      await operation();
      this.setIssues(this.snapshot.issues.filter(item => item.id !== id));
    } catch (error) {
      this.setIssues(this.snapshot.issues.map(item => item.id === id ? { ...item, state: 'failed' } : item));
      throw error;
    }
  }
}

export function createSessionSyncTracker(): CloudSyncTracker {
  try { return new CloudSyncTracker(window.sessionStorage); }
  catch { return new CloudSyncTracker(null); }
}
