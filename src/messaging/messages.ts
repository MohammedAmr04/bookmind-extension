import type { Bookmark } from '../types/bookmark';
import type { CollectionState, ExtensionSettings } from '../types/collection';

export enum MessageType { StartCollection = 'collection/start', StopCollection = 'collection/stop', CollectionProgress = 'collection/progress', SaveBookmarks = 'bookmarks/save', GetState = 'state/get', Sync = 'sync/start', UpdateSettings = 'settings/update' }
export type ExtensionMessage =
  | { type: MessageType.StartCollection; payload?: { scrollDelayMs: number } } | { type: MessageType.StopCollection }
  | { type: MessageType.CollectionProgress; payload: CollectionState } | { type: MessageType.SaveBookmarks; payload: Bookmark[] }
  | { type: MessageType.GetState } | { type: MessageType.Sync } | { type: MessageType.UpdateSettings; payload: Partial<ExtensionSettings> };
export type MessageResponse<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
