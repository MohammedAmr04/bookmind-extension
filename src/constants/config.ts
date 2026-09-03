export const CONFIG = {
  collection: { observerDebounceMs: 150, flushDelayMs: 700, maxIdleScrolls: 4, maxScrolls: 500, scrollDelayMs: 850, scrollStepPx: 900 },
  network: { timeoutMs: 15_000, retryCount: 2, retryDelayMs: 1_000 },
} as const;

export const SELECTORS = {
  tweet: 'article[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  photo: '[data-testid="tweetPhoto"] img',
  video: 'video',
} as const;

export const X_BOOKMARK_PATHS = ['/i/history', '/i/bookmarks'] as const;
