import { CONFIG } from '../constants/config';
import { TwitterBookmarkExtractor } from '../extractors/twitter-bookmark-extractor';
import { sendMessage } from '../messaging/client';
import { MessageType } from '../messaging/messages';
import { CollectionStatus, type CollectionState } from '../types/collection';
import type { Bookmark } from '../types/bookmark';
import { debounce } from '../utils/throttle';
import { elapsedSince } from '../utils/time';
import { AutoScrollManager } from './auto-scroll-manager';

export class BookmarkCollector {
  private readonly extractor = new TwitterBookmarkExtractor();
  private readonly scrollManager = new AutoScrollManager();
  private readonly seenIds = new Set<string>();
  private readonly pending = new Map<string, Bookmark>();
  private observer?: MutationObserver;
  private flushTimer?: ReturnType<typeof setTimeout>;
  private state: CollectionState = { status: CollectionStatus.Idle, collectedCount: 0, updatedAt: new Date().toISOString(), elapsedMs: 0 };
  private active = false;

  async start(scrollDelayMs?: number): Promise<void> {
    if (this.active) return;
    if (!this.extractor.matches(new URL(window.location.href))) throw new Error('Open the X Bookmarks page first.');
    if (!this.extractor.isBookmarksView(document)) throw new Error('Select the Bookmarks tab in X History first.');
    this.active = true; this.seenIds.clear(); this.pending.clear();
    await this.update(CollectionStatus.Loading);
    const observe = debounce(() => this.collectFrom(document), CONFIG.collection.observerDebounceMs);
    this.observer = new MutationObserver(observe);
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.collectFrom(document);
    await this.update(CollectionStatus.Collecting);
    void this.scrollManager.start({
      onScroll: () => { void this.update(CollectionStatus.Scrolling); },
      onComplete: () => { void this.finish(CollectionStatus.Completed); },
      onError: (error) => { void this.finish(CollectionStatus.Failed, error.message); },
    }, { delayMs: scrollDelayMs });
  }

  async stop(): Promise<void> { if (this.active) await this.finish(CollectionStatus.Stopped); }

  private collectFrom(root: ParentNode): void {
    if (!this.active) return;
    for (const element of this.extractor.findTweetElements(root)) {
      const bookmark = this.extractor.extract(element);
      if (bookmark && !this.seenIds.has(bookmark.id)) { this.seenIds.add(bookmark.id); this.pending.set(bookmark.id, bookmark); }
    }
    this.scheduleFlush();
  }
  private scheduleFlush(): void {
    if (!this.pending.size || this.flushTimer) return;
    this.flushTimer = setTimeout(() => { void this.flush(); }, CONFIG.collection.flushDelayMs);
  }
  private async flush(): Promise<void> {
    this.flushTimer = undefined;
    const bookmarks = [...this.pending.values()]; this.pending.clear();
    if (!bookmarks.length) return;
    const response = await sendMessage<number>({ type: MessageType.SaveBookmarks, payload: bookmarks });
    if (!response.ok) return void this.finish(CollectionStatus.Failed, response.error);
    this.state.collectedCount += response.data; await this.update(this.state.status);
  }
  private async update(status: CollectionStatus, error?: string): Promise<void> {
    this.state = { ...this.state, status, error, startedAt: this.state.startedAt ?? new Date().toISOString(), updatedAt: new Date().toISOString(), elapsedMs: elapsedSince(this.state.startedAt) };
    await sendMessage({ type: MessageType.CollectionProgress, payload: this.state });
  }
  private async finish(status: CollectionStatus, error?: string): Promise<void> {
    this.scrollManager.stop(); this.observer?.disconnect(); this.observer = undefined; this.active = false;
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = undefined; await this.flush(); }
    await this.update(status, error);
  }
}
