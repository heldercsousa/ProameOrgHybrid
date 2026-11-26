# PROAME — Decisions log (post-benchmark)

> Decided by Helder on 2026-11-25 unless marked *proposed*. Supersedes the stack recommendation in `benchmark.md` (Expo + Supabase).

## D1 — Stack
.NET 10 · MAUI Blazor Hybrid (Android, iOS, Windows, macOS) + Blazor Web App sharing **one Razor Class Library** (`Proame.UI`) · MudBlazor (MD3 theme) · ASP.NET Core API · PostgreSQL (EF Core + Npgsql).
**Why it holds against Expo / PWA / Flutter:** the team's .NET experience and the MyVocaList governance carry over directly, and the Desktop build comes for free. Business logic stays in a real service layer.
**Known costs:** iOS builds need a Mac or a macOS CI runner. SEO needs static SSR for the public pages. The web head and the API need a .NET host (GoDaddy Linux shared hosting cannot run them).

## D2 — Hosting: Azure (recommended), Docker for development
| Option | Pros | Cons |
|---|---|---|
| **Azure** ✅ | First-class .NET support (App Service, deployment slots, Entra ID). Managed PostgreSQL Flexible Server with backups. Blob Storage for PDFs and photos. Microsoft nonprofit program (Azure grant credits for eligible NGOs — confirm current amount and eligibility). GitHub Actions deployment. | Costs after the credits run out (PostgreSQL Flexible B1ms + App Service B1 ≈ tens of US$/month). The portal is complex. |
| AWS | Mature platform, RDS PostgreSQL, S3, nonprofit credits via TechSoup | .NET is second-class (Elastic Beanstalk/App Runner), more DIY for this team, IAM complexity |
| VPS (e.g. Hetzner/Hostinger) + Docker | Cheapest (≈ US$5–10/month), full control | The NGO/volunteer owns patching, backups, TLS and uptime. A single point of failure. |
**Docker:** docker compose (PostgreSQL + Azurite) gives every developer the same database and the same storage emulator in one command. Tests run against real Postgres via Testcontainers. Containerised deployment stays optional (App Service runs it natively).
All accounts are created under **PROAME's own accounts** (not personal).

## D3 — WordPress
proame.org (WordPress/Elementor) will be **replaced** by this app. Plan the domain cut-over and redirect the old URLs (301) at launch.

## D4 — Editais PDF storage
- **Size cap**, configurable by the admin (proposed default: 10 MB). An oversized file is rejected with a clear message.
- The stored file is **byte-identical** to the upload, and its SHA-256 is recorded.
- **Rejected:** zip-on-upload (PDF streams are already compressed, so zipping saves only ≈0–10%). Also rejected: converting to another format and back (it alters an official document and can break signatures or fonts).
- **Optional later:** an "Otimizar PDF" action that downsamples images server-side and creates a NEW version. The admin previews it and approves it as the official file.
- Cost reality: 200 editais × 2 MB ≈ 400 MB, which is cents per month on Blob Storage. Egress is the larger cost driver, so serve the files through a CDN when traffic grows.

## D5 — LGPD consent
- Login is **not legally required** for valid consent (LGPD Art. 8 requires consent that is free, informed and unambiguous, and that the controller can prove). Login is **adopted** for beneficiary signups because it links the consent to a person and enables the data-subject rights in Art. 18 (access, correction, deletion, portability).
- **Pattern:**
  - passwordless login (email code) plus Google and Apple sign-in (Apple requires Sign in with Apple when other social logins are offered)
  - an unticked consent checkbox next to a **versioned** privacy text
  - a consent log: user, timestamp, text version, purpose, channel/app version
  - **separate** consent for image use (project photos)
  - withdrawal as easy as giving consent
  - in-app "Exportar meus dados" and "Excluir conta"
- **Minors:** a guardian account enrols the dependent. Consent comes from the parent or guardian (Art. 14).
- The collaborator offer form may stay without login (consent checkbox and log only).
- Privacy contact channel published. Small-agent relief from appointing an *encarregado* (ANPD Resolution CD/ANPD 2/2022) still requires a contact channel.
- *Final texts to be validated by a lawyer.*

## D6 — Admin notifications
A per-admin preference: **Nenhuma / E-mail / Push / E-mail + Push**.
- Push (FCM/APNs) to the admin app: free.
- Email: free tier of a transactional provider (*proposed:* Azure Communication Services Email or Brevo).
- WhatsApp Business: paid per message, so it is out of the MVP.
- "Nenhuma" is valid because everything is always in the dashboard.

## D7 — Admin dashboard (new feature)
- Signups per project, with a status (pendente / aprovado / lista de espera / cancelado), filters and search
- Collaborator offers grouped by type (Financeiro / Cesta básica / Mão de obra-Serviço / Formação), with a status
- Counters: open projects, signups this month, pending offers, published editais
- CSV export of signups. Every export of personal data is written to an audit log (LGPD).

## D8 — Design
MudBlazor with an MD3 theme seeded from the logo green **#A8CF45**:
- Primary on light surfaces is tone 40 `#4C6707` (≈6.4:1 with white).
- The brand lime is used only as a fill with dark ink (`#141F00`, ≈11:1), and as the primary colour in dark mode.
- Light and dark schemes; WCAG AA.
Reference implementation: `prototype/styles.css`.
Google Stitch MCP: *optional*. It needs a Google Cloud login/API key from PROAME's account; it is not required for the MudBlazor build.

## D9 — Nullable reference types
Decided by Helder on 2026-11-26.
- Nullable **warnings are OFF**. Projects use `<Nullable>annotations</Nullable>`, set in `Directory.Build.props` when that file is created.
- The `?` annotation syntax is allowed and documents intent; the compiler emits no nullable warnings.
- No suppressions or `= string.Empty` initializers to hide nullable warnings. Recorded in `.claude/library/code-style-reference.md § Nullable Reference Types`.

## D10 — EF Core migrations applied at API start-up
Decided by Helder on 2026-11-26.
- Migrations run automatically at API start-up: `await db.Database.MigrateAsync()` in a scoped block in `src/Proame.Api/Program.cs`, before `app.Run()`.
- The MAUI and Web heads never run migrations.
- With more than one API instance, migrations must not run concurrently. Keep a single instance during deploy, or move migrations to a deploy step (a new decision).
- Recorded in `.claude/library/database-setup.md § Migrations`.

## D11 — MudTheme file location
Decided by Helder on 2026-11-26.
- The MudTheme is a single file: `src/Proame.UI/Theme/ProameTheme.cs`.
- It is sequential-only. ITF split classification: HARD, following the existing `workflow-rule-2.md § Sequential-only file registry` (which lists the MudTheme file as hard). (The earlier "soft" in the brief was the agent's guess, not Helder's; HARD is final.)
- Recorded in `rules/workflow.md`, `library/workflow-rule-2.md`, `library/theme-locale.md` and the Guard 3 constants.

## D12 — MyVocaList-only governance tools retired
Decided by Helder on 2026-11-26.
- Retired and deleted: `.claude/scripts/migration/` (including `check_dx.py` and its tests) and `.claude/scripts/sync-mcp-db.ps1`, along with their hooks.
- Recoverable from MyVocaList git history if ever needed.

## D13 — ITF lane C3 covers Razor sources
Decided by Helder on 2026-11-26.
- First version: ITF condition C3 blocks `.razor`, `.razor.cs` and `.razor.css` targets, as well as `.xaml` and `.xaml.cs` (commit 297b4f6).
- **Revised by Helder, 2026-11-26 (token economy):** tiny changes avoid subagents. `.razor`, `.razor.cs` and `.razor.css` files SHOULD qualify for ITF (1 file, ≤ 5 lines). `.xaml` stays excluded. CLAUDE.md § Roles has the token-economy rule.
- **Pending:** the hook (`constitutional-guard.py` Guard 3, its test and the `workflow-rule-2.md` C3 row) still blocks Razor. Loosening a safety hook needs Helder to apply or approve it outside auto mode. Until then, tiny Razor fixes still go through a subagent.
