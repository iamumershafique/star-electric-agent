/** Synthetic-only experiment. Not connected to the portal or its production Firebase instance. */
export const DEMO_PROJECT = 'demo-star-electric';
export type Mutation = { kind: 'PR' | 'DC'; id: string; expectedRevision: number | null; data: Record<string, unknown> };
export type DemoCommand = { operationId: string; actorId: string; mutations: Mutation[] };
export type ConflictRecord = { kind: 'PR' | 'DC'; id: string; data: Record<string, unknown> | null };
export class SyncConflict extends Error {
  readonly code = 'sync/conflict';
  readonly remoteRecords?: ConflictRecord[];
  constructor(message: string, remoteRecords?: ConflictRecord[]) {
    super(message);
    this.remoteRecords = remoteRecords;
  }
}
export class ScanReviewRequired extends Error { readonly code = 'sync/scan-review'; }

const scanFields = new Set(['documentImage', 'prDocumentImage', 'builtyImage']);
export function containsScan(value: unknown): boolean {
  if (typeof value === 'string') return value.startsWith('data:') || value.startsWith('indexeddb:');
  if (Array.isArray(value)) return value.some(containsScan);
  if (value && typeof value === 'object') return Object.entries(value).some(([key, item]) => scanFields.has(key) || containsScan(item));
  return false;
}
function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${canonical(object[key])}`).join(',')}}`;
  }
  throw new Error('Commands must contain only finite JSON values.');
}
export function canonicalCommand(command: DemoCommand): string { return canonical(command); }
export async function commandFingerprint(command: DemoCommand): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalCommand(command));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
export function validateCommand(command: DemoCommand): void {
  const validId = (id: unknown) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id);
  if (!validId(command.operationId) || !validId(command.actorId)) throw new Error('Invalid operation or actor ID.');
  if (!Array.isArray(command.mutations) || command.mutations.length < 1 || command.mutations.length > 2) throw new Error('A command must contain one record or a linked PR/DC pair.');
  const kinds = new Set(command.mutations.map(m => m.kind));
  if (kinds.size !== command.mutations.length || [...kinds].some(kind => kind !== 'PR' && kind !== 'DC')) throw new Error('A command cannot repeat or use an unknown record kind.');
  for (const mutation of command.mutations) {
    if (!validId(mutation.id) || !mutation.data || typeof mutation.data !== 'object' || Array.isArray(mutation.data)) throw new Error('Invalid record.');
    if (mutation.expectedRevision !== null && (!Number.isSafeInteger(mutation.expectedRevision) || mutation.expectedRevision < 1)) throw new Error('An expected positive revision or explicit absence is required.');
    if (mutation.data.id !== mutation.id || '_syncRevision' in mutation.data || '_sync' in mutation.data) throw new Error('Record ID mismatch or reserved revision field.');
    const number = mutation.kind === 'PR' ? mutation.data.prNumber : mutation.data.dcNumber;
    if (typeof number !== 'string' || !number.trim()) throw new Error('Record number required.');
    if (containsScan(mutation.data)) throw new ScanReviewRequired('Scan-bearing records require separate reconciliation; no write was attempted.');
  }
  const pr = command.mutations.find(m => m.kind === 'PR');
  const dc = command.mutations.find(m => m.kind === 'DC');
  if (dc && pr && (dc.data.prId !== pr.id || dc.data.prNumber !== pr.data.prNumber)) throw new Error('The DC must explicitly reference the PR in this linked operation.');
  if (dc && !pr && typeof dc.data.prId === 'string' && dc.data.prId) throw new Error('A linked DC requires its PR in the same operation.');
  canonicalCommand(command);
}
