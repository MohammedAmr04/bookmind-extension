import { CONFIG } from '../constants/config';
import { sleep } from '../utils/time';

export interface AutoScrollOptions { delayMs?: number; maxScrolls?: number; maxIdleScrolls?: number; stepPx?: number; }
export interface AutoScrollCallbacks { onScroll(): void; onComplete(): void; onError(error: Error): void; }

export class AutoScrollManager {
  private stopped = false;
  private mutationVersion = 0;
  private observer?: MutationObserver;

  async start(callbacks: AutoScrollCallbacks, options: AutoScrollOptions = {}): Promise<void> {
    this.stopped = false;
    const delayMs = options.delayMs ?? CONFIG.collection.scrollDelayMs;
    const maxScrolls = options.maxScrolls ?? CONFIG.collection.maxScrolls;
    const maxIdleScrolls = options.maxIdleScrolls ?? CONFIG.collection.maxIdleScrolls;
    const stepPx = options.stepPx ?? CONFIG.collection.scrollStepPx;
    this.observer = new MutationObserver(() => { this.mutationVersion += 1; });
    this.observer.observe(document.body, { childList: true, subtree: true });

    try {
      let idleScrolls = 0;
      for (let scrolls = 0; scrolls < maxScrolls && !this.stopped; scrolls += 1) {
        const before = this.mutationVersion;
        window.scrollBy({ top: stepPx, behavior: 'smooth' });
        callbacks.onScroll();
        await sleep(delayMs);
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        idleScrolls = before === this.mutationVersion ? idleScrolls + 1 : 0;
        if (atBottom && idleScrolls >= maxIdleScrolls) break;
      }
      if (!this.stopped) callbacks.onComplete();
    } catch (error) { callbacks.onError(error instanceof Error ? error : new Error('Scrolling failed.')); }
    finally { this.observer?.disconnect(); this.observer = undefined; }
  }
  stop(): void { this.stopped = true; this.observer?.disconnect(); }
}
