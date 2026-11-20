import { describe, expect, it, vi } from 'vitest';
import { roleFromClaims, canEdit, canDelete } from '../src/lib/roles';
import { parseRoleArguments, manageRole } from '../scripts/manage-role.mjs';
describe('portal role policy', () => {
  it('fails closed for unassigned and invalid roles', () => {
    expect(roleFromClaims({})).toBeNull(); expect(roleFromClaims({ portalRole: 'ADMIN' })).toBeNull();
    expect(canEdit(roleFromClaims({}))).toBe(false); expect(canDelete(roleFromClaims({}))).toBe(false);
  });
  it('allows editors to edit, and only admins to delete', () => {
    expect([canEdit('viewer'), canDelete('viewer')]).toEqual([false, false]);
    expect([canEdit('editor'), canDelete('editor')]).toEqual([true, false]);
    expect([canEdit('admin'), canDelete('admin')]).toEqual([true, true]);
  });
});
describe('role assignment safety', () => {
  it('defaults to read-only preview and requires matching project and UID confirmations to apply', () => {
    const base = ['--project', 'demo-star-electric', '--uid', 'user-1', '--role', 'editor'];
    expect(parseRoleArguments(base).apply).toBeUndefined();
    expect(() => parseRoleArguments([...base, '--apply'])).toThrow(/confirm-project/i);
    expect(() => parseRoleArguments([...base, '--apply', '--confirm-project', 'demo-star-electric', '--confirm-uid', 'other'])).toThrow(/confirm-uid/i);
    expect(() => parseRoleArguments(['--project', 'demo-star-electric', '--uid', 'user-1', '--role', 'owner'])).toThrow(/viewer, editor or admin/i);
  });
  it('preserves unrelated claims and never writes during dry run', async () => {
    const auth = { getUser: vi.fn(async () => ({ uid: 'user-1', customClaims: { portalRole: 'viewer', other: true } })), setCustomUserClaims: vi.fn(async () => {}) };
    const options = parseRoleArguments(['--project', 'demo-star-electric', '--uid', 'user-1', '--role', 'editor']);
    expect(await manageRole(auth, options)).toMatchObject({ before: 'viewer', after: 'editor', applied: false });
    expect(auth.setCustomUserClaims).not.toHaveBeenCalled();
    const confirmed = parseRoleArguments(['--project', 'demo-star-electric', '--uid', 'user-1', '--role', 'editor', '--apply', '--confirm-project', 'demo-star-electric', '--confirm-uid', 'user-1']);
    await manageRole(auth, confirmed);
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-1', { portalRole: 'editor', other: true });
  });
});
