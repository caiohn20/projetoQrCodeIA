# Especificação Funcional — Gerador de QR Code (projetoQrCodeIA)

**Versão:** 1.0  
**Data:** 11/06/2026  
**Autor:** Sally (UX Designer)  
**Idioma da interface:** pt-BR  
**Stack:** SPA vanilla (Vite + TypeScript), biblioteca `qrcode`

---

## 1. Visão geral e objetivo

### 1.1 Visão geral

O **projetoQrCodeIA** é uma aplicação web de página única (SPA) que permite ao usuário inserir texto livre e visualizar, em tempo quase real, um código QR gerado localmente no navegador. A aplicação oferece download do QR em PNG, cópia da imagem para a área de transferência e visualização de representações avançadas do mesmo conteúdo (Base64, bytes e bitmap).

Não há leitura de QR Code (câmera ou upload para decodificação). Toda a geração ocorre no cliente, sem backend de aplicação.

### 1.2 Objetivo

Permitir que qualquer pessoa gere rapidamente um QR Code a partir de texto, com feedback visual imediato, opções de exportação simples e transparência sobre erros — em português brasileiro, com interface clara e previsível.

### 1.3 Princípios de experiência

| Princípio | Descrição |
|-----------|-----------|
| **Imediatismo** | Preview atualizado automaticamente após pausa na digitação (debounce 300 ms). |
| **Transparência** | Erros visíveis inline e registrados em log persistente na sessão. |
| **Simplicidade** | Fluxo principal em uma tela; formatos avançados colapsados por padrão. |
| **Autonomia local** | Funciona offline após carregamento; sem conta ou servidor de API. |
| **Consistência** | Parâmetros padrão da biblioteca `qrcode`; sem configurações avançadas expostas no MVP. |

---

## 2. Personas e casos de uso

### 2.1 Personas

#### P1 — Usuário casual
- **Perfil:** Precisa de um QR para link, Wi‑Fi, contato ou texto curto.
- **Necessidade:** Gerar e baixar PNG em poucos cliques, sem entender formatos técnicos.
- **Frustração:** Apps com cadastro, anúncios ou passos desnecessários.

#### P2 — Desenvolvedor / integrador
- **Perfil:** Precisa embutir QR em sistema, e-mail ou documentação.
- **Necessidade:** Copiar imagem ou inspecionar Base64/bytes para debug.
- **Frustração:** Ferramentas que não expõem representação técnica do payload.

#### P3 — Operador de suporte
- **Perfil:** Gera QR para clientes e precisa confirmar que o conteúdo está correto.
- **Necessidade:** Ver preview instantâneo e mensagens de erro claras quando o texto é inválido ou excessivo.
- **Frustração:** Falhas silenciosas ou mensagens genéricas.

### 2.2 Casos de uso

| ID | Persona | Caso de uso | Resultado esperado |
|----|---------|-------------|-------------------|
| CU-01 | P1 | Inserir URL e baixar PNG | Arquivo PNG salvo com QR legível |
| CU-02 | P1 | Copiar imagem para colar em chat/doc | Imagem na área de transferência |
| CU-03 | P2 | Expandir formatos avançados e copiar Base64 | String Base64 disponível para uso |
| CU-04 | P3 | Inserir texto muito longo | Erro inline + entrada no log |
| CU-05 | P1 | Abrir app após deploy estático | Página carrega e funciona via HTTPS |
| CU-06 | P2 | Limpar campo de texto | Preview e formatos avançados resetam |

---

## 3. Escopo (in/out)

### 3.1 Dentro do escopo (IN)

- SPA de página única, rota implícita (`/`).
- Campo de texto multilinha para payload do QR.
- Preview do QR em tempo real (debounce 300 ms).
- Ações: **Baixar PNG** e **Copiar imagem**.
- Seção colapsável **Formatos avançados**: Base64, bytes, bitmap (somente leitura).
- Área de **log de erros** (textarea somente leitura, acumulativo na sessão).
- Mensagens de erro **inline** associadas ao campo de entrada e/ou preview.
- Interface completa em **pt-BR**.
- Geração com biblioteca `qrcode` usando **configurações padrão** da lib.
- Tratamento de estados: vazio, carregando/gerando, sucesso, erro.
- Deploy como site estático (build Vite → Nginx na VPS), conforme change `deploy-static-server`.

### 3.2 Fora do escopo (OUT)

- Leitura/decodificação de QR (câmera, upload, drag-and-drop de imagem).
- Autenticação, perfis, histórico persistente entre sessões.
- Personalização visual do QR (cores, logo central, margem, correção de erro configurável).
- Múltiplos tipos de payload estruturados (vCard, Wi‑Fi wizard, etc.).
- Backend de aplicação, banco de dados, analytics integrado.
- PWA/offline installable.
- Internacionalização para outros idiomas além de pt-BR no MVP.
- Testes E2E automatizados (MVP coberto por 19 testes unitários).

---

## 4. Fluxos de usuário

### 4.1 Fluxo principal — Gerar e baixar

```
[Usuário abre a app]
        |
        v
[Campo de texto vazio] -----> [Preview: placeholder / vazio]
        |
        | (digita texto)
        v
[Aguarda 300 ms sem digitar]
        |
        v
[QR gerado] -----> [Preview exibe imagem]
        |
        +-----> [Baixar PNG] -----> arquivo .png no dispositivo
        |
        +-----> [Copiar imagem] -----> feedback "Copiado!" (ou erro no log)
```

### 4.2 Fluxo — Formatos avançados

```
[QR gerado com sucesso]
        |
        v
[Usuário clica "Formatos avançados" (colapsado por padrão)]
        |
        v
[Seção expande]
        |
        +-----> [Base64] (textarea readonly + botão copiar)
        +-----> [Bytes]  (textarea readonly)
        +-----> [Bitmap] (textarea readonly)
        |
        v
[Usuário copia valor desejado]
```

### 4.3 Fluxo — Erro na geração

```
[Usuário digita texto inválido / excessivo]
        |
        v
[Debounce 300 ms]
        |
        v
[Tentativa de geração falha]
        |
        +-----> [Mensagem inline]
        +-----> [Nova linha no Log de erros]
        |
        v
[Preview: estado de erro ou placeholder]
[Botões Download/Copiar: desabilitados]
```

---

## 5. Especificação de telas e estados

A aplicação possui **uma única tela** com regiões funcionais fixas (layout responsivo, mobile-first).

### 5.1 Mapa de regiões

```
+--------------------------------------------------+
|  CABEÇALHO — Título + subtítulo                   |
+--------------------------------------------------+
|  ENTRADA — Label + textarea + erro inline         |
+--------------------------------------------------+
|  PREVIEW — Imagem QR (vazio | ok | erro)          |
+--------------------------------------------------+
|  AÇÕES — [Baixar PNG]  [Copiar imagem]            |
+--------------------------------------------------+
|  FORMATOS AVANÇADOS (colapsável, fechado default) |
+--------------------------------------------------+
|  LOG DE ERROS — textarea readonly                 |
+--------------------------------------------------+
```

### 5.2 Estados globais

| Estado | Condição | Comportamento |
|--------|----------|---------------|
| **Inicial** | Campo vazio | Preview vazio; ações desabilitadas |
| **Digitando** | Input recente (< 300 ms) | Aguarda debounce |
| **Gerando** | Após debounce, em andamento | Pode manter último QR ou placeholder |
| **Sucesso** | QR gerado | Preview visível; exportação habilitada |
| **Erro** | Falha na geração | Inline + log; ações desabilitadas |
| **Cópia OK** | Clipboard ok | Feedback "Copiado!" por ~2s |

---

## 6. Copy da interface (pt-BR)

| Elemento | Texto |
|----------|-------|
| Título | Gerador de QR Code |
| Subtítulo | Cole ou digite o conteúdo e exporte o QR Code em PNG ou formatos técnicos. |
| Label entrada | Conteúdo do QR Code |
| Placeholder | Cole ou digite o conteúdo do QR… |
| Preview vazio | Seu QR aparecerá aqui |
| Baixar | Baixar PNG |
| Copiar | Copiar imagem |
| Formatos avançados | Formatos avançados (base64, bitmap, bytes) |
| Log | Log de erros |
| Feedback cópia | Copiado! / PNG baixado. |

---

## 7. Requisitos funcionais numerados

**RF-01** — Campo de texto multilinha como única entrada do payload.

**RF-02** — Geração automática após **300 ms** de debounce.

**RF-03** — Biblioteca `qrcode` com parâmetros padrão (sem UI de configuração).

**RF-04** — Campo vazio = estado neutro sem QR (sem erro falso).

**RF-05** — Geração 100% no cliente, sem API backend.

**RF-06** — Preview dedicado após geração bem-sucedida.

**RF-07** — Sem botão "Gerar" obrigatório.

**RF-08** — Download PNG quando QR válido.

**RF-09** — Copiar imagem (`image/png`) quando QR válido.

**RF-10** — Download/cópia desabilitados sem QR válido.

**RF-11** — Seção "Formatos avançados" colapsável, **fechada por padrão**.

**RF-12** — Base64, bytes e bitmap readonly após geração.

**RF-13** — Formatos sincronizados com o preview atual.

**RF-14** — Formatos vazios sem QR válido.

**RF-15** — Erros inline no contexto da falha.

**RF-16** — Log de erros acumulativo na sessão (textarea readonly).

**RF-17** — Log com timestamp e origem (`create` | `action`).

**RF-18** — Falhas nunca silenciosas.

**RF-19** — Interface em pt-BR.

**RF-20** — Sem leitor/câmera/decode de QR.

**RF-21** — SPA de página única.

**RF-22** — Publicável como site estático (HTTPS recomendado).

**RF-23** — Mesma funcionalidade após deploy em URL pública.

**RF-24** — Lógica crítica coberta por testes unitários (19 casos baseline).

---

## 8. Regras de negócio

**RN-01** — QR válido somente após geração bem-sucedida pela lib.

**RN-02** — Debounce 300 ms reinicia a cada alteração no campo.

**RN-03** — Texto vazio = estado neutro, sem erro.

**RN-04** — Overflow de capacidade = erro inline + log, nunca QR silencioso corrompido.

**RN-05** — PNG baixado = mesma imagem do preview.

**RN-06** — Cópia = imagem PNG, não apenas texto do payload.

**RN-07** — Formatos avançados são derivados do artefato gerado.

**RN-08** — Log efêmero por sessão (refresh limpa).

**RN-09** — Sem persistência de texto entre sessões no MVP.

**RN-10** — Defaults da lib; sem override na UI.

---

## 9. Critérios de aceite

**CA-01** — Digitar URL/texto + pausa ≥ 300 ms → preview com QR legível, sem botão gerar.

**CA-02** — Digitação rápida → uma geração após pausa, conteúdo final correto.

**CA-03** — Download PNG → arquivo escaneável com conteúdo informado.

**CA-04** — Copiar imagem → feedback + colagem como imagem.

**CA-05** — Formatos avançados fechados ao carregar.

**CA-06** — Expandir formatos → Base64, bytes, bitmap preenchidos.

**CA-07** — Falha na geração → inline + log; exportação indisponível.

**CA-08** — Campo limpo → preview vazio; sem erro no log.

**CA-09** — Toda copy visível em pt-BR.

**CA-10** — Sem UI de leitor/câmera.

**CA-11** — Deploy estático → CA-01 a CA-04 válidos em produção.

**CA-12** — 19 testes unitários passando.

---

## 10. Acessibilidade mínima

**A-01** — Labels associados programaticamente aos campos.

**A-02** — `alt` descritivo na imagem de preview.

**A-03** — Contraste ≥ 4.5:1 (texto normal).

**A-04** — Erros não dependem só de cor.

**A-05** — Navegação por teclado (Tab, Enter/Espaço).

**A-06** — Foco visível em controles interativos.

**A-07** — Ordem de tab lógica: entrada → ações → formatos → log.

**A-08** — Mensagens de erro claras em pt-BR.

**A-09** — Botões desabilitados com estado visual claro.

**A-10** — HTML semântico (`main`, `section`, `button`, `details`).

**A-11** — Erros com `role="alert"` / `aria-live` onde aplicável.

**A-12** — Utilizável em viewport 320px.

---

## Referências cruzadas

| Artefato | Relação |
|----------|---------|
| [especificacao-tecnica.md](./especificacao-tecnica.md) | Arquitetura e implementação |
| `openspec/specs/qr-generator/spec.md` | Spec OpenSpec normativa |
| `openspec/changes/deploy-static-server/` | Plano de deploy |

---

*Documento preparado para handoff entre UX, desenvolvimento e QA.*
