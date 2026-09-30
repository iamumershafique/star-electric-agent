/**
 * Scan quality / speed trade-off for local (Ollama) OCR.
 *
 * The local vision model spends most of its time on image patches: a 1344 px scan is
 * about 2 300 image tokens for the model to look at, while the printed Star Electric
 * forms stay readable at ~1 150 px. The image side therefore drives scan time almost
 * linearly, so it is exposed as a setting instead of being hard-coded.
 */
export type ScanQuality = 'fast' | 'balanced' | 'accurate';

export const SCAN_QUALITY_ORDER: readonly ScanQuality[] = ['fast', 'balanced', 'accurate'];

/** Longest image side sent to the model per quality level. */
export const SCAN_QUALITY_IMAGE_SIDE: Record<ScanQuality, number> = {
  fast: 896,
  balanced: 1152,
  accurate: 1536
};

export const DEFAULT_SCAN_QUALITY: ScanQuality = 'balanced';

export const SCAN_QUALITY_LABEL: Record<ScanQuality, string> = {
  fast: 'Fast (896 px)',
  balanced: 'Balanced (1152 px)',
  accurate: 'Accurate (1536 px)'
};

export const SCAN_QUALITY_HELP: Record<ScanQuality, string> = {
  fast: 'Roughly twice as fast as before. Best for clean, printed challans and slow CPUs; small handwriting can be missed.',
  balanced: 'Recommended. About 30% faster than the old 1344 px setting with the same readability for the Star Electric forms.',
  accurate: 'Highest detail for faint or handwritten scans. Slower: use only when a scan fails at the other settings.'
};

export function normalizeScanQuality(value: unknown): ScanQuality {
  return typeof value === 'string' && (SCAN_QUALITY_ORDER as readonly string[]).includes(value)
    ? value as ScanQuality
    : DEFAULT_SCAN_QUALITY;
}

export function imageSideForQuality(quality: ScanQuality | undefined): number {
  return SCAN_QUALITY_IMAGE_SIDE[normalizeScanQuality(quality)];
}
