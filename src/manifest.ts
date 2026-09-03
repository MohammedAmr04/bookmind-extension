import { defineManifest } from '@crxjs/vite-plugin';
import { X_BOOKMARK_PATHS } from './constants/config';

export default defineManifest({
  manifest_version: 3,
  name: 'Bookmind',
  version: '0.1.0',
  description: 'Collects your X bookmarks for Bookmind synchronization.',
  permissions: ['storage', 'tabs'],
  host_permissions: ['https://x.com/*'],
  background: { service_worker: 'src/background/index.ts', type: 'module' },
  action: { default_popup: 'index.html', default_title: 'Bookmind' },
  content_scripts: [{ matches: X_BOOKMARK_PATHS.map((path) => `https://x.com${path}`), js: ['src/content/index.ts'], run_at: 'document_idle' }],
});
