# Melhorias propostas — SrUser

**Projeto:** projetoQrCodeIA (Gerador de QR Code online)  
**Autor:** SrUser (Usuário Sênior)  
**Data:** 11/06/2026  
**Versão avaliada:** MVP implementado (`src/app.ts`, specs em `docs/new_specs_bmad/`)

---

## Avaliação resumida

Abri a página e em poucos segundos entendi o fluxo: colar o link, ver o QR aparecer sozinho. O debounce de ~300 ms evita preview piscando a cada tecla. **Baixar PNG** e **Copiar imagem** estão no lugar certo; formatos avançados colapsados não atrapalham quem só quer a imagem.

**Pontos positivos**

- Fluxo linear em uma tela, sem cadastro
- Preview em tempo real sem botão “Gerar”
- Log de erros visível para suporte/debug
- Interface em pt-BR, clara

**Fricções observadas**

| Severidade | Fricção |
|------------|---------|
| Alta | Não há indicação se o texto ainda “cabe” no QR antes de falhar |
| Média | Download sempre como `qrcode.png` — confunde ao gerar vários arquivos |
| Média | Log de erros acumula sem opção de limpar |
| Baixa | Feedback de cópia existe, mas é discreto (pode passar despercebido no mobile) |
| Baixa | Primeira visita: falta orientação de exemplos do que colar no campo |

---

## Cinco melhorias propostas

| ID | # | Sugestão | Job do usuário | Impacto (1–5) | Esforço | Prioridade sugerida |
|----|---|----------|----------------|---------------|---------|---------------------|
| M-01 | 1 | **Contador de caracteres** com aviso quando o texto se aproxima ou excede a capacidade do QR | Colar link/texto longo e saber na hora se o QR ainda será legível | 5 | S | **Must** |
| M-02 | 2 | **Nome do arquivo** no download (campo opcional, ex.: `cardapio-loja.png`) | Gerar vários QR no mesmo dia sem renomear `qrcode (1).png` | 4 | S | Should |
| M-03 | 3 | Botão **“Limpar log”** no painel de erros | Testar entradas inválidas e ver só o erro mais recente | 3 | S | Should |
| M-04 | 4 | **Feedback de cópia/download mais visível** (toast ou destaque no botão) | Confirmar que copiar/baixar funcionou, especialmente no celular | 4 | S | Should |
| M-05 | 5 | **Exemplos clicáveis** que preenchem o textarea (URL, texto curto) | Entender o formato na primeira visita sem adivinhar | 3 | M | Could |

### Detalhamento por melhoria

#### M-01 — Contador de caracteres com aviso

> *“Eu usaria isso quando colo um link longo e preciso saber na hora se o QR ainda vai escanear, sem esperar erro genérico.”*

- Exibir contagem ao lado ou abaixo do textarea
- Estados sugeridos: ok → atenção → limite excedido (inline, antes do log)
- **Nota técnica:** limiar pode derivar de tentativa de geração ou heurística da lib `qrcode`

#### M-02 — Nome customizado no download

> *“Eu usaria isso quando gero vários QR e não quero bagunça na pasta Downloads.”*

- Campo opcional com default `qrcode.png`
- Sanitizar nome (sem `/`, caracteres inválidos)

#### M-03 — Limpar log de erros

> *“Eu usaria isso quando testo de propósito e quero zerar o histórico.”*

- Botão secundário ao lado do label “Log de erros”
- Chamar `errorLog.clear()` existente em `src/lib/errors.ts`

#### M-04 — Feedback visual mais evidente

> *“Eu usaria isso no celular, quando não tenho certeza se copiar funcionou.”*

- Hoje existe `#action-feedback` com mensagens por ~2 s — reforçar com toast fixo ou estado no botão (“Copiado ✓”)
- Aplicar também aos botões **Copiar** dos formatos avançados

#### M-05 — Exemplos clicáveis

> *“Eu usaria na primeira abertura para ver um exemplo pronto sem googlar.”*

- Chips ou links: “Exemplo: URL”, “Exemplo: texto curto”
- **Nota de escopo:** não implica templates Wi‑Fi/vCard completos — apenas preenchimento de exemplo
- Validar com produto se entra no MVP ou pós-deploy

---

## Priorização (SrUser)

| Faixa | IDs | Motivo |
|-------|-----|--------|
| **Must** | M-01 | Protege o job principal — QR que escaneia |
| **Should** | M-02, M-03, M-04 | Quick wins, alto retorno percebido |
| **Could** | M-05 | Onboarding; esforço médio |

**Implementar primeiro:** **M-01** (contador + aviso de limite) — maior impacto no fluxo principal com esforço pequeno.

---

## Próximos passos sugeridos

1. John — validar M-05 contra escopo MVP (exemplos vs templates)
2. Sally — copy dos estados do contador (atenção / limite)
3. Amelia — implementar M-01 + M-03 (reuso de `errorLog.clear()`)
4. OpenSpec — change proposal se alguma melhoria alterar `openspec/specs/qr-generator/spec.md`

---

## Referências

- Código atual: `src/app.ts`
- Spec funcional: `docs/new_specs_bmad/especificacao-funcional.md`
- Spec OpenSpec: `openspec/specs/qr-generator/spec.md`
- Agente: `.agents/skills/agent-sruser/`
