import { CONFIG } from '../constants/config';
import { ExtensionStorage } from '../storage/storage';
import { sleep } from '../utils/time';

export class SyncService {
  constructor(private readonly storage: ExtensionStorage) {}

  async sync(): Promise<{ syncedCount: number; syncedAt: string }> {
    const settings = await this.storage.getSettings();
    if (!settings.backendUrl) throw new Error('Set a backend URL before syncing.');
    const bookmarks = await this.storage.getBookmarks();
    let lastError = new Error('Sync failed.');
    for (let attempt = 0; attempt <= CONFIG.network.retryCount; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.network.timeoutMs);
      try {
        const response = await fetch(`${settings.backendUrl.replace(/\/$/, '')}/api/bookmarks/sync`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookmarks }), signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Sync failed with HTTP ${response.status}.`);
        const syncedAt = new Date().toISOString(); await this.storage.setLastSync(syncedAt);
        return { syncedCount: bookmarks.length, syncedAt };
      } catch (error) {
        lastError = error instanceof Error ? error : lastError;
        if (attempt < CONFIG.network.retryCount) await sleep(CONFIG.network.retryDelayMs * (attempt + 1));
      } finally { clearTimeout(timeout); }
    }
    throw lastError;
  }
}
