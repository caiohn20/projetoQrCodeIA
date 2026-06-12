export async function dataUrlToPngBytes(dataUrl: string): Promise<Uint8Array> {
  const response = await fetch(dataUrl);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function dataUrlToBitmap(dataUrl: string): Promise<ImageData> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Não foi possível criar contexto de canvas.');
  }

  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Falha ao carregar imagem do QR Code.'));
    image.src = src;
  });
}

export function formatBytesPreview(bytes: Uint8Array, maxItems = 32): string {
  const preview = Array.from(bytes.slice(0, maxItems));
  const suffix = bytes.length > maxItems ? ` … (+${bytes.length - maxItems} bytes)` : '';
  return `[${preview.join(', ')}]${suffix}\n\nTotal: ${bytes.length} bytes`;
}

export function formatBitmapPreview(bitmap: ImageData, maxPixels = 16): string {
  const sample = Array.from(bitmap.data.slice(0, maxPixels * 4));
  return [
    `width: ${bitmap.width}`,
    `height: ${bitmap.height}`,
    `channels: RGBA (${bitmap.data.length} valores)`,
    `amostra RGBA (primeiros ${maxPixels} pixels): [${sample.join(', ')}]`,
  ].join('\n');
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
