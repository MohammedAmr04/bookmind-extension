export function debounce<T extends (...args: never[]) => void>(callback: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => callback(...args), delayMs); }) as T;
}
