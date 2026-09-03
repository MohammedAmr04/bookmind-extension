import { MessageType, type ExtensionMessage, type MessageResponse } from '../messaging/messages';
import { SyncService } from '../services/sync-service';
import { ExtensionStorage } from '../storage/storage';
import { X_BOOKMARK_PATHS } from '../constants/config';

const storage = new ExtensionStorage();
const syncService = new SyncService(storage);

async function findBookmarksTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ url: X_BOOKMARK_PATHS.map((path) => `https://x.com${path}`) });
  return tabs.find((tab) => tab.id !== undefined);
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse: (response: MessageResponse<unknown>) => void) => {
  void (async () => {
    try {
      switch (message.type) {
        case MessageType.GetState:
          return sendResponse({ ok: true, data: { state: await storage.getState(), lastSync: await storage.getLastSync(), settings: await storage.getSettings() } });
        case MessageType.CollectionProgress:
          await storage.setState(message.payload); return sendResponse({ ok: true, data: undefined });
        case MessageType.SaveBookmarks:
          return sendResponse({ ok: true, data: await storage.appendBookmarks(message.payload) });
        case MessageType.UpdateSettings:
          return sendResponse({ ok: true, data: await storage.updateSettings(message.payload) });
        case MessageType.Sync:
          return sendResponse({ ok: true, data: await syncService.sync() });
        case MessageType.StartCollection:
        case MessageType.StopCollection: {
          const tab = await findBookmarksTab();
          if (!tab?.id) throw new Error('Open X History and select the Bookmarks tab first.');
          const command = message.type === MessageType.StartCollection
            ? { type: MessageType.StartCollection, payload: { scrollDelayMs: (await storage.getSettings()).autoScrollDelayMs } }
            : message;
          const response = await chrome.tabs.sendMessage(tab.id, command);
          return sendResponse(response);
        }
      }
    } catch (error) { sendResponse({ ok: false, error: error instanceof Error ? error.message : 'Unexpected extension error.' }); }
  })();
  return true;
});
