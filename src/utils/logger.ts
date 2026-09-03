type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  constructor(private readonly scope: string, private readonly enabled = false) {}
  debug(...args: unknown[]): void { this.write('debug', args); }
  info(...args: unknown[]): void { this.write('info', args); }
  warn(...args: unknown[]): void { this.write('warn', args); }
  error(...args: unknown[]): void { this.write('error', args); }
  private write(level: LogLevel, args: unknown[]): void {
    if (!this.enabled && level !== 'error') return;
    console[level](`[Bookmind:${this.scope}]`, ...args);
  }
}
