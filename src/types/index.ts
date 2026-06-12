export interface QrGenerateResult {
  dataUrl: string;
  pngBytes: Uint8Array;
  bitmap: ImageData;
}

export interface AppError {
  ts: number;
  source: 'create' | 'action';
  message: string;
}

export const QR_DEFAULT_OPTIONS = {
  errorCorrectionLevel: 'M' as const,
  type: 'image/png' as const,
  quality: 0.92,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
};
