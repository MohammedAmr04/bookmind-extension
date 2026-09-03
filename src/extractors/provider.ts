import type { Bookmark } from '../types/bookmark';

export interface BookmarkProvider {
  readonly id: string;
  matches(url: URL): boolean;
  findTweetElements(root: ParentNode): Element[];
  extract(element: Element): Bookmark | null;
}
