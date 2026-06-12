import { vi } from 'vitest';

export function mockCanvasBitmap(
  width = 21,
  height = 21,
): { bitmap: ImageData; imageData: Uint8ClampedArray } {
  const imageData = new Uint8ClampedArray(width * height * 4);
  imageData.fill(255);

  const bitmap = {
    width,
    height,
    data: imageData,
    colorSpace: 'srgb' as PredefinedColorSpace,
  } as ImageData;

  return { bitmap, imageData };
}

export function mockImageLoader(width = 21, height = 21): void {
  class MockImage {
    naturalWidth = width;
    naturalHeight = height;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal('Image', MockImage);
}

export function mockCanvasContext(bitmap: ImageData) {
  const drawImage = vi.fn();
  const getImageData = vi.fn().mockReturnValue(bitmap);
  const context = { drawImage, getImageData };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(context),
  };

  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return canvas as unknown as HTMLCanvasElement;
    }

    return originalCreateElement(tagName);
  });

  return { canvas, context, drawImage, getImageData };
}
