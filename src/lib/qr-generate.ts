import QRCode from 'qrcode';
import type { QrGenerateResult } from '../types/index.ts';
import { QR_DEFAULT_OPTIONS } from '../types/index.ts';
import { dataUrlToBitmap, dataUrlToPngBytes } from './formats.ts';

export async function generateQr(text: string): Promise<QrGenerateResult> {
  const dataUrl = await QRCode.toDataURL(text, QR_DEFAULT_OPTIONS);
  const [pngBytes, bitmap] = await Promise.all([
    dataUrlToPngBytes(dataUrl),
    dataUrlToBitmap(dataUrl),
  ]);

  return { dataUrl, pngBytes, bitmap };
}

export async function generateQrPreview(text: string): Promise<string> {
  return QRCode.toDataURL(text, QR_DEFAULT_OPTIONS);
}
