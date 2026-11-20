import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectLegacyBackup, parseLegacyBackup } from '../src/lib/legacyBackup';
import { createBackupFromRecords, verifyDeviceBackup } from '../src/lib/backupFormat';

const sample = {
  version: '1.0', timestamp: '2026-01-01T00:00:00Z', client: 'Fixture',
  prs: [
    { id: 'p1', prNumber: 'PR-1', items: [], fulfillmentLogs: [], documentImage: 'indexeddb:pr_pr_1' },
    { id: 'p2', prNumber: 'PR 1', items: [], fulfillmentLogs: [] },
  ],
  dcs: [
    { id: 'd1', dcNumber: 'DC-1', prId: 'missing', prNumber: 'PR-1', itemsShipped: [], documentImage: 'data:image/png;base64,YQ==' },
    { id: 'd2', dcNumber: 'DC-2', prId: 'missing2', prNumber: 'PR-2', itemsShipped: [], documentImage: 'https://example.com/doc' },
    { id: 'd3', dcNumber: 'DC-3', prId: 'p1', prNumber: 'PR-3', itemsShipped: [] },
  ]
};
const tempDirs: string[] = [];
function dir() { const d = mkdtempSync(join(tmpdir(), 'star-backup-test-')); tempDirs.push(d); return d; }
function cli(...args: string[]) {
  return execFileSync(process.execPath, [resolve('node_modules/tsx/dist/cli.mjs'), resolve('scripts/inspect-backup.ts'), ...args], { encoding: 'utf8', stdio: 'pipe' });
}
afterEach(() => { while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true }); });

describe('legacy backup inspection and migration', () => {
  it('reports ambiguous links, conflicts, duplicates and scan references without changing records', () => {
    const json = JSON.stringify(sample);
    const backup = parseLegacyBackup(json);
    const report = inspectLegacyBackup(backup);
    expect(report).toMatchObject({ prCount: 2, dcCount: 3, danglingLinkCount: 2,
      danglingWithAmbiguousNumberMatch: 1, danglingWithoutNumberMatch: 1,
      duplicateNormalizedPRNumbers: 1, conflictingLinkNumbers: 1, uniqueIndexedDBReferences: 1 });
    expect(report.imageValues).toEqual({ embedded: 1, indexeddbReferences: 1, externalOrOther: 1 });
    expect(backup.prs).toEqual(sample.prs);
    expect(backup.dcs).toEqual(sample.dcs);
    expect(JSON.stringify(sample)).toBe(json);
  });

  it('refuses non-v1, malformed JSON and malformed entries', () => {
    expect(() => parseLegacyBackup('{')).toThrow(/JSON/);
    expect(() => parseLegacyBackup('{"version":"2.0","prs":[],"dcs":[]}')).toThrow(/version 1/);
    expect(() => parseLegacyBackup('{"version":"1.0","prs":[null],"dcs":[]}')).toThrow(/malformed/);
  });

  it('inspect is read-only; conversion requires acknowledgment and never overwrites', async () => {
    const base = dir(); const input = join(base, 'source.json'); const output = join(base, 'converted.json');
    const raw = JSON.stringify(sample); writeFileSync(input, raw);
    const report = JSON.parse(cli(input, '--details'));
    expect(report.danglingLinkCount).toBe(2);
    expect(report.danglingLinks[0].matchingPRNumbers).toBe(2);
    expect(report.conversionPreview.missingLocalReferences).toBe(1);
    expect(readFileSync(input, 'utf8')).toBe(raw);
    expect(existsSync(output)).toBe(false);
    expect(() => cli(input, '--output', output)).toThrow();
    expect(existsSync(output)).toBe(false);
    cli(input, '--output', output, '--acknowledge-incomplete');
    const result = await verifyDeviceBackup(readFileSync(output, 'utf8'));
    expect(result.payload.prs[0].id).toBe('p1');
    expect(result.payload.dcs[0].prId).toBe('missing');
    expect(result.payload.legacyMetadata).toMatchObject({ source: { client: 'Fixture', version: '1.0' } });
    expect(result.summary.missingLocalReferences).toBe(1);
    const originalOutput = readFileSync(output, 'utf8');
    expect(() => cli(input, '--output', output, '--acknowledge-incomplete')).toThrow();
    expect(readFileSync(output, 'utf8')).toBe(originalOutput);
    expect(readFileSync(input, 'utf8')).toBe(raw);
  });

  it('can use a verified separate local scan archive without changing any links', async () => {
    const base = dir(); const input = join(base, 'legacy.json'); const donor = join(base, 'scans.json');
    writeFileSync(input, JSON.stringify(sample));
    const image = { id: 'pr_pr_1', type: 'pr' as const, referenceNumber: 'PR-1', dataUrl: 'data:image/png;base64,Yg==', updatedAt: 1 };
    const donorFile = await createBackupFromRecords([], [], [image]);
    writeFileSync(donor, donorFile.json);
    const report = JSON.parse(cli(input, '--images-from', donor));
    expect(report.conversionPreview.missingLocalReferences).toBe(0);
    expect(report.danglingLinkCount).toBe(2);
    const bad = JSON.parse(donorFile.json); bad.payload.images[0].dataUrl = 'data:image/png;base64,Yw==';
    writeFileSync(donor, JSON.stringify(bad));
    expect(() => cli(input, '--images-from', donor)).toThrow();
  });

  it('refuses output inside the repository', () => {
    const base = dir(); const input = join(base, 'source.json'); writeFileSync(input, JSON.stringify(sample));
    const output = resolve('.unsafe-backup-test.json');
    expect(() => cli(input, '--output', output, '--acknowledge-incomplete')).toThrow();
    expect(existsSync(output)).toBe(false);
  });

  it('reports structural conversion errors without writing a file', () => {
    const base = dir(); const input = join(base, 'bad-records.json'); const output = join(base, 'out.json');
    const data = JSON.parse(JSON.stringify(sample)); data.prs[0].items = null; writeFileSync(input, JSON.stringify(data));
    const result = spawnSync(process.execPath, [resolve('node_modules/tsx/dist/cli.mjs'), resolve('scripts/inspect-backup.ts'), input], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    const report = JSON.parse(result.stdout);
    expect(report.invalidPRs).toBe(1);
    expect(report.conversionError).toMatch(/invalid/i);
    expect(() => cli(input, '--output', output, '--acknowledge-incomplete')).toThrow();
    expect(existsSync(output)).toBe(false);
  });
});
