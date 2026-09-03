import type { CollectionState } from '../types/collection';

export function ProgressBar({ state }: { state: CollectionState }) {
  const active = ['loading', 'collecting', 'scrolling'].includes(state.status);
  return <div className="progress-track" aria-label="Collection progress"><div className={active ? 'progress-fill progress-active' : 'progress-fill'} /></div>;
}
