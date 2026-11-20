import { describe, expect, it } from 'vitest';
import { CloudSyncTracker } from '../src/lib/cloudSyncTracker';

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
function deferred() {
  let resolve!: () => void; let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
describe('cloud warning tracker', () => {
  it('keeps writes pending until acknowledged and tracks concurrent failures separately', async () => {
    const tracker = new CloudSyncTracker(memoryStorage());
    const a = deferred(); const b = deferred();
    const p1 = tracker.track('Save PR 1', () => a.promise);
    const p2 = tracker.track('Save DC 1', () => b.promise);
    expect(tracker.getSnapshot().issues.map(i => i.state)).toEqual(['pending', 'pending']);
    tracker.acknowledge(tracker.getSnapshot().issues[0].id);
    expect(tracker.getSnapshot().issues).toHaveLength(2);
    a.resolve(); await p1;
    expect(tracker.getSnapshot().issues.map(i => i.label)).toEqual(['Save DC 1']);
    b.reject(new Error('permission denied'));
    await expect(p2).rejects.toThrow('permission denied');
    expect(tracker.getSnapshot().issues[0]).toMatchObject({ label: 'Save DC 1', state: 'failed' });
  });
  it('marks pending operations unconfirmed after reload and never retries them', async () => {
    const storage = memoryStorage();
    const tracker = new CloudSyncTracker(storage);
    const wait = deferred();
    void tracker.track('Save PR 2', () => wait.promise);
    const reloaded = new CloudSyncTracker(storage);
    expect(reloaded.getSnapshot().issues[0]).toMatchObject({ label: 'Save PR 2', state: 'unconfirmed' });
    reloaded.acknowledge(reloaded.getSnapshot().issues[0].id);
    expect(reloaded.getSnapshot().issues).toEqual([]);
  });
  it('does not dismiss listener failures until an actual recovery is reported', () => {
    const tracker = new CloudSyncTracker(memoryStorage());
    tracker.reportFailure('Live PR updates stopped');
    tracker.reportFailure('Live PR updates stopped');
    expect(tracker.getSnapshot().issues).toHaveLength(1);
    tracker.acknowledge(tracker.getSnapshot().issues[0].id);
    expect(tracker.getSnapshot().issues).toHaveLength(1);
    tracker.resolveListener('Live PR updates stopped');
    expect(tracker.getSnapshot().issues).toHaveLength(0);
  });
  it('warns when session warning persistence is unavailable', async () => {
    const tracker = new CloudSyncTracker({ getItem: () => null, setItem: () => { throw new Error('quota'); } });
    const pending = deferred();
    void tracker.track('Save DC 2', () => pending.promise);
    expect(tracker.getSnapshot()).toMatchObject({ trackingUnavailable: true, issues: [{ label: 'Save DC 2', state: 'pending' }] });
  });
});
