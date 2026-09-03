import type { Bookmark } from '../types/bookmark';
import { CollectionStatus, type AuthToken, type CollectionState, type ExtensionSettings } from '../types/collection';

const KEYS = { settings: 'settings', state: 'collectionState', bookmarks: 'bookmarks', lastSync: 'lastSync', authToken: 'authToken' } as const;
const DEFAULT_SETTINGS: ExtensionSettings = { autoScrollDelayMs: 850, loggingEnabled: false };
const IDLE_STATE: CollectionState = { status: CollectionStatus.Idle, collectedCount: 0, updatedAt: new Date(0).toISOString(), elapsedMs: 0 };

export class ExtensionStorage {
  async getSettings(): Promise<ExtensionSettings> { const value = await chrome.storage.local.get(KEYS.settings); return { ...DEFAULT_SETTINGS, ...value[KEYS.settings] }; }
  async updateSettings(settings: Partial<ExtensionSettings>): Promise<ExtensionSettings> { const next = { ...(await this.getSettings()), ...settings }; await chrome.storage.local.set({ [KEYS.settings]: next }); return next; }
  async getState(): Promise<CollectionState> { const value = await chrome.storage.session.get(KEYS.state); return value[KEYS.state] ?? IDLE_STATE; }
  async setState(state: CollectionState): Promise<void> { await chrome.storage.session.set({ [KEYS.state]: state }); }
  async appendBookmarks(incoming: Bookmark[]): Promise<number> {
    const value = await chrome.storage.local.get(KEYS.bookmarks); const current: Bookmark[] = value[KEYS.bookmarks] ?? [];
    const ids = new Set(current.map((bookmark) => bookmark.id)); const unique = incoming.filter((bookmark) => !ids.has(bookmark.id));
    if (unique.length) await chrome.storage.local.set({ [KEYS.bookmarks]: [...current, ...unique] }); return unique.length;
  }
  async getBookmarks(): Promise<Bookmark[]> { const value = await chrome.storage.local.get(KEYS.bookmarks); return value[KEYS.bookmarks] ?? []; }
  async setLastSync(value: string): Promise<void> { await chrome.storage.local.set({ [KEYS.lastSync]: value }); }
  async getLastSync(): Promise<string | undefined> { const value = await chrome.storage.local.get(KEYS.lastSync); return value[KEYS.lastSync]; }
  async setAuthToken(token: AuthToken): Promise<void> { await chrome.storage.local.set({ [KEYS.authToken]: token }); }
  async getAuthToken(): Promise<AuthToken | undefined> { const value = await chrome.storage.local.get(KEYS.authToken); return value[KEYS.authToken]; }
}
