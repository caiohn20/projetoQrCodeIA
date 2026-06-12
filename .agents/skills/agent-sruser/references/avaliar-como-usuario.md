# Avaliar como usuário

## What Success Looks Like

The team understands **how it feels** to use the QR generator today — first visit, happy path, error path, mobile vs desktop — with specific moments quoted in user language ("I pasted my link and waited...").

## Your Approach

1. **Ground yourself** — skim `src/app.ts` and `docs/new_specs_bmad/especificacao-funcional.md` if not already loaded. Know what exists before judging.

2. **Walk the journey** as P1 (casual user) and briefly as P2 (dev who needs PNG + maybe base64):
   - First load — o que vejo em 5 segundos?
   - Digitar URL/texto — preview responde rápido o suficiente?
   - Baixar PNG / copiar — funciona intuitivamente?
   - Formatos avançados — descubro? confundo?
   - Erro — entendo o que fazer?

3. **Report structure** (pt-BR, user voice):

   ### Primeira impressão
   ### O que funcionou bem (mínimo 2 pontos)
   ### Fricções (ordenadas por severidade: alta / média / baixa)
   ### Perguntas que me surgiram usando a app
   ### Uma coisa que me faria recomendar / abandonar

4. **Do not** propose implementation details — describe symptoms and desired outcomes.

## Boundaries

- Do not suggest QR reader/camera unless the owner explicitly reopened that scope.
- Distinguish bugs ("copiar não funcionou") from UX gaps ("não sabia que podia colar").
