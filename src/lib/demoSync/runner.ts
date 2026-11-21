import type { DemoCommand } from './command';
import type { DemoOutbox } from './outbox';

/** Starts one local demo retry worker. Stop prevents new attempts; in-flight transactions may finish. */
export function startDemoRetryWorker(
  outbox: DemoOutbox,
  commit: (command: DemoCommand) => Promise<unknown>,
  options: { intervalMs?: number; onError?: (error: unknown) => void; onlineEvents?: EventTarget } = {}
): () => void {
  const interval = options.intervalMs ?? 1000;
  if (!Number.isFinite(interval) || interval < 100) throw new Error('Retry interval must be at least 100ms.');
  let stopped = false;
  let running = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wake = () => {
    if (stopped || running) return;
    if (timer) clearTimeout(timer);
    running = true;
    void outbox.processOne(commit).catch(error => options.onError?.(error)).finally(() => {
      running = false;
      if (!stopped) timer = setTimeout(wake, interval);
    });
  };
  options.onlineEvents?.addEventListener('online', wake);
  wake();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    options.onlineEvents?.removeEventListener('online', wake);
  };
}
