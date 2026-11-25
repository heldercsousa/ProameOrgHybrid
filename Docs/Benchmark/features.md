# Mapa de Funcionalidades — Autonomia do Admin

## 1. Funcionalidades do admin
| Módulo | O admin consegue, sem desenvolvedor |
|---|---|
| **CMS institucional** | Editar Home (banner, chamada), Quem somos, contato (endereço, telefone, e-mail, redes), textos de Serviços; rascunho/publicar |
| **Serviços (O que realizamos)** | CRUD: título, descrição, ícone/foto, ordem, ativo |
| **Tipos de projeto** | Criar tipos livres (Curso, Esporte/dança, Palestra...) com nome e cor; cada tipo pode ter um **modelo de formulário** padrão |
| **Projetos (O que temos)** | CRUD: título, tipo, descrição, local, datas início/fim, vagas, fotos (galeria, capa), status (rascunho/publicado/encerrado), inscrições abertas sim/não |
| **Form builder** | Por projeto: adicionar/remover/reordenar campos; tipos: texto, texto longo, número, telefone, e-mail, data, hora, data/hora início-fim, seleção, múltipla escolha, checkbox, CPF/CadÚnico; rótulo, obrigatório, ajuda, opções; pré-visualização. Campos base fixos: Nome, Endereço, Telefone, Cad. Único |
| **Inscrições (beneficiários)** | Caixa de entrada por projeto; status (nova, confirmada, lista de espera, recusada, cancelada); busca/filtro; exportação **CSV**; notas internas |
| **Ofertas de colaboração** | Caixa de entrada: nome/empresa, perfil (empresa, professor, monitor, segurança), tipo (Financeiramente, Cesta básica, Mão de obra/Serviço, Formação), observação, contato; status (nova, em contato, concluída) |
| **Transparência / Editais** | Upload PDF, título, número, data de publicação, prazo; publicar/arquivar; download público |
| **Usuários e papéis** | Convidar usuários; papéis: **Administrador**, **Editor de conteúdo**, **Coordenador de projeto** (vê só inscrições dos seus projetos) |
| **LGPD** | Texto de consentimento editável e versionado; registro de consentimento por inscrição; prazo de retenção configurável; anonimizar/excluir a pedido do titular; log de acesso/exportação |
| **Notificações** | E-mail de confirmação ao beneficiário e alerta ao admin (Supabase + Resend/SMTP); ideia futura: WhatsApp (link `wa.me` no MVP, WhatsApp Business API depois); push no app |

## 2. Fases
**MVP (6–8 semanas)**: páginas institucionais editáveis, serviços, tipos+projetos com fotos/datas, form builder (tipos básicos), inscrição com consentimento, inbox de inscrições com status + CSV, formulário colaborar + inbox, editais upload/publicar/arquivar, 1 papel admin, e-mail ao admin. Web + Android.

**Fase 2**: iOS na App Store, papéis múltiplos, e-mail ao beneficiário, lista de espera/vagas automáticas, retenção automática, campos condicionais, push.

**Fase 3**: WhatsApp Business API, relatórios/indicadores para prestação de contas, check-in de presença (QR), área "minhas inscrições" com login do beneficiário, desktop/PWA instalável.

## 3. Modelo de dados (esboço)
```
page            (id, slug, title, body_rich, status, updated_at, updated_by)
site_setting    (key, value_json)                      -- contato, redes, banner
service         (id, title, description, icon, image_url, sort, active)
project_type    (id, name, color, default_form_json)
project         (id, type_id→project_type, title, slug, summary, description,
                 location, starts_at, ends_at, capacity, signup_open,
                 status[draft|published|closed], cover_url, created_at)
project_photo   (id, project_id, url, caption, sort)
form_field      (id, project_id, key, label, type, required, options_json,
                 help, sort, is_base)
beneficiary     (id, name, address, phone, cad_unico, created_at)      -- PII
signup          (id, project_id, beneficiary_id, answers_json, status,
                 consent_version, consent_at, notes, created_at)       -- PII
collab_offer    (id, name, organization, profile, contribution_type,
                 phone, email, observation, consent_at, status, created_at)
edital          (id, number, title, description, file_path, published_at,
                 deadline, status[draft|published|archived])
consent_text    (version, body, active_from)
app_user        (id→auth.users, name, role[admin|editor|coordinator])
project_coordinator (project_id, user_id)
audit_log       (id, user_id, action, entity, entity_id, at)
```

## 4. API (esboço — Supabase REST/RPC ou equivalente)
**Pública (anon, somente leitura + inserts controlados)**
| Método | Endpoint | Observação |
|---|---|---|
| GET | `/pages/:slug` | só `published` |
| GET | `/services` | ativos |
| GET | `/projects?type=&status=published` | lista |
| GET | `/projects/:slug` | detalhe + fotos + `form_fields` |
| POST | `/projects/:slug/signups` | valida contra `form_fields`; exige consentimento; resposta sem eco de PII |
| POST | `/collab-offers` | exige consentimento |
| GET | `/editais?status=published` | lista + URL pública do PDF |
| GET | `/settings/public` | contato, redes |

**Privada (JWT + papel; RLS)**
| Método | Endpoint | Papel |
|---|---|---|
| CRUD | `/admin/pages`, `/admin/services`, `/admin/project-types` | admin, editor |
| CRUD | `/admin/projects`, `/admin/projects/:id/photos`, `/admin/projects/:id/form-fields` (+ `PUT .../order`) | admin, editor |
| GET/PATCH | `/admin/signups?project=&status=` , `/admin/signups/:id` | admin, coordenador (seus projetos) |
| GET | `/admin/signups/export.csv?project=` | admin (gera audit_log) |
| GET/PATCH | `/admin/collab-offers` | admin |
| CRUD | `/admin/editais` (+ upload multipart) | admin, editor |
| CRUD | `/admin/users` | admin |
| DELETE | `/admin/beneficiaries/:id` (anonimizar) | admin |
