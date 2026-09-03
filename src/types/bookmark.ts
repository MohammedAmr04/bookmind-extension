export interface Author { name: string; username: string; avatarUrl?: string; }
export type MediaType = 'image' | 'video' | 'gif';
export interface Media { type: MediaType; url?: string; thumbnailUrl?: string; }
export interface QuotedTweet { id: string; text?: string; author?: Author; url?: string; }
export interface Bookmark {
  id: string; text: string; author: Author; url: string; media: Media[]; createdAt?: string; bookmarkedAt?: string;
  externalLinks: string[]; quotedTweet?: QuotedTweet; isRetweet: boolean; isReply: boolean; language?: string; collectedAt: string;
}
