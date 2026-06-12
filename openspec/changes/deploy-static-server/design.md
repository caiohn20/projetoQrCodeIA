## Context

A aplicação **projetoQrCodeIA** é uma SPA Vite servida como arquivos estáticos (`dist/`). Não há backend; toda lógica roda no browser. O cliente precisa acessar a ferramenta online via URL pública.

Estado atual: app implementada, testes passando localmente, build gera `dist/`, sem infraestrutura de deploy no repositório.

Stakeholders: Caioh (dev/ops), cliente final (usuário do gerador).

## Goals / Non-Goals

**Goals:**

- Disponibilizar a app em URL pública com HTTPS
- Pipeline repetível: test → build → deploy → smoke test
- Configuração documentada e versionada no repo
- Rollback simples em caso de falha
- Custo operacional baixo (app estática, tráfego moderado)

**Non-Goals:**

- Backend Node em produção
- Kubernetes, auto-scaling, multi-região
- Monitoramento APM / logs centralizados (fase 1)
- Preview deploy por PR
- WAF enterprise ou rate limiting avançado

## Decisions

### Opção A — VPS Linux + Nginx (recomendada para "servidor" propriamente dito)

**Escolha recomendada** quando o cliente exige servidor próprio (VPS, VM, bare metal).

```
┌──────────────┐     HTTPS      ┌─────────────┐     arquivos    ┌──────────┐
│   Browser    │ ─────────────▶│   Nginx     │ ──────────────▶│  dist/   │
│  (cliente)   │               │  + Certbot  │   /var/www/... │ (release)│
└──────────────┘               └─────────────┘                └──────────┘
                                      │
                               GitHub Actions
                               (rsync/scp deploy)
```

**Componentes:**

| Componente | Função |
|------------|--------|
| Ubuntu 22.04+ / Debian | SO do VPS |
| Nginx | Servir estáticos, gzip, cache, redirect HTTP→HTTPS |
| Certbot | TLS Let's Encrypt, renovação automática |
| `/var/www/qrcode/releases/<timestamp>/` | Releases versionadas |
| symlink `current` → release ativa | Rollback = repoint symlink |
| GitHub Actions | CI: test + build + deploy via SSH/rsync |

**Nginx (essencial):**

```nginx
server {
    listen 443 ssl http2;
    server_name qrcode.exemplo.com.br;
    root /var/www/qrcode/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**Alternativa descartada (mesmo VPS):** Node `serve`/`http-server` — desnecessário; Nginx é mais maduro para TLS, cache e headers.

### Opção B — PaaS estático (alternativa mais simples)

**Netlify / Vercel / Cloudflare Pages / GitHub Pages**

- Conectar repo → build command `npm run build`, output `dist/`
- TLS gerenciado, CDN incluído, zero manutenção de SO
- **Trade-off:** menos controle sobre "servidor"; pode ser suficiente se cliente não exige VPS

Documentar como plano B se VPS não estiver disponível.

### Pipeline CI/CD (GitHub Actions)

```yaml
# Fluxo proposto
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - checkout
      - setup-node (20.x)
      - npm ci
      - npm test
      - npm run build
      - rsync dist/ → servidor:/var/www/qrcode/releases/$GITHUB_SHA/
      - ssh: ln -sfn .../releases/$SHA .../current && nginx -t && systemctl reload nginx
      - curl smoke test URL produção
```

Secrets necessários: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`.

### Estrutura de arquivos no repositório (a criar na implementação)

```
deploy/
├── nginx/
│   └── qrcode.conf          # template de site
├── scripts/
│   ├── deploy.sh            # rsync + symlink + reload
│   ├── rollback.sh          # repoint symlink release anterior
│   └── smoke-test.sh        # curl checks
└── README.md                # runbook operacional
.github/
└── workflows/
    └── deploy.yml
```

### Vite base path

**Decisão:** manter `base: '/'` (raiz do domínio).

Se deploy em subpath (ex.: `/qrcode/`), ajustar `vite.config.ts` `base: '/qrcode/'` **antes** do primeiro deploy — documentado como open question.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Clipboard exige HTTPS | Certbot + redirect HTTP→HTTPS |
| Deploy quebra assets (base path errado) | Smoke test valida JS bundle 200 |
| Certificado expira | Certbot timer + alerta manual mensal |
| SSH key comprometida | key dedicada deploy-only, sudo limitado |
| `dist/` sobrescrito sem backup | releases versionadas + symlink |
| Node engine mismatch no CI | pin `20.x` igual ao dev |

## Migration Plan

### Fase 1 — Preparação (pré-produção)

1. Registrar DNS `qrcode.<domínio>` → IP do VPS
2. Provisionar VPS (1 vCPU, 1GB RAM suficiente para Nginx estático)
3. Instalar Nginx + Certbot
4. Criar usuário deploy e diretório `/var/www/qrcode/`
5. Adicionar arquivos `deploy/` e workflow no repo

### Fase 2 — Primeiro deploy

1. Push em `main` dispara pipeline
2. Pipeline publica em `releases/<sha>/`, ativa symlink `current`
3. Certbot emite certificado para domínio
4. Smoke test confirma 200 + título + asset JS

### Fase 3 — Rollback (se necessário)

```bash
./deploy/scripts/rollback.sh   # repoint current → release anterior
nginx -t && systemctl reload nginx
./deploy/scripts/smoke-test.sh
```

### Rollback manual

1. Listar releases em `/var/www/qrcode/releases/`
2. `ln -sfn releases/<anterior> current`
3. `nginx -t && systemctl reload nginx`

## Open Questions

1. **Domínio final** — qual FQDN o cliente vai usar? (bloqueia Certbot e smoke test)
2. **VPS vs PaaS** — cliente exige servidor próprio ou aceita Netlify/Vercel?
3. **Subpath vs raiz** — app na raiz do domínio ou em subdiretório?
4. **Branch de deploy** — apenas `main` ou também tags de release?
