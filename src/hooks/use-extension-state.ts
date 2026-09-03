import { useEffect, useState } from 'react';
import { sendMessage } from '../messaging/client';
import { MessageType } from '../messaging/messages';
import { CollectionStatus, type CollectionState, type ExtensionSettings } from '../types/collection';

export interface PopupState { state: CollectionState; lastSync?: string; settings: ExtensionSettings; }
const fallback: PopupState = { state: { status: CollectionStatus.Idle, collectedCount: 0, updatedAt: new Date(0).toISOString(), elapsedMs: 0 }, settings: { autoScrollDelayMs: 850, loggingEnabled: false } };

export function useExtensionState(): [PopupState, () => Promise<void>] {
  const [value, setValue] = useState<PopupState>(fallback);
  const refresh = async () => { const response = await sendMessage<PopupState>({ type: MessageType.GetState }); if (response.ok) setValue(response.data); };
  useEffect(() => {
    void refresh();
    const handleStorageChange = () => { void refresh(); };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);
  return [value, refresh];
}
