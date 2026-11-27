# Benchmark e Protótipo — PROAME

## Resumo
- **Recomendação:** Expo (React Native + TypeScript) + Supabase (região São Paulo). Um só código serve Android, iOS e Web, e o painel admin fica em `/admin` no mesmo app. A web pode ser hospedada como site estático no GoDaddy shared ou no Cloudflare Pages. Nota 93/100.
- **2º colocado:** PWA + Supabase (91), um caminho de MVP rápido sem as lojas.
- O site atual proame.org usa **WordPress 7.1.5 + Elementor**. Ele pode continuar como site institucional.
- Detalhes: [benchmark.md](benchmark.md) · Funcionalidades, modelo de dados e API: [features.md](features.md)

## Como abrir o protótipo
Dê um duplo clique em `prototype/index.html`. Ele abre direto do disco (file://), sem build e sem internet.
- Público: menu no topo. Admin: link "Área do admin" no rodapé, onde qualquer e-mail, senha e código de verificação (2 etapas) entram.
- Os dados ficam no `localStorage` do navegador. No admin, "Restaurar dados de exemplo" volta ao estado inicial.
- Use o seletor "Celular / Desktop" para alternar a moldura.
- **Paletas A, B e C** (canto inferior direito, ou `?tema=a|b|c` na URL). A escolha fica salva no navegador. A página inicial traz um aviso para comparar.
  - **A** = cor original da marca (`#A8CF45`).
  - **B** = cor mais pontuada do novo logotipo (padrão). Semente `#3e9528`.
  - **C** = segunda cor mais pontuada do logotipo. Semente `#92b929`, que fica próxima da A.
  - Contraste: cada par de texto com `on-*` tem de atingir WCAG AA (4,5:1). O script de geração reporta todas as razões.
- Novidades nesta versão (0.2.0): administradores e Roots, configurações (e-mail, termo LGPD, notificações), auditoria, central de ajuda, novidades e ajuda por página ("?").

## Premissas
- A paleta foi gerada a partir do novo logotipo (`assets/Logo-PROAME-2.png`), com o método Material Color Utilities (QuantizerCelebi, Score, SchemeTonalSpot). A paleta C usa a mesma semente (#3e9528) com SchemeVibrant, para ficar visualmente distinta da B. A premissa antiga (azul e laranja, presumida) está obsoleta.
- Aguardando a escolha de paleta (A, B ou C) pelo Helder.

## Regenerar paletas e logotipos
Execute dentro de `prototype/tools/` (`npm install` na primeira vez; `node_modules` é ignorado pelo Git):
- `node palette-gen.mjs` gera `prototype/themes.css` e imprime o relatório de contraste. Sai com erro se algum par ficar abaixo de 4,5:1.
- `node logo-gen.mjs` gera `prototype/assets/logo/` (logotipo 1x/2x/3x, símbolo, favicons, ícones PWA e de loja, og-image).

## Gate de vetor (antes da loja)
O logotipo e o símbolo são **rasterizados** a partir do PNG de trabalho. O símbolo é um recorte, que fica cortado na base. Antes do lançamento nas lojas, é preciso um **redesenho vetorial (SVG)**. O `MauiIcon` e o `MauiSplashScreen` do app MAUI aceitam SVG. Sem esse SVG, o release não sai.
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
