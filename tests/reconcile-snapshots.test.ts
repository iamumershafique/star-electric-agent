import { describe, expect, it } from 'vitest';
import { reconcileSnapshot } from '../src/lib/reconcileSnapshots';

type Item = { id: string; number: string; value: number; documentImage?: string };
const rec = (id: string, number: string, value: number): Item => ({ id, number, value });
const reconcile = (local: Item[], cloud: Item[], authoritative = true) => reconcileSnapshot(local, cloud, item => item.number, authoritative);
describe('non-destructive cloud snapshot reconciliation', () => {
  it('preserves a conflicting local record and never changes either input', () => {
    const local = [rec('p1', 'PR-1', 7)]; const cloud = [rec('p1', 'PR-1', 3)];
    const result = reconcile(local, cloud);
    expect(result.records).toEqual(local); expect(result.records[0].value).toBe(7);
    expect(result.differences).toEqual([{ id: 'p1', number: 'PR-1', reason: 'different' }]);
    expect(cloud[0].value).toBe(3);
  });
  it('appends unique cloud-only records and never silently merges duplicate numbers', () => {
    const local = [rec('p1', 'PR-1', 7)]; const cloud = [rec('p2', 'pr 1', 8)];
    const result = reconcile(local, cloud);
    expect(result.records).toEqual([...local, ...cloud]);
    expect(result.differences.some(d => d.reason === 'same-number')).toBe(true);
  });
  it('treats an empty server snapshot as uncertain, not a deletion request', () => {
    const local = [rec('p1', 'PR-1', 7)];
    expect(reconcile(local, []).records).toEqual(local);
    expect(reconcile(local, []).differences[0].reason).toBe('local-only');
    expect(reconcile(local, [], false).differences).toEqual([]);
  });
  it('never appends duplicate or missing cloud IDs', () => {
    const result = reconcile([], [rec('x', 'DC-1', 1), rec('x', 'DC-2', 2), rec('', 'DC-3', 3)]);
    expect(result.records).toEqual([]);
    expect(result.differences.every(item => item.reason === 'duplicate-id')).toBe(true);
  });
  it('does not report scan representation differences as proven conflicts', () => {
    const local = [{ ...rec('p1', 'PR-1', 1), documentImage: 'data:image/png;base64,abc' }];
    const cloud = [{ ...rec('p1', 'PR-1', 1), documentImage: 'indexeddb:pr_1' }];
    expect(reconcile(local, cloud).differences).toEqual([]);
  });
  it('appends cloud records even with a large local history', () => {
    const local = Array.from({ length: 600 }, (_, index) => rec(`l${index}`, `DC-${index}`, index));
    const result = reconcile(local, [rec('new', 'DC-800', 5)], false);
    expect(result.records).toHaveLength(601); expect(result.records[600].id).toBe('new');
  });
});
