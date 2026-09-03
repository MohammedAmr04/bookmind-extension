import { SELECTORS, X_BOOKMARK_PATHS } from '../constants/config';
import type { Bookmark, Media } from '../types/bookmark';
import type { BookmarkProvider } from './provider';

const STATUS_PATH = /\/([^/]+)\/status\/(\d+)/;
const X_HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']);

export class TwitterBookmarkExtractor implements BookmarkProvider {
  readonly id = 'twitter';

  matches(url: URL): boolean { return X_HOSTS.has(url.hostname) && X_BOOKMARK_PATHS.includes(url.pathname as (typeof X_BOOKMARK_PATHS)[number]); }
  isBookmarksView(root: ParentNode): boolean {
    const selectedTab = root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    return selectedTab?.textContent?.trim().toLowerCase() === 'bookmarks';
  }
  findTweetElements(root: ParentNode): Element[] { return Array.from(root.querySelectorAll(SELECTORS.tweet)); }

  extract(element: Element): Bookmark | null {
    const statusLink = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href*="/status/"]')).find((link) => STATUS_PATH.test(link.pathname));
    const match = statusLink?.pathname.match(STATUS_PATH);
    if (!statusLink || !match) return null;

    const userText = element.querySelector(SELECTORS.userName)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const username = userText.match(/@([\w_]+)/)?.[1] ?? match[1];
    const name = userText.replace(/@([\w_]+)/, '').trim() || username;
    const text = element.querySelector(SELECTORS.tweetText)?.textContent?.trim() ?? '';
    const allText = element.textContent?.toLowerCase() ?? '';
    const media = this.extractMedia(element);
    const quoted = Array.from(element.querySelectorAll(SELECTORS.tweet)).find((tweet) => tweet !== element);

    return {
      id: match[2], text, author: { name, username, avatarUrl: this.extractAvatar(element) },
      url: new URL(statusLink.getAttribute('href')!, window.location.origin).toString(), media,
      createdAt: element.querySelector('time')?.getAttribute('datetime') ?? undefined,
      externalLinks: this.extractExternalLinks(element),
      quotedTweet: quoted ? this.extractQuotedTweet(quoted) : undefined,
      isRetweet: /reposted|retweeted/.test(allText), isReply: /replying to/.test(allText),
      language: element.getAttribute('lang') ?? undefined, collectedAt: new Date().toISOString(),
    };
  }

  private extractAvatar(element: Element): string | undefined {
    return Array.from(element.querySelectorAll<HTMLImageElement>('img[src]')).find((image) => image.src.includes('profile_images'))?.src;
  }
  private extractMedia(element: Element): Media[] {
    const images = Array.from(element.querySelectorAll<HTMLImageElement>(SELECTORS.photo)).map((image) => ({ type: 'image' as const, url: image.src }));
    const videos = Array.from(element.querySelectorAll<HTMLVideoElement>(SELECTORS.video)).map((video) => ({ type: 'video' as const, url: video.currentSrc || video.src, thumbnailUrl: video.poster || undefined }));
    return [...images, ...videos];
  }
  private extractExternalLinks(element: Element): string[] {
    return Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href]')).map((link) => link.href).filter((href) => {
      try { return !X_HOSTS.has(new URL(href).hostname); } catch { return false; }
    });
  }
  private extractQuotedTweet(element: Element) {
    const bookmark = this.extract(element);
    return bookmark ? { id: bookmark.id, text: bookmark.text, author: bookmark.author, url: bookmark.url } : undefined;
  }
}
