## ADDED Requirements

### Requirement: Build reproduzível para produção

O pipeline de deploy SHALL executar testes unitários e build de produção antes de publicar qualquer artefato no servidor.

#### Scenario: Build bloqueado por testes falhos

- **WHEN** `npm test` falha no pipeline de deploy
- **THEN** o deploy não publica arquivos no servidor

#### Scenario: Build bem-sucedido gera dist

- **WHEN** `npm test` e `npm run build` concluem com sucesso
- **THEN** o diretório `dist/` contém `index.html`, assets hashed e está pronto para publicação

### Requirement: Hospedagem estática com HTTPS

O sistema implantado SHALL ser servido exclusivamente via HTTPS com certificado TLS válido.

#### Scenario: Acesso HTTP redireciona para HTTPS

- **WHEN** um cliente acessa a URL via `http://`
- **THEN** o servidor redireciona para a URL equivalente em `https://`

#### Scenario: Certificado TLS válido

- **WHEN** um cliente acessa a URL de produção via HTTPS
- **THEN** a conexão é estabelecida com certificado válido e sem aviso de segurança no browser

### Requirement: Servir artefato SPA

O servidor web SHALL servir os arquivos estáticos de `dist/` e retornar `index.html` para rotas desconhecidas (fallback SPA).

#### Scenario: Página principal carrega

- **WHEN** o usuário acessa a URL raiz de produção
- **THEN** o servidor retorna `index.html` com status 200

#### Scenario: Assets estáticos servidos com cache

- **WHEN** o browser solicita arquivos em `/assets/*`
- **THEN** o servidor retorna os arquivos com headers de cache apropriados para assets com hash no nome

#### Scenario: Rota desconhecida retorna SPA

- **WHEN** o usuário acessa uma rota inexistente no servidor (ex.: `/qualquer-coisa`)
- **THEN** o servidor retorna `index.html` (fallback) em vez de 404 bare

### Requirement: Headers de segurança mínimos

O servidor SHALL enviar headers de segurança básicos nas respostas HTML e estáticas.

#### Scenario: Headers presentes na resposta principal

- **WHEN** o servidor responde `index.html`
- **THEN** a resposta inclui pelo menos `X-Content-Type-Options: nosniff` e `Referrer-Policy: strict-origin-when-cross-origin`

### Requirement: Verificação pós-deploy

O processo de deploy SHALL incluir smoke test automatizado ou scriptado após publicação.

#### Scenario: Smoke test de disponibilidade

- **WHEN** o deploy é concluído
- **THEN** um check confirma HTTP 200 na URL raiz e presença do título "Gerador de QR Code" no HTML

#### Scenario: Smoke test de assets

- **WHEN** o deploy é concluído
- **THEN** um check confirma que pelo menos um bundle JS referenciado em `index.html` responde com status 200

### Requirement: Rollback documentado

O procedimento operacional SHALL permitir reverter para a versão anterior do `dist/` em caso de falha pós-deploy.

#### Scenario: Rollback para release anterior

- **WHEN** o smoke test pós-deploy falha
- **THEN** o operador pode restaurar o diretório de release anterior e a aplicação volta a responder 200 na URL raiz

### Requirement: Clipboard em contexto seguro

A aplicação em produção SHALL ser servida em contexto seguro para que APIs de clipboard funcionem conforme spec `qr-generator`.

#### Scenario: HTTPS habilita clipboard

- **WHEN** o usuário acessa a aplicação via HTTPS em produção
- **THEN** as ações "Copiar imagem" e copiar formatos avançados podem usar `navigator.clipboard` (sujeito a permissões do browser)
