import { sendMessage } from '../messaging/client';
import { MessageType } from '../messaging/messages';
import type { Bookmark } from '../types/bookmark';

interface BookmarkExport {
  exportedAt: string;
  bookmarks: Bookmark[];
}

export async function downloadBookmarkExport(): Promise<number> {
  const response = await sendMessage<BookmarkExport>({ type: MessageType.ExportBookmarks });
  if (!response.ok) throw new Error(response.error);

  const file = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  const date = response.data.exportedAt.slice(0, 10);
  link.href = url;
  link.download = `bookmind-bookmarks-${date}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  return response.data.bookmarks.length;
}
