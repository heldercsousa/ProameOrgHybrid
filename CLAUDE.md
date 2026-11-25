# CLAUDE.md - PROAME

> Adapted from MyVocaList governance. Rationale and lookup tables: `.claude/library/project-governance-reference.md` (inherited; .NET-specific parts apply only if a .NET stack is chosen). Rules in `.claude/rules/` load automatically: `code-principles` · `testing` · `bug-tracking` · `workflow`.

## App
Institutional + operational app for **PROAME** (NGO in Gama, Distrito Federal, Brasil — https://proame.org/). Public area: Home, Quem somos, O que realizamos (serviços), O que temos (projetos: cursos, esportes/dança etc., with photos, dates and a **dynamic signup form** for *beneficiários*), Como posso colaborar (collaborator offer form: Financeiro / Cesta básica / Mão de obra-Serviço / Formação + observação), Transparência (Editais PDFs, downloadable). Admin area: the NGO admin must be **autonomous** — edit pages, create projects and their form fields (label + type), review signups/offers, upload/publish Editais. An API stores public and private data. Hosting under consideration: GoDaddy.

Requirements source: `Docs/Chats/202611181100 initial business chat.txt`.

**Targets:** Android · iOS · Web (Desktop = nice-to-have only).
**Stack:** TBD — decided by `Docs/Benchmark/benchmark.md` and Helder's approval. Exact versions always come from the project manifest (`package.json` / `pubspec.yaml` / `.csproj`), never from this file.

## MCP & Skills
- **Context7** when generating code against any library — use the exact manifest version, never "latest"; report version mismatches before coding.
- **Playwright MCP** for web UI verification (prototype and web build). GitHub → `gh` CLI.
- **MCP Availability Gate:** if a required MCP server is unavailable at task start, fail explicitly and wait for Helder — distinguish "returned empty" from "unavailable".
- **MCP governance:** `.claude/library/mcp-governance.md` — read before adding any MCP server. Env keys onboarding: `.env.local.example` + `. .\.claude\scripts\load-env.ps1`.
- Vendored .NET/MAUI skills in `.claude/skills/` are off by default; enable only if the chosen stack is .NET.
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
- **Incremental edits** — UI: edit one file → build → fix → next.

## Amending These Rules
Changing `CLAUDE.md` or `.claude/rules/`: state what is wrong and why, note compatibility impact, commit with the `amend:` prefix (body: rationale, old rule, new rule, effective date). Deviations are logged in `.claude/exception-registry.md` first — never deviate silently.

## Roles
- **Helder** — Architect and Technical Auditor: defines approaches, reviews, makes trade-offs.
- **Claude Code** — Implementation Specialist: codes, debugs, documents; never makes architectural decisions unilaterally.
- **Orchestrator read-scope** `[HARD RULE]`: the main/orchestrator agent does not explore source code — delegate to Explore/Plan subagents. Details: `.claude/agents/orchestrator.md § Orchestrator Read-Scope`.
- **Subagent discipline:** one subagent at a time (coder, then reviewer); subagents default to `model: haiku`.
