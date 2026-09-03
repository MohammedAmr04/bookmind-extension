export const sleep = (milliseconds: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds));
export const elapsedSince = (startedAt?: string): number => startedAt ? Date.now() - new Date(startedAt).getTime() : 0;
