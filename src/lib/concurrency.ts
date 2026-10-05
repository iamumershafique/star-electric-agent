/**
 * Small async helpers used by the PR/DC scan pipelines.
 *
 * Scans used to run strictly one file after another with a fixed 300 ms pause between
 * Gemini calls. On a 20-file batch that is 20 sequential round trips plus ~6 s of
 * sleeping. These helpers let the upload modals overlap independent work (bounded
 * concurrency) while still honouring provider rate limits through a shared gate.
 */

/**
 * Runs `worker` over `items` with at most `limit` promises in flight.
 * Results keep the input order. The first rejection stops scheduling new work and
 * rejects the whole call (callers that need per-item error isolation should catch
 * inside their worker).
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const width = Math.max(1, Math.min(Math.floor(limit) || 1, items.length));
  let nextIndex = 0;
  let failure: unknown = null;

  const runners = Array.from({ length: width }, async () => {
    while (failure === null) {
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        failure = error;
        return;
      }
    }
  });

  await Promise.all(runners);
  if (failure !== null) throw failure;
  return results;
}

/**
 * Shared pause/backoff gate. Every provider request awaits `wait()` first; when a call
 * is rejected with a rate-limit error, `penalize()` holds all other in-flight work back
 * for a cooldown so the batch does not burn its quota on retries.
 */
export class RequestGate {
  private pausedUntil = 0;
  private readonly defaultCooldownMs: number;

  constructor(defaultCooldownMs = 4000) {
    this.defaultCooldownMs = defaultCooldownMs;
  }

  /** Milliseconds the gate is currently paused for (0 when open). */
  get remainingPauseMs(): number {
    return Math.max(0, this.pausedUntil - Date.now());
  }

  /** Blocks until the current cooldown (if any) has elapsed. */
  async wait(): Promise<void> {
    let remaining = this.remainingPauseMs;
    while (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
      remaining = this.remainingPauseMs;
    }
  }

  /** Pauses every request passing through this gate for `ms` (default 4 s). */
  penalize(ms: number = this.defaultCooldownMs): void {
    const until = Date.now() + Math.max(0, ms);
    if (until > this.pausedUntil) this.pausedUntil = until;
  }

  /** Clears any cooldown (used after a successful probe). */
  reset(): void {
    this.pausedUntil = 0;
  }
}

/** True for provider errors that mean "you are calling too often". */
export function isRateLimitError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
  return message.includes('429')
    || message.includes('resource_exhausted')
    || message.includes('rate limit')
    || message.includes('rate-limit')
    || message.includes('quota');
}
