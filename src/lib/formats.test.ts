import { describe, expect, it, vi, afterEach } from 'vitest';
import QRCode from 'qrcode';
import {
  copyTextToClipboard,
  dataUrlToBitmap,
  dataUrlToPngBytes,
  formatBitmapPreview,
  formatBytesPreview,
} from './formats.ts';
import { QR_DEFAULT_OPTIONS } from '../types/index.ts';
import { mockCanvasBitmap, mockCanvasContext, mockImageLoader } from '../test/dom-mocks.ts';

describe('dataUrlToPngBytes', () => {
  it('converts a PNG data URL into raw bytes', async () => {
    const dataUrl = await QRCode.toDataURL('bytes-test', QR_DEFAULT_OPTIONS);
    const bytes = await dataUrlToPngBytes(dataUrl);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes[0]).toBe(0x89);
    expect(bytes[1]).toBe(0x50);
  });
});

describe('dataUrlToBitmap', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('extracts RGBA ImageData from a PNG data URL', async () => {
    const { bitmap } = mockCanvasBitmap(21, 21);
    mockImageLoader(21, 21);
    mockCanvasContext(bitmap);

    const dataUrl = await QRCode.toDataURL('bitmap-test', QR_DEFAULT_OPTIONS);
    const result = await dataUrlToBitmap(dataUrl);

    expect(result.width).toBe(21);
    expect(result.height).toBe(21);
    expect(result.data.length).toBe(21 * 21 * 4);
  });
});

describe('formatBytesPreview', () => {
  it('formats byte arrays with total length', () => {
    const bytes = new Uint8Array([1, 2, 3, 255]);
    const preview = formatBytesPreview(bytes);

    expect(preview).toContain('[1, 2, 3, 255]');
    expect(preview).toContain('Total: 4 bytes');
  });

  it('truncates long arrays and shows remaining count', () => {
    const bytes = new Uint8Array(40);
    bytes.fill(7);
    const preview = formatBytesPreview(bytes, 4);

    expect(preview).toContain('… (+36 bytes)');
    expect(preview).toContain('Total: 40 bytes');
  });
});

describe('formatBitmapPreview', () => {
  it('includes dimensions and RGBA sample', () => {
    const { bitmap } = mockCanvasBitmap(2, 2);
    bitmap.data.set([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255]);

    const preview = formatBitmapPreview(bitmap, 1);

    expect(preview).toContain('width: 2');
    expect(preview).toContain('height: 2');
    expect(preview).toContain('channels: RGBA (16 valores)');
    expect(preview).toContain('amostra RGBA');
  });
});

describe('copyTextToClipboard', () => {
  it('writes text using the clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    });

    await copyTextToClipboard('copied-value');

    expect(writeText).toHaveBeenCalledWith('copied-value');
    vi.unstubAllGlobals();
  });
});
