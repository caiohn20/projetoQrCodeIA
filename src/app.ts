import { copyImageToClipboard, downloadPng } from './lib/download.ts';
import { errorLog, logError } from './lib/errors.ts';
import {
  copyTextToClipboard,
  formatBitmapPreview,
  formatBytesPreview,
} from './lib/formats.ts';
import { generateQr } from './lib/qr-generate.ts';
import type { QrGenerateResult } from './types/index.ts';

const DEBOUNCE_MS = 300;

interface AppState {
  result: QrGenerateResult | null;
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <main class="page">
      <header class="header">
        <h1>Gerador de QR Code</h1>
        <p class="subtitle">Cole ou digite o conteúdo e exporte o QR Code em PNG ou formatos técnicos.</p>
      </header>

      <section class="panel" aria-labelledby="input-label">
        <label id="input-label" for="qr-input">Conteúdo do QR Code</label>
        <textarea
          id="qr-input"
          rows="4"
          placeholder="Cole ou digite o conteúdo do QR…"
          spellcheck="false"
        ></textarea>
        <p id="inline-error" class="inline-error" role="alert" hidden></p>
      </section>

      <section class="panel preview-panel" aria-labelledby="preview-label">
        <h2 id="preview-label">Preview</h2>
        <div class="preview-frame">
          <img id="qr-preview" alt="Seu QR aparecerá aqui" hidden />
          <p id="preview-placeholder" class="preview-placeholder">Seu QR aparecerá aqui</p>
        </div>
        <div class="actions">
          <button id="btn-download" type="button" disabled>Baixar PNG</button>
          <button id="btn-copy-image" type="button" disabled>Copiar imagem</button>
        </div>
        <p id="action-feedback" class="action-feedback" aria-live="polite"></p>
      </section>

      <details class="panel advanced-panel" id="advanced-panel">
        <summary>Formatos avançados (base64, bitmap, bytes)</summary>
        <div class="advanced-content">
          <div class="format-block">
            <div class="format-header">
              <h3>Base64</h3>
              <button type="button" class="btn-copy" data-copy="base64" disabled>Copiar</button>
            </div>
            <textarea id="format-base64" readonly rows="3" spellcheck="false"></textarea>
          </div>
          <div class="format-block">
            <div class="format-header">
              <h3>Bytes</h3>
              <button type="button" class="btn-copy" data-copy="bytes" disabled>Copiar</button>
            </div>
            <textarea id="format-bytes" readonly rows="4" spellcheck="false"></textarea>
          </div>
          <div class="format-block">
            <div class="format-header">
              <h3>Bitmap</h3>
              <button type="button" class="btn-copy" data-copy="bitmap" disabled>Copiar</button>
            </div>
            <textarea id="format-bitmap" readonly rows="4" spellcheck="false"></textarea>
          </div>
        </div>
      </details>

      <section class="panel error-panel" aria-labelledby="error-log-label">
        <h2 id="error-log-label">Log de erros</h2>
        <textarea id="error-log" readonly rows="5" spellcheck="false" placeholder="Nenhum erro registrado."></textarea>
      </section>
    </main>
  `;

  const input = root.querySelector<HTMLTextAreaElement>('#qr-input')!;
  const preview = root.querySelector<HTMLImageElement>('#qr-preview')!;
  const placeholder = root.querySelector<HTMLElement>('#preview-placeholder')!;
  const inlineError = root.querySelector<HTMLElement>('#inline-error')!;
  const btnDownload = root.querySelector<HTMLButtonElement>('#btn-download')!;
  const btnCopyImage = root.querySelector<HTMLButtonElement>('#btn-copy-image')!;
  const actionFeedback = root.querySelector<HTMLElement>('#action-feedback')!;
  const formatBase64 = root.querySelector<HTMLTextAreaElement>('#format-base64')!;
  const formatBytes = root.querySelector<HTMLTextAreaElement>('#format-bytes')!;
  const formatBitmap = root.querySelector<HTMLTextAreaElement>('#format-bitmap')!;
  const errorLogTextarea = root.querySelector<HTMLTextAreaElement>('#error-log')!;
  const copyButtons = root.querySelectorAll<HTMLButtonElement>('.btn-copy');

  const state: AppState = { result: null };
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

  errorLog.subscribe(() => {
    errorLogTextarea.value = errorLog.formatForDisplay();
  });

  function setActionFeedback(message: string): void {
    actionFeedback.textContent = message;
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
    }
    if (message) {
      feedbackTimer = setTimeout(() => {
        actionFeedback.textContent = '';
      }, 2000);
    }
  }

  function setInlineError(message: string): void {
    if (message) {
      inlineError.textContent = message;
      inlineError.hidden = false;
    } else {
      inlineError.textContent = '';
      inlineError.hidden = true;
    }
  }

  function setActionsEnabled(enabled: boolean): void {
    btnDownload.disabled = !enabled;
    btnCopyImage.disabled = !enabled;
    for (const button of copyButtons) {
      button.disabled = !enabled;
    }
  }

  function clearFormats(): void {
    formatBase64.value = '';
    formatBytes.value = '';
    formatBitmap.value = '';
  }

  function clearPreview(): void {
    preview.hidden = true;
    preview.removeAttribute('src');
    placeholder.hidden = false;
    setActionsEnabled(false);
    clearFormats();
    state.result = null;
  }

  function applyResult(result: QrGenerateResult): void {
    state.result = result;
    preview.src = result.dataUrl;
    preview.hidden = false;
    placeholder.hidden = true;
    setActionsEnabled(true);

    formatBase64.value = result.dataUrl;
    formatBytes.value = formatBytesPreview(result.pngBytes);
    formatBitmap.value = formatBitmapPreview(result.bitmap);
  }

  async function handleInputChange(): Promise<void> {
    const text = input.value;

    if (!text.trim()) {
      clearPreview();
      setInlineError('');
      return;
    }

    setInlineError('');

    try {
      const result = await generateQr(text);
      applyResult(result);
    } catch (error) {
      clearPreview();
      const message =
        error instanceof Error ? error.message : 'Erro ao gerar QR Code.';
      setInlineError(message);
      logError('create', error);
    }
  }

  input.addEventListener('input', () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      void handleInputChange();
    }, DEBOUNCE_MS);
  });

  btnDownload.addEventListener('click', () => {
    if (!state.result) {
      return;
    }

    try {
      downloadPng(state.result.dataUrl);
      setActionFeedback('PNG baixado.');
    } catch (error) {
      logError('action', error);
    }
  });

  btnCopyImage.addEventListener('click', async () => {
    if (!state.result) {
      return;
    }

    try {
      await copyImageToClipboard(state.result.dataUrl);
      setActionFeedback('Imagem copiada!');
    } catch (error) {
      logError('action', error);
    }
  });

  for (const button of copyButtons) {
    button.addEventListener('click', async () => {
      if (!state.result) {
        return;
      }

      const target = button.dataset.copy;
      let text = '';

      if (target === 'base64') {
        text = state.result.dataUrl;
      } else if (target === 'bytes') {
        text = formatBytesPreview(state.result.pngBytes, state.result.pngBytes.length);
      } else if (target === 'bitmap') {
        text = [
          `width: ${state.result.bitmap.width}`,
          `height: ${state.result.bitmap.height}`,
          `data: [${Array.from(state.result.bitmap.data).join(', ')}]`,
        ].join('\n');
      }

      try {
        await copyTextToClipboard(text);
        setActionFeedback('Copiado!');
      } catch (error) {
        logError('action', error);
      }
    });
  }

  clearPreview();
}
