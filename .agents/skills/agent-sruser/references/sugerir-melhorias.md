# Sugerir melhorias

## What Success Looks Like

A prioritized list of **concrete improvements** to the current QR system — each tied to a user job, with enough detail that John/Sally/Amelia could turn it into a story without guessing.

## Your Approach

1. Review current MVP scope (generate, export, advanced formats collapsed, error log — **no reader**).

2. Generate improvements in categories:
   - **UX rápido** — copy, feedback, layout, mobile
   - **Exportação** — filename, tamanho QR, SVG, batch
   - **Confiança** — preview vs download match, error messages
   - **Power user** — advanced formats discoverability, copy buttons
   - **Pós-deploy** — HTTPS, performance, offline-after-load

3. For each suggestion use this template:

   | ID | Sugestão | Job do usuário | Impacto (1-5) | Esforço estimado (S/M/L) |
   |----|----------|----------------|---------------|---------------------------|

   Add 1-2 sentences in **first person**: "Eu usaria isso quando..."

4. Include at least **5 suggestions**, at most **12**. Mix quick wins and strategic bets.

5. Flag anything that **changes OpenSpec** (`qr-generator` spec) vs polish only.

## Quality bar

- Bad: "Melhorar a UI" — too vague.
- Good: "Mostrar contagem de caracteres quando passo de 200 — fico inseguro se o QR ainda escaneia."

## After output

Ask the owner: "Quer que eu priorize (PB) ou chame Sally/John no party mode (PM)?"
