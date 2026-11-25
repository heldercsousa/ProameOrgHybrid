# Plano

1. Orquestrador: ler requisitos, inspecionar proame.org, escrever goal.md/plan.md.
2. Orquestrador escreve `benchmark.md`, `features.md`, `README.md` (documentos de decisão).
3. Coder (haiku, low): gera `prototype/` (index.html, styles.css, app.js, data.js) — SPA com hash-routing, dados em localStorage.
4. Verificação: node checa sintaxe do JS; checagem de rotas.
5. Revisor (haiku, low, contexto limpo): confere entregáveis vs goal.md e requisitos; só relatório.
6. Se houver problemas reais: coder corrige → revisor de novo.
7. Commit + push `develop`; marcar goal.md.

Premissas: paleta não extraível do HTML (CSS externo) → usar azul-esperança + laranja-amor; dados fictícios; login fake (qualquer senha).
