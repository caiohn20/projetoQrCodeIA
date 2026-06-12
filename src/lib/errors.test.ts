import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorLog, logError } from './errors.ts';

describe('errorLog', () => {
  beforeEach(() => {
    errorLog.clear();
  });

  afterEach(() => {
    errorLog.clear();
  });

  it('starts empty', () => {
    expect(errorLog.getAll()).toEqual([]);
    expect(errorLog.formatForDisplay()).toBe('');
  });

  it('appends errors with source and message', () => {
    errorLog.append('create', 'Conteúdo inválido');

    const errors = errorLog.getAll();
    expect(errors).toHaveLength(1);
    expect(errors[0]?.source).toBe('create');
    expect(errors[0]?.message).toBe('Conteúdo inválido');
    expect(errors[0]?.ts).toBeTypeOf('number');
  });

  it('formats errors for display', () => {
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:30:00');

    errorLog.append('action', 'Falha ao copiar');

    expect(errorLog.formatForDisplay()).toBe('[10:30:00] (action) Falha ao copiar');
  });

  it('notifies subscribers on append and clear', () => {
    const listener = vi.fn();
    const unsubscribe = errorLog.subscribe(listener);

    errorLog.append('create', 'Erro 1');
    errorLog.clear();

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenNthCalledWith(1, []);
    expect(listener).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({ message: 'Erro 1', source: 'create' }),
    ]);
    expect(listener).toHaveBeenNthCalledWith(3, []);

    unsubscribe();
  });
});

describe('logError', () => {
  beforeEach(() => {
    errorLog.clear();
  });

  afterEach(() => {
    errorLog.clear();
  });

  it('logs Error instances by message', () => {
    logError('create', new Error('Falha na geração'));

    expect(errorLog.getAll()[0]?.message).toBe('Falha na geração');
  });

  it('logs unknown values as strings', () => {
    logError('action', 'clipboard indisponível');

    expect(errorLog.getAll()[0]?.message).toBe('clipboard indisponível');
  });
});
