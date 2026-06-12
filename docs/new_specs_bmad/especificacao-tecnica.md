# Especificação Técnica — Gerador de QR Code (projetoQrCodeIA)

**Versão:** 1.0  
**Data:** 11/06/2026  
**Idioma:** pt-BR  
**Status:** MVP implementado; deploy planejado (`deploy-static-server`)

---

## 1. Visão arquitetural

### 1.1 Tipo de sistema

SPA (Single Page Application) **100% client-side**. Não há backend de aplicação, banco de dados ou API REST. Toda geração e exportação ocorre no navegador do usuário.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐  │
│  │   app.ts    │───▶│ qr-generate  │───▶│  qrcode    │  │
│  │  (UI/DOM)   │    │  formats     │    │  (npm lib) │  │
│  └──────┬──────┘    │  download    │    └────────────┘  │
│         │           │  errors      │                     │
│         └───────────┴──────────────┘                     │
└─────────────────────────────────────────────────────────┘
                          │
                    (deploy estático)
                          ▼
              ┌───────────────────────┐
              │  Nginx / CDN / PaaS   │
              │  serve dist/          │
              └───────────────────────┘
```

### 1.2 Princípios técnicos

| Princípio | Implementação |
|-----------|---------------|
| Simplicidade | TypeScript vanilla, sem framework UI |
| Uma fonte de verdade | `toDataURL()` → derivar bytes e bitmap do mesmo PNG |
| Fail visible | Erros sempre no log + inline; sem `console.error` silencioso |
| Testabilidade | Lógica em `src/lib/*` com 19 testes Vitest |
| Deploy estático | `npm run build` → `dist/` |

---

## 2. Stack tecnológica

### 2.1 Runtime e build

| Tecnologia | Versão | Função |
|------------|--------|--------|
| Node.js | 20.x (recomendado) | Dev, CI, build |
| TypeScript | ^5.7 | Tipagem estática |
| Vite | ^6.0 | Bundler, dev server, build produção |
| ES Modules | `"type": "module"` | Imports nativos |

### 2.2 Dependências de produção

| Pacote | Versão | Função |
|--------|--------|--------|
| `qrcode` | ^1.5.4 | Geração de QR Code (encode → PNG data URL) |
| `@fission-ai/openspec` | ^1.4.1 | Spec-driven development (CLI + artefatos) |

### 2.3 Dependências de desenvolvimento

| Pacote | Função |
|--------|--------|
| `vitest` | Testes unitários |
| `happy-dom` | Ambiente DOM nos testes |
| `@types/qrcode` | Tipos TypeScript para qrcode |

### 2.4 Scripts npm

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `vite` | Servidor de desenvolvimento (HMR) |
| `build` | `tsc && vite build` | Type-check + artefato estático em `dist/` |
| `preview` | `vite preview` | Preview local do build de produção |
| `test` | `vitest run` | Suíte unitária (CI) |
| `test:watch` | `vitest` | Testes em modo watch |

---

## 3. Estrutura do repositório

```
projetoQrCodeIA/
├── index.html                 # Entry HTML
├── vite.config.ts             # Vite + Vitest config
├── tsconfig.json
├── package.json
├── src/
│   ├── main.ts                # Bootstrap (#app)
│   ├── app.ts                 # UI completa (montagem DOM)
│   ├── styles/main.css
│   ├── types/index.ts         # Tipos + QR_DEFAULT_OPTIONS
│   ├── lib/
│   │   ├── qr-generate.ts     # Geração QR + orquestração formatos
│   │   ├── formats.ts         # bytes, bitmap, previews, copy text
│   │   ├── download.ts        # download PNG, copy image clipboard
│   │   └── errors.ts          # ErrorLog singleton
│   └── test/
│       └── dom-mocks.ts       # Mocks canvas/Image para Vitest
├── dist/                      # Build output (gitignored)
├── openspec/                  # Specs OpenSpec
└── docs/new_specs_bmad/       # Este pacote de documentação
```

---

## 4. Módulos e responsabilidades

### 4.1 `src/app.ts`

- Monta HTML da SPA via `innerHTML` + event listeners
- Debounce de **300 ms** no input do textarea
- Orquestra preview, ações, formatos avançados e feedback
- Estado local: `QrGenerateResult | null`

### 4.2 `src/lib/qr-generate.ts`

```typescript
generateQr(text: string): Promise<QrGenerateResult>
generateQrPreview(text: string): Promise<string>
```

- Chama `QRCode.toDataURL(text, QR_DEFAULT_OPTIONS)`
- Deriva `pngBytes` e `bitmap` via `formats.ts`

### 4.3 `src/lib/formats.ts`

| Função | Entrada | Saída |
|--------|---------|-------|
| `dataUrlToPngBytes` | data URL PNG | `Uint8Array` (bytes brutos PNG) |
| `dataUrlToBitmap` | data URL PNG | `ImageData` RGBA via canvas |
| `formatBytesPreview` | `Uint8Array` | string truncada para UI |
| `formatBitmapPreview` | `ImageData` | metadados + amostra RGBA |
| `copyTextToClipboard` | string | clipboard API |

### 4.4 `src/lib/download.ts`

| Função | Descrição |
|--------|-----------|
| `downloadPng(dataUrl, filename?)` | Cria `<a download>` e dispara click |
| `copyImageToClipboard(dataUrl)` | `fetch` → `Blob` → `ClipboardItem` |

### 4.5 `src/lib/errors.ts`

- Classe `ErrorLog` (singleton `errorLog`)
- `append(source, message)`, `clear()`, `subscribe()`, `formatForDisplay()`
- Origens: `'create' | 'action'`
- `logError(source, error)` — normaliza `Error` ou string

---

## 5. Contratos de dados

### 5.1 `QrGenerateResult`

```typescript
interface QrGenerateResult {
  dataUrl: string;      // data:image/png;base64,...
  pngBytes: Uint8Array; // PNG raw
  bitmap: ImageData;    // RGBA do canvas
}
```

### 5.2 `AppError`

```typescript
interface AppError {
  ts: number;
  source: 'create' | 'action';
  message: string;
}
```

### 5.3 Defaults `qrcode` (`QR_DEFAULT_OPTIONS`)

| Opção | Valor |
|-------|-------|
| `errorCorrectionLevel` | `'M'` |
| `type` | `'image/png'` |
| `quality` | `0.92` |
| `margin` | `4` |
| `width` | `undefined` (automático) |
| `color.dark` | `'#000000'` |
| `color.light` | `'#ffffff'` |

---

## 6. Fluxo de dados — geração

```
textarea input (string)
        │
        ▼ debounce 300ms
QRCode.toDataURL(text, defaults)
        │
        ├──▶ dataUrl ──▶ <img preview>
        │
        ├──▶ fetch(dataUrl) ──▶ Uint8Array (pngBytes)
        │
        └──▶ Image + canvas ──▶ ImageData (bitmap)
                    │
                    ▼
        formatos avançados (readonly textareas)
```

---

## 7. Requisitos técnicos numerados

### Aplicação

**RT-01** — O bundle de produção SHALL ser servido como arquivos estáticos sem runtime Node no servidor.

**RT-02** — A aplicação SHALL NOT realizar requisições HTTP para APIs externas de geração de QR.

**RT-03** — O debounce de geração SHALL ser **300 ms** implementado em `app.ts`.

**RT-04** — Clipboard de imagem SHALL usar `navigator.clipboard.write` com `ClipboardItem` (`image/png`).

**RT-05** — Clipboard e APIs seguras SHALL exigir **HTTPS** em produção (contexto seguro).

### Build

**RT-06** — `npm run build` SHALL falhar se `tsc` reportar erros de tipo.

**RT-07** — Assets de produção SHALL incluir hash no nome (`dist/assets/*`) para cache busting.

**RT-08** — `base` do Vite SHALL ser `'/'` (raiz do domínio) salvo decisão contrária documentada.

### Testes

**RT-09** — `npm test` SHALL executar Vitest com environment `happy-dom`.

**RT-10** — Cobertura mínima MVP: `qr-generate`, `formats`, `download`, `errors` (19 testes).

**RT-11** — Testes de bitmap SHALL usar mocks em `src/test/dom-mocks.ts` (limitação happy-dom).

### Deploy (planejado — change `deploy-static-server`)

**RT-12** — Pipeline de deploy SHALL executar `npm test` antes de `npm run build`.

**RT-13** — Servidor SHALL servir `dist/` via Nginx com `try_files` fallback SPA.

**RT-14** — Produção SHALL usar HTTPS com redirect HTTP → HTTPS.

**RT-15** — Headers mínimos: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

**RT-16** — Assets em `/assets/` SHALL ter cache longo (`Cache-Control: public, immutable`).

**RT-17** — Deploy SHALL incluir smoke test pós-publicação (200 na raiz, título, bundle JS).

**RT-18** — Rollback SHALL ser possível via symlink de releases versionadas (`current` → release anterior).

---

## 8. Segurança

| Aspecto | Abordagem |
|---------|-----------|
| Dados do usuário | Permanecem no browser; não enviados ao servidor |
| XSS | Entrada renderizada como QR, não como HTML; sem `innerHTML` do payload |
| HTTPS | Obrigatório em produção (clipboard + boas práticas) |
| Headers | nosniff, Referrer-Policy (Nginx) |
| Dependências | `npm audit` periódico; sem secrets no repo |

---

## 9. Performance

| Métrica | Expectativa MVP |
|---------|-----------------|
| Bundle JS gzip | ~13 KB (baseline build Vite) |
| Tempo geração QR | < 100 ms para textos curtos (client-side) |
| Debounce | 300 ms — reduz regerações durante digitação |
| Servidor | Nginx estático — latência dominada por rede/CDN |

---

## 10. Compatibilidade

| Ambiente | Suporte |
|----------|---------|
| Chrome / Edge (recentes) | Completo |
| Firefox (recente) | Completo |
| Safari (recente) | Completo; clipboard pode exigir gesto do usuário |
| Mobile | Responsivo (CSS `@media max-width: 540px`) |
| HTTP (não seguro) | App carrega; clipboard pode falhar → erro no log |

---

## 11. Deploy — arquitetura alvo

### Opção A — VPS + Nginx (recomendada)

```
GitHub Actions                    VPS
┌──────────────┐                ┌─────────────────────────┐
│ npm test     │   rsync/SSH    │ /var/www/qrcode/        │
│ npm build    │ ──────────────▶│   releases/<sha>/       │
│ smoke test   │                │   current → symlink     │
└──────────────┘                │ Nginx + Certbot (TLS)   │
                                └─────────────────────────┘
```

Artefatos a criar na implementação do deploy:

- `deploy/nginx/qrcode.conf`
- `deploy/scripts/deploy.sh`, `rollback.sh`, `smoke-test.sh`
- `.github/workflows/deploy.yml`

### Opção B — PaaS estático

Netlify / Vercel / Cloudflare Pages: build `npm run build`, output `dist/`, TLS gerenciado.

---

## 12. OpenSpec — rastreabilidade

| Artefato OpenSpec | Caminho |
|-------------------|---------|
| Spec principal app | `openspec/specs/qr-generator/spec.md` |
| Change deploy | `openspec/changes/deploy-static-server/` |
| Config projeto | `openspec/config.yaml` |
| MVP arquivado | `openspec/changes/archive/2026-06-11-qr-generator-mvp/` |

---

## 13. Perguntas em aberto (deploy)

1. FQDN final (domínio de produção)
2. VPS vs PaaS
3. Raiz do domínio vs subpath (`vite base`)
4. Branch de deploy (`main` recomendado)

---

## 14. Evoluções futuras (fora do MVP)

- Botão "Limpar log"
- Configuração ECC/tamanho/cores na UI
- PWA / offline installable
- Testes E2E (Playwright)
- i18n
- CI preview por PR

---

*Documento técnico complementar à [especificacao-funcional.md](./especificacao-funcional.md).*
