## Context

Ferramenta web solicitada pelo cliente para gerar QR Codes online. O escopo foi refinado em discovery: apenas **geração** (sem leitor/câmera), formatos técnicos em seção colapsável, defaults da lib `qrcode` sem UI de configuração.

Estado atual: implementação concluída em SPA Vite + TypeScript vanilla.

## Goals / Non-Goals

**Goals:**

- Gerar QR a partir de texto com preview em tempo real
- Exportar PNG (download + clipboard)
- Expor base64, bytes PNG e bitmap RGBA para integração
- Tratar erros de forma visível (inline + log)
- Rodar 100% no browser, deploy estático simples
- Cobertura de testes unitários na camada `lib/`

**Non-Goals:**

- Decode/leitura de QR (jsQR, câmera, upload para ler)
- Backend, API REST, autenticação
- Templates de conteúdo (Wi-Fi, vCard)
- Customização visual (cores, logo, tamanho, correção de erro via UI)
- PWA, offline, i18n, analytics

## Decisions

### SPA estática client-side (sem backend)

**Escolha:** Vite + TypeScript, tudo no browser.

**Rationale:** requisito é "página web online"; geração com `qrcode` funciona no client; zero custo de infra; dados do QR não saem da máquina do usuário.

**Alternativa descartada:** API Node wrappeando `qrcode` — complexidade sem retorno para MVP.

### TypeScript vanilla (sem React)

**Escolha:** DOM direto em `app.ts`, módulos em `src/lib/`.

**Rationale:** UI simples (textarea, preview, botões, `<details>`); menos dependências; bundle menor.

### Uma fonte de verdade para formatos

**Escolha:** `QRCode.toDataURL()` → derivar bytes via `fetch(dataUrl)` e bitmap via canvas offscreen/`ImageData`.

**Rationale:** evita três pipelines inconsistentes; base64/bytes/bitmap sempre referem o mesmo PNG.

### Defaults fixos da lib qrcode

**Escolha:** `errorCorrectionLevel: M`, `margin: 4`, `quality: 0.92`, cores preto/branco.

**Rationale:** cliente aceitou "defaults"; reduz superfície de UI e decisões.

### Log de erros em textarea

**Escolha:** singleton `errorLog` com append timestampado; textarea read-only na UI.

**Rationale:** requisito explícito do cliente; útil para suporte/debug; complementado por mensagens inline.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Strings muito longas geram QR denso/ilegível | Mensagem de erro da lib + inline error |
| Clipboard pode falhar (HTTP, permissões) | try/catch → log, sem crash |
| "Bitmap/bytes" ambíguos para consumidores | Documentado: bytes=PNG raw, bitmap=ImageData RGBA |
| happy-dom não carrega Image nativamente nos testes | mocks em `src/test/dom-mocks.ts` |

## Migration Plan

N/A — greenfield. Deploy: `npm run build` → publicar `dist/` em host estático.

## Open Questions

_(nenhuma pendente para MVP)_
