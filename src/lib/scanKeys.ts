export type ScanType = 'pr' | 'dc' | 'builty';

/** Canonical key for a stored scan, e.g. ("dc", "DC-685") -> "dc_dc_685". Used locally and in Firestore. */
export function normalizeImageKey(type: ScanType, idOrNumber: string): string {
  const clean = (idOrNumber || '').trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${type}_${clean}`;
}

/** Returns the stored key behind an "indexeddb:" or "cloud:" reference, or null for data:/http(s) values. */
export function scanKeyFromReference(reference: string | undefined): string | null {
  if (!reference) return null;
  const match = reference.match(/^(?:indexeddb|cloud):(.+)$/);
  return match ? match[1] : null;
}

export function scanTypeFromKey(key: string): ScanType {
  if (key.startsWith('pr_')) return 'pr';
  if (key.startsWith('dc_')) return 'dc';
  return 'builty';
}
