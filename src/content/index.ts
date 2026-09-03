import { BookmarkCollector } from './bookmark-collector';
import { MessageType, type ExtensionMessage, type MessageResponse } from '../messaging/messages';

const collector = new BookmarkCollector();
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse: (response: MessageResponse) => void) => {
  if (message.type === MessageType.StartCollection) { void collector.start(message.payload?.scrollDelayMs).then(() => sendResponse({ ok: true, data: undefined })).catch((error: Error) => sendResponse({ ok: false, error: error.message })); return true; }
  if (message.type === MessageType.StopCollection) { void collector.stop().then(() => sendResponse({ ok: true, data: undefined })).catch((error: Error) => sendResponse({ ok: false, error: error.message })); return true; }
  return false;
});
