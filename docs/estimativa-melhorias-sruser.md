# Estimativa de esforço — Melhorias SrUser

**Projeto:** projetoQrCodeIA  
**Origem:** [`melhorias-sruser.md`](./melhorias-sruser.md)  
**Autores:** John (PM) · Mary (Business Analyst)  
**Data:** 11/06/2026  
**Stack:** Vite + TypeScript vanilla · `src/app.ts` · `src/lib/*` · 19 testes unitários baseline

---

## Resumo executivo

| Métrica | Valor |
|---------|-------|
| Itens estimados | 5 (M-01 … M-05) |
| Esforço provável (dev solo) | **18 h** (~2,25 dias úteis) |
| Faixa total | **13 h** (otimista) — **23 h** (pessimista) |
| Story points (referência) | **~10 SP** |
| Risco geral | **Baixo** — sem backend, sem mudança de arquitetura |
| Sprint 1 recomendado | M-01 + M-04 + M-03 (~10,5 h) |
| Sprint 2 / buffer | M-02 + M-05 (~8 h) |

---

## 📋 John — Visão de produto

As cinco melhorias atacam fricção real no fluxo principal: prevenir erro antes da geração, dar controle no download e fechar o loop de feedback (“funcionou?”). Nenhuma exige backend — são incrementos de UX com alto retorno no stack atual.

### Priorização MoSCoW

| Prioridade | IDs | Rationale |
|------------|-----|-----------|
| **Must** | M-01, M-04 | M-01 evita QR inválido/ilegível (impacto 5). M-04 fecha confirmação de copy/download; base parcial já existe. |
| **Should** | M-02, M-03 | M-02 reduz retrabalho pós-download. M-03 é higiene do log — quick win (~1,5 h). |
| **Could** | M-05 | Onboarding; escopo limitado a URL + texto curto (sem wizard Wi‑Fi). |

### Estimativa por item (visão PM)

| ID | Esforço dev (h) | Risco | Dependências | Valor negócio (1–5) |
|----|-----------------|-------|--------------|---------------------|
| M-01 | 5 | Baixo | Heurística de capacidade QR (ECC M default); UI no textarea | 5 |
| M-02 | 3 | Baixo | `downloadPng()` + sanitização de nome | 4 |
| M-03 | 1,5 | Baixo | `errorLog.clear()` já existe | 3 |
| M-04 | 4 | Baixo | Reforço do `#action-feedback` + `aria-live` | 4 |
| M-05 | 5 | Médio | Chips estáticos; **sem** parser Wi‑Fi | 3 |
| **Total** | **18,5** | — | — | — |

*Inclui implementação + testes + review leve. Não inclui redesign amplo nem i18n.*

### Plano de sprint

**Sprint 1 (~16–20 h de capacidade)**

| Item | Horas | Motivo |
|------|-------|--------|
| M-01 | 5 | Must — job principal |
| M-04 | 4 | Must — confirmação perceptível |
| M-03 | 1,5 | Should — encaixa no mesmo pacote |
| **Subtotal** | **~10,5 h** | Margem para regressão e review |

**Sprint 2 (~8 h)**

| Item | Horas | Motivo |
|------|-------|--------|
| M-02 | 3 | Should — organização de downloads |
| M-05 | 5 | Could — exemplos URL/texto apenas |
| **Subtotal** | **~8 h** | |

**Cenário agressivo (1 sprint):** M-01 + M-04 + M-03 + M-02 (~13,5 h); **adiar M-05**.

### Decisões de escopo (John)

| ID | Decisão |
|----|---------|
| M-01 | Contador + aviso progressivo (ok → atenção → limite); não bloquear digitação |
| M-02 | Campo opcional; default `qrcode.png`; sanitizar caracteres inválidos |
| M-03 | Botão “Limpar log”; confirmação opcional só se log grande (nice-to-have) |
| M-04 | Reaproveitar feedback existente; toast ou estado no botão; `aria-live` |
| M-05 | **In:** chips URL + texto curto. **Out:** Wi‑Fi, vCard, wizard multi-campo |

---

## 📊 Mary — Análise e metodologia

Estimativas derivadas do MVP atual: lógica testável em `src/lib/`, UI em `app.ts`, APIs reutilizáveis (`errorLog.clear()`, `downloadPng()`).

### Metodologia

| Elemento | Definição |
|----------|-----------|
| Story points | 1 SP ≈ 2 h · 2 SP ≈ 4 h · 3 SP ≈ 6–8 h |
| Horas min–max | Incerteza técnica + superfície de UI |
| Testes novos | Unitários em `lib/` + mocks DOM (`dom-mocks.ts`) |
| Premissa | 1 dev familiarizado; pt-BR only; sem backend |

### Estimativa detalhada (Mary)

| ID | Complexidade | SP | Horas (min–max) | Testes novos | Impacto | Evidência no código |
|----|--------------|-----|-----------------|--------------|---------|---------------------|
| M-01 | Média | 3 | 5–8 | 4–6 | Alto | `qr-generate.ts`, `errors.ts`, textarea em `app.ts` |
| M-02 | Baixa | 2 | 2–4 | 2–3 | Médio | `download.ts`, `download.test.ts` |
| M-03 | Baixa | 1 | 1–2 | 1–2 | Médio | `errorLog.clear()` em `errors.ts` |
| M-04 | Baixa–Média | 2 | 3–5 | 2–4 | Médio–Alto | `#action-feedback` parcial em `app.ts` |
| M-05 | Baixa | 2 | 2–4 | 2–3 | Médio | Presets estáticos; sem nova lib |
| **Total** | — | **~10** | **13–23** | **11–18** | — | — |

### Premissas e exclusões

**Premissas**

- M-01 usa ECC **M** (default atual); sem seletor de correção na UI
- M-02: nome ≤ 100 caracteres; caracteres inválidos de filesystem removidos
- M-04: CSS/componentes existentes; sem lib de toast externa
- M-05: 2–3 presets fixos (URL + texto curto)

**Exclusões**

- `localStorage` para preferências
- Analytics / telemetria
- i18n adicional
- E2E Playwright (fora do escopo desta estimativa)
- Refatoração para framework reativo

### Critérios de aceite (1 linha)

| ID | Critério |
|----|----------|
| M-01 | Contagem visível + aviso claro ao aproximar/exceder capacidade do QR |
| M-02 | Download usa nome informado (sanitizado), fallback seguro, extensão `.png` |
| M-03 | “Limpar” esvazia log via `errorLog.clear()` |
| M-04 | Copy/download com confirmação perceptível e acessível (`aria-live`) |
| M-05 | Preset preenche textarea com exemplo válido pronto para gerar |

### Esforço total (faixas)

| Cenário | Horas | Equivalente |
|---------|-------|-------------|
| Otimista | 13 h | ~1,6 dias úteis |
| **Provável** | **18 h** | **~2,25 dias úteis** |
| Pessimista | 23 h | ~2,9 dias úteis |

---

## Consenso John + Mary

| Tema | Acordo |
|------|--------|
| Prioridade #1 | **M-01** (contador + aviso) |
| Pacote Sprint 1 | M-01, M-04, M-03 |
| M-05 | Apenas exemplos URL/texto; Wi‑Fi fora do v1 |
| Esforço baseline | **18 h** provável |
| OpenSpec | Atualizar `qr-generator` spec se M-01/M-04 mudarem requisitos normativos |

---

## Próximos passos

1. **Sally** — copy dos estados do contador (ok / atenção / limite)
2. **Amelia** — implementar Sprint 1 (M-01, M-04, M-03)
3. **John** — change OpenSpec `sruser-improvements-sprint1` (opcional)
4. **SrUser** — reavaliar após deploy das melhorias Must

---

## Referências

- Proposta original: [`docs/melhorias-sruser.md`](./melhorias-sruser.md)
- Spec funcional: [`docs/new_specs_bmad/especificacao-funcional.md`](./new_specs_bmad/especificacao-funcional.md)
- OpenSpec: [`openspec/specs/qr-generator/spec.md`](../openspec/specs/qr-generator/spec.md)
