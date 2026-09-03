export enum CollectionStatus { Idle = 'idle', Loading = 'loading', Collecting = 'collecting', Scrolling = 'scrolling', Completed = 'completed', Stopped = 'stopped', Failed = 'failed' }
export interface CollectionState { status: CollectionStatus; collectedCount: number; startedAt?: string; updatedAt: string; elapsedMs: number; estimatedRemaining?: number; error?: string; }
export interface ExtensionSettings { backendUrl?: string; autoScrollDelayMs: number; loggingEnabled: boolean; }
export interface AuthToken { accessToken: string; expiresAt?: string; }
