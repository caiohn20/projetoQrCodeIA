## Why

O gerador de QR Code já funciona localmente (`npm run dev`) e gera artefato estático (`npm run build` → `dist/`), mas ainda não está disponível publicamente para o cliente. É necessário um plano de implantação em servidor para tornar a aplicação acessível via HTTPS de forma confiável e repetível.

## What Changes

- Definir **estratégia de hospedagem estática** para servir `dist/` (sem backend de aplicação)
- Documentar **pipeline de build e deploy** (testes → build → publicação)
- Especificar **configuração de servidor web** (Nginx ou equivalente) com HTTPS e headers de segurança
- Definir **fallback SPA** (`try_files` → `index.html`) para rotas futuras
- Estabelecer **verificação pós-deploy** (smoke test da página e geração básica)
- Preparar **rollback** e procedimento operacional mínimo

**Non-goals:**

- Deploy de API/backend Node (não existe no MVP)
- Container orchestration (Kubernetes) — fora do escopo inicial
- CDN multi-região ou auto-scaling — opcional futuro, não MVP de deploy
- CI de preview por PR — pode vir depois
- Monitoramento avançado (APM, logs centralizados) — apenas checks básicos no MVP

## Capabilities

### New Capabilities

- `static-deployment`: Hospedagem, build, publicação, HTTPS, verificação e operação do artefato estático em servidor

### Modified Capabilities

_(nenhuma — requisitos funcionais do `qr-generator` permanecem iguais)_

## Impact

- **Infraestrutura**: VPS Linux ou serviço de hosting estático (decisão no design)
- **Repositório**: possíveis arquivos novos (`nginx.conf`, workflow CI, scripts de deploy)
- **DNS**: registro/subdomínio apontando para o servidor
- **Certificados**: TLS via Let's Encrypt (se VPS) ou TLS gerenciado (PaaS)
- **Operação**: procedimento documentado de deploy e rollback
- **Código da app**: sem mudanças funcionais obrigatórias; possível ajuste de `base` no Vite se publicado em subpath
