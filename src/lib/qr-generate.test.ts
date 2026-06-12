import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateQr, generateQrPreview } from './qr-generate.ts';
import { QR_DEFAULT_OPTIONS } from '../types/index.ts';
import { mockCanvasBitmap, mockCanvasContext, mockImageLoader } from '../test/dom-mocks.ts';

describe('generateQrPreview', () => {
  it('returns a PNG data URL for a non-empty string', async () => {
    const dataUrl = await generateQrPreview('hello');

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});

describe('generateQr', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('generates dataUrl, png bytes and bitmap for valid text', async () => {
    const { bitmap } = mockCanvasBitmap(21, 21);
    mockImageLoader(21, 21);
    mockCanvasContext(bitmap);

    const result = await generateQr('hello');

    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.pngBytes).toBeInstanceOf(Uint8Array);
    expect(result.pngBytes.length).toBeGreaterThan(0);
    expect(result.bitmap.width).toBe(21);
    expect(result.bitmap.height).toBe(21);
    expect(result.bitmap.data.length).toBe(21 * 21 * 4);
  });

  it('uses library default options', async () => {
    const preview = await generateQrPreview('defaults-check');

    expect(QR_DEFAULT_OPTIONS.errorCorrectionLevel).toBe('M');
    expect(QR_DEFAULT_OPTIONS.margin).toBe(4);
    expect(preview).toMatch(/^data:image\/png;base64,/);
  });

  it('rejects empty payload', async () => {
    await expect(generateQr('')).rejects.toThrow();
  });
});
