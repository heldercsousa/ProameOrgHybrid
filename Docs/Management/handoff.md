# Session Handoff — PROAME — 2026-11-27

## Gate (read first)
**No feature coding until the stakeholder fully approves the prototype** (Helder, 2026-11-26). Until then: prototype changes only, plus the prototype-independent foundation items below if Helder asks for them.

## Current state
- `develop` = `main` (pushed). Build: PASS (0 errors). Tests: 2 passing (UI bUnit "Início", API `/health`).
- Done: `solution-scaffold` (.NET 10 MAUI Blazor Hybrid + Web + API + PostgreSQL; verifier PASS; archived in `backlog-archive/BACKLOG-ARCHIVE-2026-11.md`).
- Prototype: `Docs/Benchmark/prototype/`, published at https://heldercsousa.github.io/ProameOrgHybrid/ by `.github/workflows/prototype-pages.yml` (deploys from `develop`; the github-pages environment allows only `develop`).
- Tooling: `backlog_gen.py register --kind feature --section <BusinessFeatures|cross-cutting> --title --goal [--gate] [--target]` appends backlog items.

## Next
1. Apply stakeholder feedback to the prototype (Helder pastes it).
2. After approval: spec the gated items (`content-domain-model`, `ui-shell-components`, `app-branding`) and the business features.
3. Prototype-independent, can be specced any time: `api-foundation`, `integration-test-foundation` (first two), then `web-interactive-render`, `logging-observability`, `file-storage-foundation`, `ci-build-test`.

## Open items / pending decisions
- `admin-auth`: decided 2026-11-27 (Identity, Root/Admin, TOTP 2FA) — see its README; ready to spec.
- `lgpd-consent-foundation`: stakeholder decides; prepare an options sheet.
- `notifications-foundation`: preferences decided; free-tier e-mail and push providers still open.
- `azure-environment`: only near first deploy (local Docker until then); homolog + production via `ci-cd-deploy-homolog-production`.
- Scaffold follow-ups (in its task-log): live migrate-at-start against compose PostgreSQL; App on an Android emulator; MudBlazor needs interactive render mode before the first admin page.
- Post-MVP items: `Docs/Management/BACKLOG-POST-MVP.md` (`backlog_gen.py query --horizon post-mvp`).

## Context manifest for the next session
`CLAUDE.md` · `Docs/Benchmark/decisions.md` · `Docs/Management/BACKLOG.md` · this file
