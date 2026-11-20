import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const readWorkflow = (path: string) => parse(readFileSync(path, 'utf8'));
describe('production deployment workflow', () => {
  it('deploys only approved, tested, latest main Hosting changes', () => {
    const flow = readWorkflow('.github/workflows/firebase-hosting.yml');
    expect(flow.on.push.branches).toEqual(['main']);
    expect(flow.jobs.deploy.if).toContain("github.ref == 'refs/heads/main'");
    const steps = flow.jobs.deploy.steps as Array<{ name?: string; run?: string }>;
    const commands = steps.map(step => step.run || '').join('\n');
    expect(commands).toContain('node scripts/check-release.mjs hosting');
    expect(flow.jobs.deploy.steps.find((s: {name?: string}) => s.name === 'Verify production release approval').env).toHaveProperty('PORTAL_ROLES_MIGRATED');
    expect(commands).toContain('npm run test:rules');
    expect(commands).toContain('npm test');
    expect(commands).toContain('npm run lint');
    expect(commands).toContain('npm run validate:firebase:production');
    expect(commands).toContain('npm run build');
    expect(commands).toContain('repos/$REPOSITORY/commits/main');
    expect(commands).toContain('firebase deploy --only hosting');
    expect(commands).not.toContain('--only firestore');
    expect(steps.findIndex(s => s.name === 'Verify this is still the latest main commit')).toBeLessThan(steps.findIndex(s => s.name === 'Deploy Hosting only'));
  });
  it('does not open PRs automatically for Arena session branches', () => {
    const flow = readWorkflow('.github/workflows/auto-pr.yml');
    expect(flow.on.push['branches-ignore']).toContain('arena/**');
  });
});
