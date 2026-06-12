import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { copyImageToClipboard, downloadPng } from './download.ts';

describe('downloadPng', () => {
  it('creates a download link and triggers click', () => {
    const click = vi.fn();
    const link = {
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement;

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(link);

    downloadPng('data:image/png;base64,abc', 'meu-qr.png');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(link.href).toBe('data:image/png;base64,abc');
    expect(link.download).toBe('meu-qr.png');
    expect(click).toHaveBeenCalledOnce();

    createElementSpy.mockRestore();
  });

  it('uses default filename when omitted', () => {
    const click = vi.fn();
    const link = {
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(link);

    downloadPng('data:image/png;base64,abc');

    expect(link.download).toBe('qrcode.png');
  });
});

describe('copyImageToClipboard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['png'], { type: 'image/png' })),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('copies image/png to the clipboard', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: { write },
    });
    vi.stubGlobal(
      'ClipboardItem',
      class ClipboardItem {
        constructor(public items: Record<string, Blob>) {}
      },
    );

    await copyImageToClipboard('data:image/png;base64,abc');

    expect(fetch).toHaveBeenCalledWith('data:image/png;base64,abc');
    expect(write).toHaveBeenCalledOnce();
  });
});
