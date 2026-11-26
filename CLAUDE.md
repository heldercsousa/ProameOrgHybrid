# CLAUDE.md - PROAME

> Adapted from MyVocaList governance. Rationale and lookup tables: `.claude/library/project-governance-reference.md`. Rules in `.claude/rules/` load automatically: `code-principles` · `testing` · `bug-tracking` · `workflow`.

## App
Institutional + operational app for **PROAME** (NGO in Gama, Distrito Federal, Brasil — https://proame.org/). Public area: Home, Quem somos, O que realizamos (serviços), O que temos (projetos: cursos, esportes/dança etc., with photos, dates and a **dynamic signup form** for *beneficiários*), Como posso colaborar (collaborator offer form: Financeiro / Cesta básica / Mão de obra-Serviço / Formação + observação), Transparência (Editais PDFs, downloadable). Admin area: the NGO admin must be **autonomous** — edit pages, create projects and their form fields (label + type), review signups/offers, upload/publish Editais. An API stores public and private data. Hosting under consideration: GoDaddy.

Requirements source: `Docs/Chats/202611181100 initial business chat.txt`.

**Targets:** Android · iOS · Web (Desktop = nice-to-have only).
**Stack (decided by Helder 2026-11-25):** .NET 10 · **.NET MAUI Blazor Hybrid** + **Blazor Web App** sharing ONE Razor Class Library for all UI · **MudBlazor** (Material Design 3 theme seeded from the PROAME logo green `#A8CF45` — palette reference: `Docs/Benchmark/prototype/styles.css`) · **ASP.NET Core API** (services layer) · **PostgreSQL** via EF Core + Npgsql · Hosting: **Azure** (App Service, Azure Database for PostgreSQL Flexible Server, Blob Storage) under PROAME's own accounts · **Docker** for local dev (Postgres + Azurite via docker compose). WordPress (proame.org) will be replaced by this app. Exact versions always come from `.csproj` / `Directory.Packages.props`, never from this file.

**Solution layout:** `src/Proame.Domain` · `src/Proame.Contracts` (DTOs) · `src/Proame.Infrastructure` (EF Core, storage) · `src/Proame.Api` · `src/Proame.UI` (RCL — every page/component) · `src/Proame.App` (MAUI head: Android, iOS, Windows, macOS) · `src/Proame.Web` (web head: static SSR for public/SEO pages, interactive for admin) · `tests/*`. Heads stay thin — no UI or logic in them.

## MCP & Skills
- **Context7** when generating code against any library — use the exact manifest version, never "latest"; report version mismatches before coding.
- **Playwright MCP** for web UI verification (prototype and web build). GitHub → `gh` CLI.
- **MCP Availability Gate:** if a required MCP server is unavailable at task start, fail explicitly and wait for Helder — distinguish "returned empty" from "unavailable".
- **MCP governance:** `.claude/library/mcp-governance.md` — read before adding any MCP server. Env keys onboarding: `.env.local.example` + `. .\.claude\scripts\load-env.ps1`.
- **MudBlazor MCP** for every MudBlazor component API question (version = the package version in the manifest). **Microsoft Learn MCP** for .NET/MAUI/Blazor/Azure docs.
- Vendored .NET/MAUI skills in `.claude/skills/`: Blazor-Hybrid-relevant ones are on (`skillOverrides` in settings.json); XAML-only ones stay off. Project patterns: `proame-coding` skill.
- After brainstorming → fresh `spec-reviewer`; after writing-plans → fresh `plan-reviewer`; both before Helder's gate.

## Development Methodology
**Spec-Anchored SDD:** specs in `Docs/Management/` are authoritative; spec changes before code changes (bug fixes, cosmetic changes, one-off scripts exempt). Code contradicts spec → the code is wrong; spec incomplete → stop and ask Helder. A shipped spec is immutable — post-ship changes go in `changes/YYYY-MM-DD-<slug>/` beside it.
**Before any completion claim:** `superpowers:verification-before-completion`.

## Docs/ Folder Layout
```
Docs/Chats/        raw business conversations (requirements input)
Docs/Benchmark/    stack benchmark + prototypes
Docs/Management/[BusinessFeatures|cross-cutting|milestones]/[feature]/
  README.md · requirements.md · design.md · tasks.md · plan.md · task-log.md
```
Never glob-scan `Docs/` — read the active feature folder by explicit path.

## Commands
Project commands in `.claude/commands/` carry the `pro-` prefix (`/pro-commit`, `/pro-review`, `/pro-itf`).

## Constitutional Constraints
- **Business logic in the service/API layer** `[Unamendable]` — never in UI pages/components.
- **Language** — code, comments, logs: English. **User-facing UI text: Brazilian Portuguese (pt-BR).**
- **Privacy (LGPD)** `[Unamendable]` — beneficiary data (name, address, phone, CadÚnico) is personal data: private API only, admin-authenticated, consent captured at signup, never exposed in public endpoints or logs.
- **Admin autonomy** — any content the NGO changes routinely (pages, projects, form fields, editais) must be editable from the admin area, never hard-coded.
- **Single UI codebase** — pages and components live only in `Proame.UI` (RCL); MudBlazor components only (no second component library); colours only from the MudTheme tokens (no hard-coded hex in components); WCAG AA contrast (brand `#A8CF45` is a fill with dark ink, never text on light surfaces).
- **Dialogs** — `MudDialog` / `MudMessageBox` only; never native MAUI dialogs (`DisplayAlert` etc.) — hook-enforced.
- **Uploads** — Editais PDFs have an admin-configurable size cap; the stored file is byte-identical to the uploaded one (SHA-256 recorded); no lossy conversion.
- **Incremental edits** — UI: edit one file → build → fix → next.

## Amending These Rules
Changing `CLAUDE.md` or `.claude/rules/`: state what is wrong and why, note compatibility impact, commit with the `amend:` prefix (body: rationale, old rule, new rule, effective date). Deviations are logged in `.claude/exception-registry.md` first — never deviate silently.

## Roles
- **Helder** — Architect and Technical Auditor: defines approaches, reviews, makes trade-offs.
- **Claude Code** — Implementation Specialist: codes, debugs, documents; never makes architectural decisions unilaterally.
- **Orchestrator read-scope** `[HARD RULE]`: the main/orchestrator agent does not explore source code — delegate to Explore/Plan subagents. Details: `.claude/agents/orchestrator.md § Orchestrator Read-Scope`.
- **Subagent discipline:** one subagent at a time (coder, then reviewer); subagents default to `model: haiku`.
- **Token economy** (Helder, 2026-11-26): every practice that saves tokens is adopted. Tiny, already-diagnosed changes (ITF lane: 1 file, ≤ 5 lines) are done inline — never spawn a subagent for them. Subagents are for multi-file or non-trivial work. Keep briefs and reports short, and read files in targeted slices.
