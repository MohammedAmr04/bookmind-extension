import type { ExtensionMessage, MessageResponse } from './messages';

export function sendMessage<T = undefined>(message: ExtensionMessage): Promise<MessageResponse<T>> {
  return new Promise((resolve) => chrome.runtime.sendMessage(message, (response: MessageResponse<T> | undefined) => {
    if (chrome.runtime.lastError) return resolve({ ok: false, error: chrome.runtime.lastError.message ?? 'Extension message failed.' });
    resolve(response ?? { ok: false, error: 'No response from extension service.' });
  }));
}
