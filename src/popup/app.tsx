import { useEffect, useState } from 'react';
import { ProgressBar } from '../components/progress-bar';
import { useExtensionState } from '../hooks/use-extension-state';
import { sendMessage } from '../messaging/client';
import { MessageType } from '../messaging/messages';

const activeStatuses = new Set(['loading', 'collecting', 'scrolling']);

export function App() {
  const [popup, refresh] = useExtensionState();
  const [notice, setNotice] = useState<string>();
  const [backendUrl, setBackendUrl] = useState(popup.settings.backendUrl ?? '');
  const [scrollDelayMs, setScrollDelayMs] = useState(popup.settings.autoScrollDelayMs);
  useEffect(() => { setBackendUrl(popup.settings.backendUrl ?? ''); }, [popup.settings.backendUrl]);
  useEffect(() => { setScrollDelayMs(popup.settings.autoScrollDelayMs); }, [popup.settings.autoScrollDelayMs]);
  const active = activeStatuses.has(popup.state.status);
  const run = async (type: MessageType.StartCollection | MessageType.StopCollection) => {
    const result = await sendMessage(type === MessageType.StartCollection ? { type: MessageType.StartCollection } : { type: MessageType.StopCollection });
    setNotice(result.ok ? undefined : result.error); await refresh();
  };
  const saveSettings = async () => {
    const result = await sendMessage({ type: MessageType.UpdateSettings, payload: { backendUrl, autoScrollDelayMs: Math.max(200, scrollDelayMs || 850) } });
    setNotice(result.ok ? 'Settings saved.' : result.error); await refresh();
  };
  const sync = async () => { const result = await sendMessage<{ syncedCount: number }>({ type: MessageType.Sync }); setNotice(result.ok ? `${result.data.syncedCount} bookmarks synced.` : result.error); await refresh(); };

  return <main className="popup">
    <header><div><p className="eyebrow">BOOKMARK COLLECTOR</p><h1>Bookmind</h1></div><span className={`status status-${popup.state.status}`}>{popup.state.status}</span></header>
    <section className="card"><div className="metric"><span>Bookmarks found</span><strong>{popup.state.collectedCount}</strong></div><ProgressBar state={popup.state} /><p className="detail">Elapsed: {Math.floor(popup.state.elapsedMs / 1000)}s</p></section>
    <div className="actions"><button disabled={active} onClick={() => void run(MessageType.StartCollection)}>Start collection</button><button className="secondary" disabled={!active} onClick={() => void run(MessageType.StopCollection)}>Stop</button></div>
    <button className="sync" disabled={active} onClick={() => void sync()}>Sync to backend</button>
    <section className="settings"><label htmlFor="backend">Backend URL</label><div><input id="backend" value={backendUrl} onChange={(event) => setBackendUrl(event.target.value)} placeholder="https://api.example.com" /></div><label htmlFor="delay">Scroll delay (ms)</label><div><input id="delay" type="number" min="200" value={scrollDelayMs} onChange={(event) => setScrollDelayMs(Number(event.target.value))} /><button className="small" onClick={() => void saveSettings()}>Save</button></div><p>Last sync: {popup.lastSync ? new Date(popup.lastSync).toLocaleString() : 'Never'}</p></section>
    {notice && <p className="notice" role="status">{notice}</p>}
  </main>;
}
