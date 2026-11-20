import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = resolve('scripts/validateFirebaseConfig.mjs');
function run(dir: string, env: NodeJS.ProcessEnv) {
  return execFileSync(process.execPath, [script], { cwd: dir, env, encoding: 'utf8', stdio: 'pipe' });
}
describe('deployment configuration guard', () => {
  it('blocks missing Firebase configuration and accepts configured production environments', () => {
    const dir = mkdtempSync(join(tmpdir(), 'star-firebase-validation-'));
    try {
      expect(() => run(dir, { PATH: process.env.PATH })).toThrow();
      writeFileSync(join(dir, '.env.production'), 'VITE_FIREBASE_API_KEY=test-key\nVITE_FIREBASE_APP_ID=test-app\n');
      expect(run(dir, { PATH: process.env.PATH })).toContain('configuration is present');
      expect(() => run(dir, { PATH: process.env.PATH, VITE_FIREBASE_APP_ID: '' })).toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
