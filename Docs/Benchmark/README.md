# Benchmark e Protótipo — PROAME

## Resumo
- **Recomendação:** Expo (React Native + TypeScript) + Supabase (região São Paulo). Um só código serve Android, iOS e Web, e o painel admin fica em `/admin` no mesmo app. A web pode ser hospedada como site estático no GoDaddy shared ou no Cloudflare Pages. Nota 93/100.
- **2º colocado:** PWA + Supabase (91), um caminho de MVP rápido sem as lojas.
- O site atual proame.org usa **WordPress 7.1.5 + Elementor**. Ele pode continuar como site institucional.
- Detalhes: [benchmark.md](benchmark.md) · Funcionalidades, modelo de dados e API: [features.md](features.md)

## Como abrir o protótipo
Dê um duplo clique em `prototype/index.html`. Ele abre direto do disco (file://), sem build e sem internet.
- Público: menu no topo. Admin: link "Área do admin" no rodapé, onde qualquer e-mail e senha entram.
- Os dados ficam no `localStorage` do navegador. No admin, "Restaurar dados de exemplo" volta ao estado inicial.
- Use o seletor "Celular / Desktop" para alternar a moldura.

## Premissas
- A paleta foi presumida (azul #1f5fa8 + laranja #f28c28), porque as cores do site vêm de CSS externo do Elementor.
- Todos os dados do protótipo são fictícios. O login e o upload são simulados.
- Preços e free tiers seguem a documentação pública conhecida e devem ser reconfirmados na contratação.

## Decisões para o Helder
1. Aprovar a stack (Expo + Supabase) ou escolher a alternativa (PWA primeiro, ou Flutter).
2. Decidir o papel do WordPress atual: continua institucional e aponta para o app, ou o app substitui o site.
3. Hospedagem da web: GoDaddy shared (estático) ou Cloudflare Pages. Supabase Free para piloto, ou Pro (~US$25/mês) para produção.
4. Contas de loja em nome da ONG: CNPJ, D-U-N-S e pedido de isenção da taxa Apple. Google Play custa US$25.
5. LGPD: definir o encarregado (DPO), o texto de consentimento e o prazo de retenção dos dados de beneficiários.
6. Confirmar o escopo do MVP (web + Android primeiro?) e os papéis (admin, editor, coordenador).
7. Notificações: só e-mail no MVP, WhatsApp depois?
