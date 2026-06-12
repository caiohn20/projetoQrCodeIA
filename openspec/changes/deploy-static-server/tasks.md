## 1. Decisões e pré-requisitos

- [ ] 1.1 Confirmar com cliente: domínio (FQDN), VPS vs PaaS, raiz vs subpath
- [ ] 1.2 Registrar DNS apontando para IP do servidor (registro A/AAAA)
- [ ] 1.3 Definir branch de deploy (recomendado: `main` only)

## 2. Provisionamento do servidor (VPS)

- [ ] 2.1 Provisionar VPS Linux (Ubuntu 22.04+ ou Debian 12+)
- [ ] 2.2 Criar usuário `deploy` com acesso SSH por chave (sem senha)
- [ ] 2.3 Instalar Nginx (`apt install nginx`)
- [ ] 2.4 Criar estrutura de diretórios:
  - `/var/www/qrcode/releases/`
  - `/var/www/qrcode/current` (symlink)
- [ ] 2.5 Configurar firewall (UFW): permitir 22, 80, 443

## 3. TLS e Nginx

- [ ] 3.1 Adicionar template `deploy/nginx/qrcode.conf` ao repositório
- [ ] 3.2 Copiar/ativar site Nginx no servidor (sites-available → sites-enabled)
- [ ] 3.3 Instalar Certbot e emitir certificado Let's Encrypt para o domínio
- [ ] 3.4 Configurar redirect HTTP → HTTPS (porta 80 → 443)
- [ ] 3.5 Validar headers de segurança (`X-Content-Type-Options`, `Referrer-Policy`)
- [ ] 3.6 Configurar cache para `/assets/*` (immutable, 1y)
- [ ] 3.7 Configurar fallback SPA (`try_files $uri $uri/ /index.html`)
- [ ] 3.8 Testar `nginx -t` e reload sem erros

## 4. Scripts de deploy e operação

- [ ] 4.1 Criar `deploy/scripts/deploy.sh` (rsync dist → releases/$SHA, symlink current, reload nginx)
- [ ] 4.2 Criar `deploy/scripts/rollback.sh` (repoint symlink para release anterior)
- [ ] 4.3 Criar `deploy/scripts/smoke-test.sh` (curl 200 raiz, grep título, validar asset JS)
- [ ] 4.4 Criar `deploy/README.md` com runbook (deploy manual, rollback, renovação TLS)

## 5. CI/CD (GitHub Actions)

- [ ] 5.1 Criar `.github/workflows/deploy.yml`
- [ ] 5.2 Pipeline: checkout → Node 20 → `npm ci` → `npm test` → `npm run build`
- [ ] 5.3 Step deploy: rsync/scp `dist/` via SSH para `releases/$GITHUB_SHA/`
- [ ] 5.4 Step pós-deploy: ativar symlink + `nginx -t` + reload
- [ ] 5.5 Step smoke test contra URL de produção
- [ ] 5.6 Configurar secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_DOMAIN`

## 6. Primeiro deploy e validação

- [ ] 6.1 Executar deploy manual ou via push em `main`
- [ ] 6.2 Confirmar HTTPS válido no browser (cadeado verde)
- [ ] 6.3 Smoke test automatizado passa (200, título, assets)
- [ ] 6.4 Teste funcional manual: gerar QR, baixar PNG, copiar imagem, formatos avançados
- [ ] 6.5 Teste clipboard em HTTPS (copiar imagem e base64)
- [ ] 6.6 Documentar URL final de produção no README do projeto

## 7. Rollback e contingência

- [ ] 7.1 Simular rollback para release anterior com `rollback.sh`
- [ ] 7.2 Confirmar app responde 200 após rollback
- [ ] 7.3 Documentar critério de rollback (smoke test falhou pós-deploy)

## 8. Alternativa PaaS (se VPS não for opção)

- [ ] 8.1 Documentar passos Netlify/Vercel/Cloudflare Pages no `deploy/README.md`
- [ ] 8.2 Configurar build: `npm run build`, output `dist/`, Node 20
- [ ] 8.3 Validar HTTPS e smoke test equivalente na URL do PaaS
