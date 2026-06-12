# BMAD & OpenSpec - Gerador de QR CODE

Gerador de QR Code online — SPA estática, 100% client-side, em português (pt-BR).

A partir de texto livre, o usuário visualiza o QR em tempo real, baixa PNG, copia a imagem para a área de transferência e, opcionalmente, consulta representações técnicas (base64, bytes PNG, bitmap RGBA) em seção colapsável.

**Dono do projeto:** Caio Henrique Natal

---

## Escopo

### Dentro do escopo (MVP entregue)

| Funcionalidade | Descrição |
|----------------|-----------|
| Geração de QR | Texto livre → PNG via biblioteca `qrcode` (ECC M, margin 4, preto/branco) |
| Preview em tempo real | Debounce de ~300 ms enquanto o usuário digita |
| Exportação | Download PNG e copiar imagem para o clipboard |
| Formatos avançados | Base64, bytes (`Uint8Array`) e bitmap RGBA (`ImageData`) — colapsados por padrão |
| Erros | Mensagem inline + log de erros em textarea |

### Fora de escopo (MVP)

- Leitura/decodificação de QR (jsQR, câmera, upload para ler)
- Backend, API REST, autenticação ou histórico
- Templates Wi-Fi, vCard ou customização visual do QR

### Planejado (changes OpenSpec)

| Change | Status | Descrição |
|--------|--------|-----------|
| `qr-generator-mvp` | Arquivada | MVP implementado — spec em `openspec/specs/qr-generator/` |
| `deploy-static-server` | Planejamento | Deploy estático (VPS + Nginx + CI/CD) |
| Melhorias SrUser (M-01…M-05) | Backlog documentado | Ver [`docs/melhorias-sruser.md`](docs/melhorias-sruser.md) |

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Build / dev server | [Vite 6](https://vite.dev/) |
| Linguagem | TypeScript (ES2022, strict) |
| UI | DOM vanilla (sem React/Vue) |
| Geração de QR | [`qrcode`](https://www.npmjs.com/package/qrcode) ^1.5.4 |
| Testes | [Vitest 3](https://vitest.dev/) + [happy-dom](https://github.com/capricorn86/happy-dom) |
| Spec-driven dev | [OpenSpec](https://www.npmjs.com/package/@fission-ai/openspec) |
| Workflows de produto/dev | [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) 6.x |

**Defaults de geração (`qrcode`):**

- `errorCorrectionLevel`: M  
- `margin`: 4  
- `quality`: 0.92  
- `color`: `#000000` / `#ffffff`  
- `type`: `image/png`

---

## Estrutura do projeto

```
projetoQrCodeIA/
├── index.html              # Entry HTML
├── src/
│   ├── main.ts             # Bootstrap da aplicação
│   ├── app.ts              # UI e orquestração
│   ├── types/index.ts      # Tipos e QR_DEFAULT_OPTIONS
│   ├── lib/
│   │   ├── qr-generate.ts  # Geração do QR
│   │   ├── formats.ts      # base64, bytes, bitmap
│   │   ├── download.ts     # Download PNG e clipboard
│   │   └── errors.ts       # Log centralizado de erros
│   ├── styles/main.css
│   └── test/dom-mocks.ts   # Mocks para testes
├── docs/
│   ├── new_specs_bmad/     # Especificação funcional e técnica
│   ├── melhorias-sruser.md
│   └── estimativa-melhorias-sruser.md
├── openspec/
│   ├── config.yaml         # Contexto e regras do projeto
│   ├── specs/qr-generator/ # Spec principal (MVP)
│   └── changes/            # Changes ativas e arquivadas
├── _bmad/                  # Configuração BMAD (installer)
├── .agents/skills/         # Skills BMAD e agentes
└── .cursor/skills/         # Skills OpenSpec para Cursor
```

---

## Como executar

### Pré-requisitos

- **Node.js** 20+ (recomendado 20.19+ para compatibilidade com OpenSpec)
- **npm**

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abre o servidor Vite (geralmente `http://localhost:5173`).

### Build de produção

```bash
npm run build
```

Saída em `dist/` — pronta para hospedagem estática.

### Preview do build

```bash
npm run preview
```

### Testes

```bash
npm test          # execução única (19 testes unitários em src/lib/)
npm run test:watch
```

---

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`docs/new_specs_bmad/`](docs/new_specs_bmad/README.md) | Especificação funcional e técnica |
| [`openspec/specs/qr-generator/spec.md`](openspec/specs/qr-generator/spec.md) | Requisitos normativos (OpenSpec) |
| [`docs/melhorias-sruser.md`](docs/melhorias-sruser.md) | Melhorias propostas pelo agente SrUser |
| [`docs/estimativa-melhorias-sruser.md`](docs/estimativa-melhorias-sruser.md) | Priorização e esforço estimado |

---

## OpenSpec

Workflow spec-driven com changes versionadas em `openspec/changes/`.

Skills Cursor disponíveis:

| Skill | Uso |
|-------|-----|
| `openspec-propose` | Criar nova change |
| `openspec-apply-change` | Implementar change ativa |
| `openspec-archive-change` | Arquivar change concluída |
| `openspec-sync-specs` | Sincronizar specs |
| `openspec-explore` | Explorar o repositório OpenSpec |

Exemplo: `/opsx:apply deploy-static-server`

---

## Agentes BMAD e skills

O projeto usa o módulo **BMM** (BMAD Method) com time `software-development`. Agentes ficam em `.agents/skills/bmad-agent-*` e `.agents/skills/agent-sruser/`. Configuração em `_bmad/config.toml` e overrides em `_bmad/custom/config.toml`.

Para invocar um agente no Cursor, peça para falar com o agente pelo nome (ex.: *"fale com John"*, *"SrUser, sugira melhorias"*) ou use **party mode** (`bmad-party-mode`) para mesa redonda entre agentes.

### Agentes instalados (BMAD)

#### John — Product Manager

**Skill:** `bmad-agent-pm`  
**Papel:** PRD, descoberta de requisitos, alinhamento de stakeholders.

| Código | Skill vinculada | Descrição |
|--------|-----------------|-----------|
| PRD | `bmad-prd` | Criar, atualizar ou validar PRD |
| CE | `bmad-create-epics-and-stories` | Criar épicos e histórias |
| IR | `bmad-check-implementation-readiness` | Verificar alinhamento PRD / UX / arquitetura / stories |
| CC | `bmad-correct-course` | Corrigir rota quando há mudança grande no meio da implementação |

#### Mary — Business Analyst

**Skill:** `bmad-agent-analyst`  
**Papel:** Análise de mercado, requisitos e pesquisa de domínio.

| Código | Skill vinculada | Descrição |
|--------|-----------------|-----------|
| BP | `bmad-brainstorming` | Facilitação de brainstorming |
| MR | `bmad-market-research` | Análise de mercado e concorrência |
| DR | `bmad-domain-research` | Pesquisa de domínio e terminologia |
| TR | `bmad-technical-research` | Pesquisa técnica e opções de arquitetura |
| CB | `bmad-product-brief` | Product brief |
| WB | `bmad-prfaq` | Desafio PRFAQ (Working Backwards) |
| DP | `bmad-document-project` | Documentar projeto existente |

#### Sally — UX Designer

**Skill:** `bmad-agent-ux-designer`  
**Papel:** UX, fluxos, especificações de interface.

| Código | Skill vinculada | Descrição |
|--------|-----------------|-----------|
| CU | `bmad-ux` | Especificações e padrões de UX |

#### Winston — System Architect

**Skill:** `bmad-agent-architect`  
**Papel:** Decisões técnicas, arquitetura, trade-offs.

| Código | Skill vinculada | Descrição |
|--------|-----------------|-----------|
| CA | `bmad-create-architecture` | Documentar decisões de arquitetura |
| IR | `bmad-check-implementation-readiness` | Verificar prontidão para implementação |

#### Amelia — Senior Software Engineer

**Skill:** `bmad-agent-dev`  
**Papel:** Implementação test-first, stories, code review.

| Código | Skill vinculada | Descrição |
|--------|-----------------|-----------|
| DS | `bmad-dev-story` | Implementar story (testes + código) |
| QD | `bmad-quick-dev` | Fluxo rápido: clarificar → implementar → revisar |
| QA | `bmad-qa-generate-e2e-tests` | Gerar testes E2E |
| CR | `bmad-code-review` | Code review abrangente |
| SP | `bmad-sprint-planning` | Planejamento de sprint |
| CS | `bmad-create-story` | Preparar story para implementação |
| ER | `bmad-retrospective` | Retrospectiva de épico |
| IN | `bmad-investigate` | Investigação forense de bugs/incidentes |

#### Paige — Technical Writer

**Skill:** `bmad-agent-tech-writer`  
**Papel:** Documentação técnica, diagramas, validação de docs.

| Código | Skill vinculada | Descrição |
|--------|-----------------|-----------|
| DP | `bmad-document-project` | Documentação abrangente do projeto |
| WD | *(prompt interno)* | Autoria guiada de documentos |
| MG | *(prompt interno)* | Diagramas Mermaid |
| VD | *(prompt interno)* | Validar documentação |
| EC | *(prompt interno)* | Explicações técnicas com exemplos |

---

### Agente customizado (projeto)

#### SrUser — Usuário Sênior

**Skill:** `agent-sruser`  
**Config:** `_bmad/custom/config.toml` + `.agents/skills/agent-sruser/`  
**Papel:** Simula usuário final — avalia a jornada real do gerador QR, aponta fricções e propõe melhorias concretas (não implementa código).

| Código | Capability | Descrição |
|--------|------------|-----------|
| AU | `references/avaliar-como-usuario.md` | Avaliar a app como usuário |
| SM | `references/sugerir-melhorias.md` | Sugerir melhorias |
| PB | `references/priorizar-melhorias.md` | Priorizar backlog (impacto vs esforço) |
| PM | *(party mode)* | Debater sugestão com outro agente BMAD |

Saídas documentadas: [`docs/melhorias-sruser.md`](docs/melhorias-sruser.md), [`docs/estimativa-melhorias-sruser.md`](docs/estimativa-melhorias-sruser.md).

---

### Skills de orquestração (sem agente dedicado)

| Skill | Descrição |
|-------|-----------|
| `bmad-party-mode` | Mesa redonda com múltiplos agentes BMAD |
| `bmad-help` | Orientação sobre qual skill/agente usar |
| `bmad-spec` | Criar ou validar SPEC kernel |
| `bmad-quick-dev` | Implementação rápida fora do fluxo de story |
| `bmad-code-review` | Review adversarial em camadas |

Lista completa de skills instaladas: `.agents/skills/` (49 skills BMAD + `agent-sruser`).

---

## Scripts npm

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `vite` | Servidor de desenvolvimento |
| `build` | `tsc && vite build` | Type-check + build para `dist/` |
| `preview` | `vite preview` | Servir build localmente |
| `test` | `vitest run` | Testes unitários |
| `test:watch` | `vitest` | Testes em modo watch |
