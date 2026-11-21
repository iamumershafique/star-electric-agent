// Runs the actual npm script in child processes. Every network/AI/Firebase call is blocked or mocked by the preload.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const folder = 'syntheticFolder00000000000000001';
const first = 'syntheticFile000000000000000001';
const second = 'syntheticFile000000000000000002';
const preload = resolve('tests/fixtures/drive-watcher-preload.cjs');
function run(scenario: string, extra: string[] = ['--dry-run', '--once'], input = '') {
  const env = {
    PATH: process.env.PATH, HOME: '/tmp', NODE_OPTIONS: `--require=${preload}`,
    npm_config_update_notifier: 'false', WATCHER_SYNTHETIC_SCENARIO: scenario,
    DRIVE_FOLDER_ID: folder, DRIVE_INPUT: input, GOOGLE_DRIVE_API_KEY: 'synthetic-key',
    GEMINI_API_KEY: 'synthetic-key', VITE_FIREBASE_PROJECT_ID: 'demo-synthetic',
    VITE_FIREBASE_API_KEY: 'synthetic-key', VITE_FIREBASE_APP_ID: 'synthetic-app',
    FIREBASE_AUTH_EMAIL: 'synthetic-user', FIREBASE_AUTH_PASSWORD: 'synthetic-password',
  };
  const result = spawnSync('npm', ['run', 'drive:watch', '--', ...extra], { env, encoding: 'utf8', timeout: 15_000 });
  expect(result.error).toBeUndefined();
  const output = result.stdout + result.stderr;
  expect(output).not.toContain(folder); expect(output).not.toContain(first); expect(output).not.toContain(second);
  expect(output).not.toContain('hidden-'); expect(output).not.toContain('https://'); expect(output).not.toContain('synthetic-key');
  expect(output).not.toContain('MOCK_FOLDER_DOWNLOAD');
  return { ...result, output };
}
function noSideEffects(output: string) {
  expect(output).not.toContain('MOCK_FILE_DOWNLOAD'); expect(output).not.toContain('MOCK_OCR');
  expect(output).not.toContain('MOCK_AI_CLIENT'); expect(output).not.toContain('MOCK_FIREBASE'); expect(output).not.toContain('MOCK_WRITE');
}
describe('npm drive:watch entry point, synthetic single cycle', () => {
  it('lists candidates across pages without media, OCR, Firebase, or writes', () => {
    const result = run('pages'); expect(result.status).toBe(0);
    expect(result.output).toContain('Dry run: 2 scan candidate(s).');
    expect(result.output).toContain('Candidate 1: image/jpeg.'); expect(result.output).toContain('Candidate 2: image/png.');
    expect(result.output).toContain('Dry run totals: 0 downloaded, 0 OCR, 0 written.'); noSideEffects(result.output);
  });
  it('reports an empty folder', () => {
    const result = run('empty'); expect(result.status).toBe(0); expect(result.output).toContain('Dry run: 0 scan candidate(s).'); noSideEffects(result.output);
  });
  it('reports folder listing 404 and exits unsuccessfully', () => {
    const result = run('not-found'); expect(result.status).toBe(1);
    expect(result.output).toContain('Sync failed — Folder could not be opened. (HTTP 404)'); noSideEffects(result.output);
  });
  it('does not process earlier pages after a later listing failure', () => {
    const result = run('later-failure'); expect(result.status).toBe(1);
    expect(result.output).toContain('Folder could not be opened.'); expect(result.output).not.toContain('Candidate 1'); noSideEffects(result.output);
  });
  it('stops a non-dry run before initializing Firebase if listing fails', () => {
    const result = run('not-found', ['--once']); expect(result.status).toBe(1);
    expect(result.output).toContain('Folder could not be opened.'); noSideEffects(result.output);
  });
  it('does not invoke OCR or write when a mocked download fails', () => {
    const result = run('download-404', ['--once']); expect(result.status).toBe(1);
    expect(result.output).toContain('MOCK_FILE_DOWNLOAD'); expect(result.output).not.toContain('MOCK_OCR');
    expect(result.output).not.toContain('MOCK_WRITE'); expect(result.output).toContain('1 attempted, 1 failed, 0 added');
  });
  it('resolves a direct file via actual metadata', () => {
    const result = run('direct', ['--dry-run', '--once'], `https://drive.google.com/file/d/${first}/view`);
    expect(result.status).toBe(0); expect(result.output).toContain('Dry run: 1 scan candidate(s).'); noSideEffects(result.output);
  });
  it('resolves a bare folder ID before listing', () => {
    const result = run('bare-folder', ['--dry-run', '--once'], folder);
    expect(result.status).toBe(0); expect(result.output).toContain('Dry run: 2 scan candidate(s).'); noSideEffects(result.output);
  });
  it('in a fully mocked non-dry cycle downloads only a child, not the folder', () => {
    const result = run('pages', ['--once']); expect(result.status).toBe(0);
    expect(result.output).toContain('MOCK_FILE_DOWNLOAD'); expect(result.output).toContain('MOCK_OCR');
    expect(result.output).toContain('MOCK_WRITE'); expect(result.output).not.toContain('MOCK_FOLDER_DOWNLOAD');
  });
});
