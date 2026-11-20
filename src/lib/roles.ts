/** Client checks are only for user experience. Firebase rules enforce these permissions. */
export type PortalRole = 'viewer' | 'editor' | 'admin';
export function roleFromClaims(claims: Record<string, unknown>): PortalRole | null {
  const role = claims.portalRole;
  return role === 'viewer' || role === 'editor' || role === 'admin' ? role : null;
}
export function canEdit(role: PortalRole | null | undefined): boolean { return role === 'editor' || role === 'admin'; }
export function canDelete(role: PortalRole | null | undefined): boolean { return role === 'admin'; }
