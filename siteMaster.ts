import master from '../data/siteMaster.json';
import { siteKey } from './utils';

interface MasterSite {
  name: string;
  review: boolean;
  note?: string;
  aliases: string[];
}

const SITES = (master as { sites: MasterSite[] }).sites;

/** alias key -> canonical name, confirmed entries only. */
const CONFIRMED = new Map<string, string>();
SITES.filter(s => !s.review).forEach(s => {
  CONFIRMED.set(siteKey(s.name), s.name);
  s.aliases.forEach(a => CONFIRMED.set(siteKey(a), s.name));
});

/** Canonical site name for a raw entry, or the trimmed raw name when unknown / unconfirmed. */
export function canonicalSiteName(raw: string | undefined | null): string {
  const trimmed = (raw || '').trim();
  return CONFIRMED.get(siteKey(trimmed)) || trimmed;
}

/** Grouping key used for counts and filters: confirmed aliases collapse to one location. */
export function siteGroupKey(raw: string | undefined | null): string {
  return siteKey(canonicalSiteName(raw));
}

/** Canonical names, for dropdowns on DC / PR entry. */
export const MASTER_SITE_NAMES: string[] = Array.from(new Set(SITES.filter(s => !s.review).map(s => s.name))).sort();
