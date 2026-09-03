# Bookmind Extension

Bookmind is a Manifest V3 browser extension that collects the authenticated user's X bookmarks and prepares them for synchronization with a Bookmind backend. It does not summarize, classify, or run AI workflows.

## What it does

- Runs only on X bookmark views: `https://x.com/i/history` and the legacy `https://x.com/i/bookmarks`.
- Collects only when the **Bookmarks** tab is selected in X History, never the Likes tab.
- Extracts normalized tweet data including text, author, media, links, dates, quoted tweets, replies, and reposts where available.
- Prevents duplicate collection using the tweet ID.
- Scrolls gradually until the page has no new content.
- Stores collection progress, settings, bookmarks, and the last synchronization timestamp in Chrome storage.
- Sends stored bookmarks to a configured backend endpoint with a timeout and retries.

## Technology

- TypeScript
- React 18
- Vite
- CRXJS
- Chrome Extension Manifest V3

## Project layout

```text
src/
  background/    Service worker and extension orchestration
  components/    Reusable popup UI components
  constants/     Selectors, URLs, delays, limits, and retry settings
  content/       DOM observation, collection lifecycle, and auto-scroll
  extractors/    Provider interfaces and X bookmark extraction
  hooks/         Popup state subscriptions
  messaging/     Typed request and response messages
  popup/         React popup UI and styling
  services/      Backend synchronization
  storage/       Chrome storage abstraction
  types/         Bookmark, progress, settings, and auth models
  utils/         Logging, timing, and debounce helpers
```

## Data flow

```text
Popup -> Background service worker -> Content script -> Bookmark extractor
  ^             |                       |                 |
  |             v                       v                 v
  +-------- Extension storage <---- collection state --- normalized bookmarks
                |
                v
          Backend sync service
```

The content script owns DOM access. The background service worker owns communication, storage coordination, and synchronization. React components contain presentation and user interactions only.

## Requirements

- Node.js 20 or newer
- Brave, Chrome, or another Chromium-based browser
- An authenticated X account with bookmarks

## Install and build

```bash
npm install
npm run build
```

The production extension is generated in `dist/`.

For local development:

```bash
npm run dev
```

## Load in Brave

1. Open `brave://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this repository's `dist` directory.
5. Pin the Bookmind extension if you want quick access to its popup.

After source changes, run `npm run build` again and use the reload button on the Bookmind card in `brave://extensions`.

## Collect bookmarks

1. Open `https://x.com/i/history`.
2. Select the **Bookmarks** tab. Do not leave the Likes tab selected.
3. Open the Bookmind popup.
4. Select **Start collection**.
5. Keep the X tab open while the extension observes and scrolls through bookmarks.
6. Use **Stop** to end the collection early, if needed.

The popup displays the collection status, number of newly stored bookmarks, elapsed time, and last successful sync.

## Export JSON

Until a backend is connected, select **Download JSON** in the popup to save the currently stored bookmarks to a local file. The file is named `bookmind-bookmarks-YYYY-MM-DD.json` and contains the export timestamp plus the normalized bookmark array.

## Backend synchronization

In the popup, set the backend URL, for example:

```text
https://api.example.com
```

Selecting **Sync to backend** sends a JSON request to:

```text
POST https://api.example.com/api/bookmarks/sync
```

Request body:

```json
{
  "bookmarks": []
}
```

The sync request uses a 15-second timeout and retries failed requests twice with incremental delays. Authentication is intentionally reserved for the future auth-storage layer.

## Testing checklist

- Load the unpacked `dist` directory without manifest errors.
- Visit X History and confirm the Bookmarks tab is selected.
- Start collection and verify the count rises as new tweets appear.
- Stop collection and verify scrolling stops.
- Switch to Likes and confirm Start collection shows a Bookmarks-tab error.
- Enter a test backend URL and verify successful sync or a readable failure message.
- Reload the X page and verify the extension recovers when collection is started again.

## Configuration

Runtime configuration is centralized in `src/constants/config.ts`:

- DOM observer debounce delay
- Scroll speed and stopping limits
- Network timeout and retry count
- X page selectors and supported bookmark paths

Popup settings allow changing the backend URL and scroll delay without rebuilding the extension.
