import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
const run = (mode: string, vars: Record<string, string> = {}) => execFileSync(process.execPath, ['scripts/check-release.mjs', mode], {
  env: { PATH: process.env.PATH, PORTAL_DATA_RELEASE_APPROVED: '', PORTAL_ROLES_MIGRATED: '', PORTAL_RULES_RELEASE_APPROVED: '', ...vars }, encoding: 'utf8', stdio: 'pipe'
});
describe('Firebase release approvals', () => {
  it('requires both data review and role migration for Hosting', () => {
    expect(() => run('hosting')).toThrow();
    expect(() => run('hosting', { PORTAL_DATA_RELEASE_APPROVED: 'true' })).toThrow();
    expect(run('hosting', { PORTAL_DATA_RELEASE_APPROVED: 'true', PORTAL_ROLES_MIGRATED: 'true' })).toContain('flags are present');
  });
  it('requires separate approval for security rules', () => {
    const base = { PORTAL_DATA_RELEASE_APPROVED: 'true', PORTAL_ROLES_MIGRATED: 'true' };
    expect(() => run('rules', base)).toThrow();
    expect(run('rules', { ...base, PORTAL_RULES_RELEASE_APPROVED: 'true' })).toContain('flags are present');
    expect(() => run('invalid', base)).toThrow();
  });
});
