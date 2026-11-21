import { describe, expect, it } from 'vitest';
import { reconcileSnapshot, sameLedgerDetails, sameRecordData } from '../src/lib/reconcileSnapshots';

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
  it('checks scan changes for open-form safety even though snapshots cannot reconcile scans', () => {
    const original = { ...rec('p1', 'PR-1', 1), documentImage: 'local-scan-a' };
    const changed = { ...original, documentImage: 'local-scan-b' };
    expect(sameLedgerDetails(original, changed)).toBe(true);
    expect(sameRecordData(original, changed)).toBe(false);
  });
  it('applies a later server update only when local details match the trusted baseline', () => {
    const previous = [rec('p1', 'PR-1', 1)];
    const local = [{ ...previous[0], documentImage: 'data:image/png;base64,local' }];
    const cloud = [{ ...rec('p1', 'PR-1', 2), documentImage: 'remote-scan' }];
    const result = reconcileSnapshot(local, cloud, item => item.number, true, previous);
    expect(result.records).toEqual([{ ...cloud[0], documentImage: local[0].documentImage }]);
    expect(result.updated).toBe(1);
    expect(result.differences).toEqual([]);
    expect(local[0].value).toBe(1);
  });
  it('retains an unresolved remote scan reference when the local field is absent or empty', () => {
    const previous = [rec('p1', 'PR-1', 1)];
    const cloud = [{ ...rec('p1', 'PR-1', 2), documentImage: 'indexeddb:unresolved-synthetic' }];
    for (const local of [previous, [{ ...previous[0], documentImage: undefined }], [{ ...previous[0], documentImage: '' }]]) {
      const result = reconcileSnapshot(local, cloud, item => item.number, true, previous);
      expect(result.records[0].documentImage).toBe('indexeddb:unresolved-synthetic');
      expect(result.updated).toBe(1);
    }
  });
  it('preserves a local edit even when the server also changes', () => {
    const previous = [rec('p1', 'PR-1', 1)];
    const local = [rec('p1', 'PR-1', 2)];
    const cloud = [rec('p1', 'PR-1', 3)];
    const result = reconcileSnapshot(local, cloud, item => item.number, true, previous);
    expect(result.records).toEqual(local);
    expect(result.updated).toBe(0);
    expect(result.differences[0].reason).toBe('different');
  });
  it('does not adopt updates from the first or a non-authoritative snapshot', () => {
    const previous = [rec('p1', 'PR-1', 1)];
    const cloud = [rec('p1', 'PR-1', 2)];
    expect(reconcile(previous, cloud).records).toEqual(previous);
    expect(reconcileSnapshot(previous, cloud, item => item.number, false, previous).records).toEqual(previous);
  });
  it('never applies deletion, duplicate-ID or ambiguous-number updates', () => {
    const previous = [rec('p1', 'PR-1', 1)];
    expect(reconcileSnapshot(previous, [], item => item.number, true, previous).records).toEqual(previous);
    const duplicates = [rec('p1', 'PR-1', 2), rec('p1', 'PR-1', 3)];
    expect(reconcileSnapshot(previous, duplicates, item => item.number, true, previous).records).toEqual(previous);
    const ambiguous = [rec('p1', 'PR-1', 2), rec('p2', 'pr 1', 3)];
    const result = reconcileSnapshot(previous, ambiguous, item => item.number, true, previous);
    expect(result.records[0]).toEqual(previous[0]);
    expect(result.differences.some(d => d.reason === 'same-number')).toBe(true);
  });
  it('appends cloud records even with a large local history', () => {
    const local = Array.from({ length: 600 }, (_, index) => rec(`l${index}`, `DC-${index}`, index));
    const result = reconcile(local, [rec('new', 'DC-800', 5)], false);
    expect(result.records).toHaveLength(601); expect(result.records[600].id).toBe('new');
  });
});
