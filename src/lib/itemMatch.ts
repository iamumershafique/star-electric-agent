/**
 * Fuzzy line-item matching shared by the DC scan flow.
 *
 * A challan photo rarely spells an item exactly like the requisition row, so a scanned
 * item has to be lined up with the PR row it fulfils - that link is what carries the
 * shipped quantity back into the requisition.
 *
 * NOTE: the previous in-component matcher used a broken Levenshtein routine (the cost
 * row was never re-initialised for the first column, so the distance was wildly
 * overestimated). "limit switch" vs "lint switch" scored 9 instead of 1, which pushed
 * every near-identical pair below the 0.8 threshold and broke PR fulfilment after a
 * DC scan. This module replaces it with a correct edit distance, word overlap, and a
 * guard that keeps different cable sizes / ratings apart.
 */

/** Lowercase, punctuation to spaces, collapse whitespace. Keeps digits glued to units. */
export function normalizeMatchText(value: string | undefined | null): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits "630amp" -> ["630", "amp"] and "mm2" -> ["mm", "2"] so units line up. */
function tokenize(text: string): string[] {
  return text
    .split(' ')
    .flatMap(token => token.split(/(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])/))
    .filter(Boolean);
}

/** Standard Levenshtein distance with two rolling rows (correct on every input). */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (a.length < b.length) [a, b] = [b, a]; // keep the shorter string on the row axis

  let previous = new Array<number>(b.length + 1);
  let current = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) previous[j] = j;

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
    }
    const swap = previous;
    previous = current;
    current = swap;
  }
  return previous[b.length];
}

/** 0..1 similarity based on edit distance. */
export function editSimilarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return (longest - levenshteinDistance(a, b)) / longest;
}

/** 0..1 similarity based on how many words the two descriptions share. */
export function tokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const [small, big] = tokensA.size <= tokensB.size ? [tokensA, tokensB] : [tokensB, tokensA];
  let shared = 0;
  small.forEach(token => {
    if (big.has(token)) shared += 1;
  });
  const containment = shared / small.size; // is the shorter description fully covered?
  const coverage = shared / big.size; // how much of the longer description it explains
  if (containment === 1) return 0.75 + 0.25 * coverage;
  return containment * 0.8;
}

const UNIT_ALIASES: Record<string, string> = {
  a: 'amp', amp: 'amp', amps: 'amp', ampere: 'amp', amperes: 'amp',
  mm: 'mm', mm2: 'mm', sqmm: 'mm', sqmms: 'mm',
  core: 'core', cores: 'core', c: 'core',
  pin: 'pin', pins: 'pin', pole: 'pole', poles: 'pole',
  v: 'v', kv: 'kv', w: 'w', kw: 'kw', hp: 'hp',
  m: 'm', meter: 'm', metre: 'm', meters: 'm', metres: 'm',
  ft: 'ft', feet: 'ft', kg: 'kg', ton: 'ton', tons: 'ton',
  pcs: 'pcs', pc: 'pcs', nos: 'pcs', no: 'pcs', number: 'pcs', numbers: 'pcs'
};

const DIMENSION_PATTERN = new RegExp(
  `(\\d+(?:\\.\\d+)?)\\s*(${Object.keys(UNIT_ALIASES).join('|')})(?![a-z0-9])`,
  'g'
);

/** Maps a unit dimension ("mm", "amp", "core", ...) to the values used with it. */
function dimensionValues(text: string): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  for (const match of text.matchAll(DIMENSION_PATTERN)) {
    const value = match[1];
    const unit = UNIT_ALIASES[match[2]];
    if (!unit) continue;
    const values = found.get(unit) || new Set<string>();
    values.add(value);
    found.set(unit, values);
  }
  return found;
}

/**
 * True when both descriptions state the same kind of measurement (size, rating, cores,
 * phases) with completely different values - "Cable 4mm" is not "Cable 6mm", and
 * "MCCB 100A" is not "MCCB 200A", even though the wording is nearly identical.
 */
function hasDimensionConflict(a: string, b: string): boolean {
  const first = dimensionValues(a);
  const second = dimensionValues(b);
  for (const [unit, values] of first) {
    const other = second.get(unit);
    if (!other || other.size === 0) continue;
    let shared = false;
    values.forEach(value => {
      if (other.has(value)) shared = true;
    });
    if (!shared) return true;
  }
  return false;
}

/**
 * Best-effort similarity of two item descriptions, 0..1.
 * Combines edit distance with word overlap so "EOCR relay Schneider" still matches
 * "EOCR - Electronic Overload control Relay Schneider", and blocks different
 * sizes/ratings from matching each other.
 */
export function itemNameSimilarity(first: string, second: string): number {
  const a = normalizeMatchText(first);
  const b = normalizeMatchText(second);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const score = Math.max(editSimilarity(a, b), tokenSimilarity(a, b));
  return hasDimensionConflict(a, b) ? Math.min(score, 0.5) : score;
}

export interface ItemMatch<T> {
  item: T;
  score: number;
}

/**
 * Returns the closest candidate at or above `threshold`, or null when nothing is close enough.
 * A match means the scanned row and the requisition row are the same item.
 */
export function findBestItemMatch<T>(
  description: string,
  candidates: readonly T[],
  nameOf: (candidate: T) => string,
  threshold = 0.8
): ItemMatch<T> | null {
  let best: ItemMatch<T> | null = null;
  for (const candidate of candidates) {
    const score = itemNameSimilarity(description, nameOf(candidate));
    if (score >= threshold && (!best || score > best.score)) {
      best = { item: candidate, score };
    }
  }
  return best;
}
