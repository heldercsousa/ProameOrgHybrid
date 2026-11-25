# Goal — Benchmark + Protótipo PROAME

Condição de parada: todos os itens marcados.

- [x] Requisitos lidos (`Docs/Chats/202611181100 initial business chat.txt`) e proame.org inspecionado (WordPress 7.1.5 + Elementor confirmado)
- [x] `benchmark.md`: 5 stacks cross-platform comparadas (Flutter, RN/Expo, MAUI+Blazor Hybrid, Ionic/Capacitor, PWA)
- [x] `benchmark.md`: backends (Supabase, Firebase, ASP.NET Core, Directus/Strapi/Payload, WordPress-as-backend)
- [x] `benchmark.md`: hospedagem GoDaddy (shared vs VPS) + alternativas com free tier para ONG
- [x] `benchmark.md`: critérios (custo, autonomia admin, form builder, PDFs, auth/roles, LGPD, lojas, manutenção, MVP), matriz ponderada, recomendação, 2º colocado, riscos
- [x] `features.md`: mapa de autonomia do admin (CMS, projetos, form builder, inscrições+CSV+status, ofertas, editais, usuários/papéis, LGPD, notificações)
- [x] `features.md`: MVP vs fases, modelo de dados, endpoints API público vs privado
- [x] `prototype/index.html` abre via file://, sem build, pt-BR, mobile-first
- [x] Protótipo público: Home, Quem somos(+contato), O que realizamos, O que temos (lista + detalhe com form renderizado de JSON), Como posso colaborar, Transparência (download)
- [x] Protótipo admin: login fake, dashboard, editor de páginas, editor de projeto com form builder (add/remove/reordenar/tipo/obrigatório/preview), inscrições, ofertas, upload de editais (localStorage)
- [x] Toggle celular/desktop
- [x] `README.md`: resumo, como abrir, decisões para Helder
- [x] Revisor (contexto limpo) aprovou ou problemas corrigidos
- [x] Verificado sem erros JS / links quebrados
- [x] Commit + push em `develop`

Nota: revisor aprovou; pendência menor conhecida — upload de edital acima da cota do localStorage mostra sucesso mas some ao recarregar (limitação do protótipo).
