## 1. Scaffold e configuração

- [x] 1.1 Configurar Vite + TypeScript + `index.html`
- [x] 1.2 Adicionar dependências (`qrcode`, scripts dev/build/test)
- [x] 1.3 Estrutura base `src/` (app, lib, types, styles)

## 2. Geração de QR Code

- [x] 2.1 Implementar `generateQr` com defaults da lib
- [x] 2.2 Preview em tempo real com debounce no textarea
- [x] 2.3 Tratar texto vazio e erros de geração (inline + log)

## 3. Exportação

- [x] 3.1 Download PNG via data URL
- [x] 3.2 Copiar imagem para clipboard (`image/png`)
- [x] 3.3 Desabilitar ações quando não há QR válido

## 4. Formatos avançados

- [x] 4.1 Seção colapsável `<details>` (fechada por padrão)
- [x] 4.2 Exibir base64 (data URL completa) com copiar
- [x] 4.3 Exibir bytes PNG (`Uint8Array`) com preview truncado
- [x] 4.4 Exibir bitmap RGBA (`ImageData`) com metadados

## 5. Log de erros

- [x] 5.1 Singleton `errorLog` com timestamp e origem
- [x] 5.2 Textarea read-only na UI
- [x] 5.3 Integrar erros de geração e ações (download/cópia)

## 6. Testes e qualidade

- [x] 6.1 Configurar Vitest + happy-dom
- [x] 6.2 Testes unitários: `qr-generate`, `formats`, `download`, `errors`
- [x] 6.3 Validar build de produção (`npm run build`)

## 7. OpenSpec

- [x] 7.1 Inicializar OpenSpec (`openspec init --tools cursor`)
- [x] 7.2 Documentar change `qr-generator-mvp` e specs formais
