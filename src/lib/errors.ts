import type { AppError } from '../types/index.ts';

type ErrorListener = (errors: AppError[]) => void;

class ErrorLog {
  private errors: AppError[] = [];
  private listeners = new Set<ErrorListener>();

  append(source: AppError['source'], message: string): void {
    this.errors = [...this.errors, { ts: Date.now(), source, message }];
    this.notify();
  }

  clear(): void {
    this.errors = [];
    this.notify();
  }

  getAll(): AppError[] {
    return [...this.errors];
  }

  subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }

  formatForDisplay(): string {
    if (this.errors.length === 0) {
      return '';
    }

    return this.errors
      .map((error) => {
        const time = new Date(error.ts).toLocaleTimeString('pt-BR');
        return `[${time}] (${error.source}) ${error.message}`;
      })
      .join('\n');
  }

  private notify(): void {
    const snapshot = this.getAll();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

export const errorLog = new ErrorLog();

export function logError(source: AppError['source'], error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  errorLog.append(source, message);
}
