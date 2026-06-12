## Why

O cliente precisa de uma ferramenta web online para gerar QR Codes a partir de texto e obter a imagem (e representações técnicas) para uso em outras aplicações, sem depender de backend ou instalação local.

## What Changes

- Página web single-page para **gerar QR Code** a partir de string (texto livre ou URL)
- **Preview em tempo real** enquanto o usuário digita (debounce ~300ms)
- **Exportação**: download PNG e copiar imagem para área de transferência
- **Formatos avançados colapsáveis**: base64 (data URL PNG), bytes (`Uint8Array` do PNG), bitmap (`ImageData` RGBA)
- **Log de erros** em textarea + mensagens inline em falhas de geração ou ações
- SPA estática 100% no browser (sem API server-side)

**Fora de escopo (Non-goals):**

- Leitor/decodificador de QR Code
- Câmera ou upload de imagem para leitura
- Backend, autenticação, histórico, templates Wi-Fi/vCard
- UI para customizar tamanho ou nível de correção de erro (usa defaults da lib)

## Capabilities

### New Capabilities

- `qr-generator`: Geração de QR Code a partir de texto, preview, exportação PNG, formatos técnicos colapsáveis e tratamento de erros

### Modified Capabilities

_(nenhuma — projeto greenfield)_

## Impact

- **Código**: novo app em `src/` (Vite + TypeScript)
- **Dependências**: `qrcode`, `vite`, `vitest`, `@fission-ai/openspec`
- **Deploy**: artefato estático em `dist/`
- **Testes**: 19 testes unitários cobrindo `src/lib/*`
