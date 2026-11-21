import { canonicalCommand, ScanReviewRequired, SyncConflict, validateCommand, type ConflictRecord, type DemoCommand } from './command';

export type QueueState = 'pending' | 'in-flight' | 'retry' | 'conflict' | 'legacy-review' | 'scan-review' | 'rejected' | 'acknowledged';
export type QueueEntry = { sequence: number; command: DemoCommand; state: QueueState; attempts: number; nextAttemptAt: number; leaseUntil: number; leaseOwner: string; lastError?: string; conflictRecords?: ConflictRecord[] };
type PersistedEntry = Omit<QueueEntry, 'sequence'> & { sequence?: number };
export type QueueOutcome = 'idle' | 'waiting' | 'blocked' | 'acknowledged' | 'retry';
const STORE = 'operations';
const LEASE_MS = 30_000;

function openDatabase(name: string): Promise<IDBDatabase> {
  if (!name.startsWith('star-sync-demo-')) throw new Error('Demo outbox requires an isolated demo database name.');
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: 'sequence', autoIncrement: true });
      store.createIndex('operationId', 'command.operationId', { unique: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Cannot open demo outbox.'));
    request.onblocked = () => reject(new Error('Demo outbox upgrade is blocked.'));
  });
}
function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Outbox transaction failed.'));
    tx.onabort = () => reject(tx.error || new Error('Outbox transaction aborted.'));
  });
}
function retryable(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code).replace(/^firestore\//, '') : '';
  return ['unavailable', 'deadline-exceeded', 'aborted', 'resource-exhausted', 'network-request-failed'].includes(code);
}

/**
 * Durable, ordered, synthetic-demo-only outbox. Does not use or remove portal caches or scans.
 * Blocked entries intentionally prevent later commands from overtaking them.
 */
export class DemoOutbox {
  private readonly db: IDBDatabase;
  private readonly actorId: string;
  private readonly now: () => number;
  private constructor(db: IDBDatabase, actorId: string, now: () => number) {
    this.db = db;
    this.actorId = actorId;
    this.now = now;
  }
  static async open(name: string, actorId: string, now: () => number = Date.now): Promise<DemoOutbox> {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(actorId)) throw new Error('Invalid demo actor.');
    return new DemoOutbox(await openDatabase(name), actorId, now);
  }
  close(): void { this.db.close(); }

  async enqueue(command: DemoCommand): Promise<void> {
    validateCommand(command);
    return this.insert(command, 'pending');
  }

  /** Reserve the affected records in the same transaction as the queued command. */
  async enqueueExclusive(command: DemoCommand): Promise<void> {
    validateCommand(command);
    return this.insert(command, 'pending', true);
  }

  /** Preserve a synthetic draft without allowing the worker to treat an unknown base as a create. */
  async enqueueForReview(command: DemoCommand, reason: 'legacy-review' | 'scan-review', exclusive = false): Promise<void> {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(command.operationId) || !Array.isArray(command.mutations) || command.mutations.length < 1 || command.mutations.length > 2) throw new Error('Invalid review draft.');
    if (command.mutations.some(m => (m.kind !== 'PR' && m.kind !== 'DC') || !/^[a-zA-Z0-9_-]{1,100}$/.test(m.id) || !m.data || typeof m.data !== 'object')) throw new Error('Invalid review record.');
    return this.insert(command, reason, exclusive);
  }

  private async insert(command: DemoCommand, state: 'pending' | 'legacy-review' | 'scan-review', exclusive = false): Promise<void> {
    if (command.actorId !== this.actorId) throw new Error('Actor mismatch.');
    // Snapshot before writing so later changes to the caller cannot change a retry.
    const copy = JSON.parse(canonicalCommand(command)) as DemoCommand;
    const tx = this.db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const existingRequest = store.getAll();
    let collision = false;
    let reserved = false;
    existingRequest.onsuccess = () => {
      const records = existingRequest.result as QueueEntry[];
      const existing = records.find(entry => entry.command.operationId === copy.operationId);
      if (existing) {
        if (canonicalCommand(existing.command) !== canonicalCommand(copy) || (state !== 'pending' && existing.state !== state)) { collision = true; tx.abort(); }
        return;
      }
      if (exclusive) {
        const dc = copy.mutations.find(m => m.kind === 'DC');
        const normalized = (value: unknown) => typeof value === 'string' ? value.replace(/[^a-z0-9]/gi, '').toLowerCase() : '';
        const dcNumber = normalized(dc?.data.dcNumber);
        reserved = records.some(entry => entry.command.mutations.some(m =>
          (entry.state !== 'acknowledged' && copy.mutations.some(candidate => candidate.kind === m.kind && candidate.id === m.id)) ||
          (m.kind === 'DC' && dcNumber !== '' && normalized(m.data.dcNumber) === dcNumber)
        ));
        if (reserved) { tx.abort(); return; }
      }
      const entry: PersistedEntry = { command: copy, state, attempts: 0, nextAttemptAt: 0, leaseUntil: 0, leaseOwner: '' };
      store.add(entry);
    };
    try { await done(tx); } catch (error) {
      if (collision) throw new SyncConflict('Operation ID already belongs to a different command.');
      if (reserved) throw new SyncConflict('This record has a pending operation or the DC number was already used. Review the queue.');
      throw error;
    }
  }

  async list(): Promise<QueueEntry[]> {
    const tx = this.db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    let records: QueueEntry[] = [];
    request.onsuccess = () => { records = request.result as QueueEntry[]; };
    await done(tx);
    return records;
  }

  private async claim(): Promise<{ entry?: QueueEntry; outcome: QueueOutcome; owner?: string }> {
    const tx = this.db.transaction(STORE, 'readwrite');
    const cursorRequest = tx.objectStore(STORE).openCursor();
    let outcome: QueueOutcome = 'idle';
    let entry: QueueEntry | undefined;
    const owner = crypto.randomUUID();
    const now = this.now();
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) return;
      const current = cursor.value as QueueEntry;
      if (current.state === 'acknowledged') { cursor.continue(); return; }
      if (current.command.actorId !== this.actorId || ['conflict', 'legacy-review', 'scan-review', 'rejected'].includes(current.state)) { outcome = 'blocked'; return; }
      if ((current.state === 'in-flight' && current.leaseUntil > now) || (current.state === 'retry' && current.nextAttemptAt > now)) { outcome = 'waiting'; return; }
      entry = { ...current, state: 'in-flight', leaseOwner: owner, leaseUntil: now + LEASE_MS };
      cursor.update(entry);
    };
    await done(tx);
    return { entry, outcome, owner };
  }

  async processOne(commit: (command: DemoCommand) => Promise<unknown>): Promise<QueueOutcome> {
    const claimed = await this.claim();
    if (!claimed.entry) return claimed.outcome;
    let outcome: QueueOutcome = 'acknowledged';
    let state: QueueState = 'acknowledged';
    let nextAttemptAt = 0;
    let message: string | undefined;
    let conflictRecords: ConflictRecord[] | undefined;
    try { await commit(claimed.entry.command); }
    catch (error) {
      message = error instanceof Error ? error.message : 'Sync operation failed.';
      if (error instanceof SyncConflict || (error as { code?: string })?.code === 'sync/conflict') {
        state = 'conflict'; outcome = 'blocked';
        if (error instanceof SyncConflict) conflictRecords = error.remoteRecords;
      }
      else if (error instanceof ScanReviewRequired || (error as { code?: string })?.code === 'sync/scan-review') { state = 'scan-review'; outcome = 'blocked'; }
      else if (retryable(error)) { state = 'retry'; outcome = 'retry'; nextAttemptAt = this.now() + Math.min(60_000, 1000 * 2 ** Math.min(claimed.entry.attempts, 6)); }
      else { state = 'rejected'; outcome = 'blocked'; }
    }
    const tx = this.db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const request = store.get(claimed.entry.sequence);
    let owned = false;
    request.onsuccess = () => {
      const current = request.result as QueueEntry | undefined;
      if (!current || current.state !== 'in-flight' || current.leaseOwner !== claimed.owner) return;
      owned = true;
      store.put({ ...current, state, attempts: current.attempts + 1, nextAttemptAt, leaseUntil: 0, leaseOwner: '', lastError: message, conflictRecords });
    };
    await done(tx);
    // Another worker took over an expired lease; its receipt check owns final acknowledgement.
    return owned ? outcome : 'waiting';
  }
}
