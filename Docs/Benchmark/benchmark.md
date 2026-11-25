# Benchmark de Stack — App PROAME

> Data: 2026-11-25 · Autor: Claude (orquestrador) · Status: proposta para aprovação do Helder
> Fonte de requisitos: `Docs/Chats/202611181100 initial business chat.txt`

## 1. Contexto
- ONG em Gama/DF, equipe pequena, orçamento mínimo, admin **autônomo** (sem dev para rotina).
- Alvos: **Android, iOS, Web** (Desktop opcional).
- Site atual **proame.org = WordPress 7.1.5 + Elementor 4.4.1** (confirmado pela meta `generator`), provavelmente hospedado no GoDaddy.
- Dados pessoais de beneficiários (Nome, Endereço, Telefone, CadÚnico) → **LGPD**: base legal, consentimento, acesso restrito, retenção.

## 2. Critérios e pesos
| # | Critério | Peso |
|---|---|---|
| C1 | Custo total para ONG (infra + lojas + licenças) | 15 |
| C2 | Autonomia do admin (CMS, projetos, editais) | 15 |
| C3 | Esforço do form builder dinâmico | 10 |
| C4 | Armazenamento de PDFs/fotos | 5 |
| C5 | Auth/papéis | 10 |
| C6 | LGPD (RLS, auditoria, região de dados) | 10 |
| C7 | Publicação nas lojas (custo/esforço) | 5 |
| C8 | Manutenção por equipe pequena / pool de talentos | 15 |
| C9 | Time-to-MVP | 15 |
| | **Total** | **100** |

Notas de 1 a 5 (5 = melhor). Pontuação = Σ(nota × peso) / 5 → escala 0–100.

## 3. Frontend cross-platform
| Stack | Android/iOS | Web | Desktop | Prós | Contras |
|---|---|---|---|---|---|
| **Flutter 3.x** (+web/desktop) | Nativo compilado | Sim (CanvasKit/Wasm; SEO fraco) | Win/macOS/Linux | Um código, UI consistente, ótimo desempenho, form dinâmico simples | Web pesada e ruim de SEO; Dart tem pool de devs menor que JS |
| **React Native / Expo** (+web) | Sim (New Architecture) | Sim (react-native-web, Expo Router com export estático) | Fraco (RN-Windows/macOS) | TypeScript, maior pool de devs no Brasil, EAS Build/Update (OTA) | Web "quase nativa", ajustes de estilo; libs nativas exigem config |
| **.NET MAUI + Blazor Hybrid** | Sim | Exige Blazor Web separado | Windows/macOS | C#, compartilha componentes Razor | Tooling iOS instável, infra mais pesada, pool pequeno para ONG |
| **Ionic + Capacitor** (React/Angular) | WebView | Web nativa (bom SEO com SSR) | Via Electron | Um app web empacotado, devs web comuns | Sensação menos nativa; plugins nativos limitados |
| **Só PWA** | Instalável (Android ótimo; iOS limitado, push só iOS 16.4+ instalado) | Sim | Instalável | Zero custo de lojas, hospedável até no GoDaddy shared | Sem presença nas lojas; restrições no iOS |

## 4. Backend / Admin
| Opção | O que entrega | Form builder | PDFs/fotos | Auth/papéis | LGPD | Custo | Hospedagem |
|---|---|---|---|---|---|---|---|
| **Supabase** (Postgres) | DB + Auth + Storage + REST automática + Edge Functions | JSONB (`fields`, `answers`) — trivial | Storage com buckets públicos/privados | Auth + **RLS** por papel | RLS, região `sa-east-1` (São Paulo) | Free (pausa após ~7 dias sem uso; 500 MB DB, 1 GB storage); Pro ~US$25/mês | Gerenciado (ou self-host em VPS) |
| **Firebase** | Firestore + Auth + Storage + Functions | Documentos JSON — trivial | Cloud Storage | Auth + Security Rules / custom claims | Região `southamerica-east1`; NoSQL dificulta relatórios/CSV | Spark grátis; Blaze pay-as-you-go | Google |
| **ASP.NET Core API** | Tudo sob medida | Precisa construir | Precisa construir | Identity — construir telas | Controle total | VPS ~R$40–100/mês | VPS (não roda em GoDaddy shared Linux) |
| **Headless CMS** (Directus / Strapi / Payload) | Painel admin pronto + REST/GraphQL | Directus: campo JSON/repeater; Payload: plugin form-builder | Biblioteca de mídia | Papéis granulares prontos | Self-host no Brasil possível | Self-host grátis + VPS ~US$6–12/mês | Node + Postgres → VPS/Railway/Render |
| **WordPress como backend** (site já existe) | REST API nativa, CPTs (Projetos, Editais), Media, ACF | Plugins (Forminator grátis; WPForms/Gravity pagos) | Media Library nativa | Papéis WP | Plugins LGPD; PII em tabelas WP exige cuidado; superfície de ataque grande | Já pago | **Roda no GoDaddy shared** |

## 5. Hospedagem: GoDaddy e alternativas
- **GoDaddy shared (cPanel/Linux):** PHP + MySQL + arquivos estáticos. Serve: WordPress e **build web estático** (Expo web export, Flutter web, PWA). **Não serve:** Node persistente, .NET, Postgres, websockets, processos longos.
- **GoDaddy VPS:** roda qualquer coisa (Docker, Node, .NET, Postgres), mas exige administração (patches, backups, TLS) — custo humano alto para ONG e preço acima de concorrentes.
- **Alternativas gratuitas / programas para ONG:**
  - Supabase Free/Pro; Firebase Spark.
  - Cloudflare Pages / Netlify para web estática — grátis.
  - Google for Nonprofits, Microsoft for Nonprofits, TechSoup Brasil (verificar elegibilidade).
  - Apple Developer Program: **isenção de taxa para ONGs** (solicitar); Google Play: US$25 taxa única.
- **Arquitetura sugerida:** manter `proame.org` (WordPress/GoDaddy) como site institucional ou redirecionar; publicar a web do app em `app.proame.org` (estático no GoDaddy ou Cloudflare Pages); dados no Supabase (São Paulo).

## 6. Matriz ponderada — combinações
| Combinação | C1 15 | C2 15 | C3 10 | C4 5 | C5 10 | C6 10 | C7 5 | C8 15 | C9 15 | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|
| **B. Expo (RN) + Supabase** | 5 | 4 | 5 | 5 | 5 | 5 | 4 | 5 | 4 | **93** |
| F. PWA + Supabase | 5 | 4 | 5 | 5 | 5 | 5 | 2 | 4 | 5 | **91** |
| A. Flutter + Supabase | 5 | 4 | 5 | 5 | 5 | 5 | 4 | 4 | 4 | **90** |
| C. Expo + Directus (VPS) | 3 | 5 | 4 | 5 | 5 | 5 | 4 | 3 | 4 | **82** |
| D. Flutter + Firebase | 5 | 3 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | **81** |
| E. Ionic/Capacitor + WordPress API | 5 | 4 | 3 | 5 | 3 | 2 | 4 | 4 | 4 | **76** |
| G. MAUI/Blazor + ASP.NET Core (VPS) | 2 | 3 | 2 | 3 | 4 | 5 | 3 | 2 | 2 | **55** |

## 7. Recomendação
**Expo (React Native + TypeScript, Expo Router) + Supabase (região São Paulo)**, com o **painel admin como área web do mesmo app** (rotas `/admin`, protegidas por papel) e a web pública exportada estaticamente para `app.proame.org` (Cloudflare Pages ou o próprio GoDaddy shared).

Justificativa:
1. **Um código para Android, iOS e Web**, com SEO aceitável via export estático — Flutter web perde em SEO.
2. **Maior pool de devs TS/React no Brasil** → manutenção por voluntários/freelancers mais fácil.
3. **Supabase** entrega Auth, Postgres, Storage (PDFs/fotos) e API REST automática; **RLS** garante que dados de beneficiários só saem para admins (regra LGPD inegociável).
4. **Form builder** = tabela `form_fields` + respostas em JSONB; renderização genérica no app (demonstrada no protótipo).
5. Custo: R$0 no início; ~US$25/mês no Pro em produção (sem pausa, com backups); Play US$25 única; Apple com isenção para ONG.
6. EAS Update permite correções sem nova revisão de loja.

**Segundo colocado:** **PWA + Supabase** (91) como MVP rápido se as lojas não forem prioridade — o código Expo web pode virar o PWA, então começar por ele não desperdiça trabalho. Terceiro: Flutter + Supabase, se a equipe preferir Dart.

**Desktop:** atendido pela web/PWA instalável, sem build dedicado.

## 8. Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Supabase Free pausa projetos inativos | Pro em produção; exportar backups |
| Vazamento de dados de beneficiários | RLS deny-by-default, bucket privado, sem PII em logs, 2FA para admins, log de auditoria |
| Dependência de fornecedor | Postgres padrão → exportável; self-host possível |
| Apple rejeitar app "só site" | Recursos nativos (notificações, inscrições, "minhas inscrições"); política de privacidade |
| Contas de loja em nome da ONG (CNPJ, D-U-N-S) | Iniciar D-U-N-S e isenção Apple cedo (leva semanas) |
| Duplicidade com o WordPress atual | Decidir se WP continua institucional ou se o app o substitui |
| Admin não técnico | Painel simples em pt-BR, validações e ajuda contextual |

## 9. Fontes
- proame.org: meta `generator` = WordPress 7.1.5 e Elementor 4.4.1 (verificado em 2026-11-25).
- Limites de free tier, taxas de loja e programas para ONG seguem a documentação pública conhecida; **reconfirmar valores na contratação**.
