
# Project Governance — Reference

> Extracted verbatim from `CLAUDE.md` (2026-07-07, rules-file-refactoring Task 16 / audit R5). CLAUDE.md keeps the constitutional constraints, authority hierarchies, and routing inline; this file holds the rationale/procedure narrative. Consult it when questioning why SDD applies, running the enhancement loop or a Constitutional Audit, or re-evaluating tooling.

---

## SDD Applicability for PROAME

PROAME is past the 10–20 interdependent file threshold where SDD becomes strictly beneficial:
- Multiple layers (Domain, Infrastructure, API services, the shared UI RCL, both heads) interact on every feature
- Features span multiple sessions and require context persistence across resets
- Queue management logic has business rule complexity where hallucination cost is high

This means:
- Spec-first is not optional overhead — it is the mechanism that prevents compounding technical debt
- Vibe coding on new features increases total delivery time beyond 3 months due to rework
- The ROI on specs for PROAME is currently positive; skipping specs costs more than writing them

Exception: Bug fixes, cosmetic changes, and one-off scripts remain spec-exempt (see `workflow.md` bypass rule).

## Enhancement loop — full procedure

CLAUDE.md, rules, hooks and commands are a living system — not a fixed set.
After every task, always ask:
> "What was learned that should improve CLAUDE.md, any rules file, or any command file?"

- **Add** new files for any area not yet covered
- **Update** existing files with confirmed patterns
- **Replace** outdated patterns with working ones
- **Delete** guidelines that proved wrong or are superseded by skills
- **Update** CLAUDE.md when architecture, stack, or fundamental decisions change only when no specialized and dedicated file is in place in solution's .claude folder. Otherwise such specialized file must be the one to be updated.

Any area where Claude Code repeatedly makes mistakes or needs repeated guidance is a candidate for a new rule, command, or CLAUDE.md update.

> **Note:** Changes to CLAUDE.md or `.claude/rules/*.md` must follow the Amending These Rules process (`CLAUDE.md § Amending These Rules`) — including `amend:` commit prefix and changelog entry.

**Quarterly Constitutional Audit:** At significant project milestones (phase completion, feature launch), review `CLAUDE.md` and all `.claude/rules/` files for:
- Rules with no rationale — add rationale or remove the rule
- Redundant rules — remove if the type system or DI container now enforces them
- Contradictions — two rules that conflict in an edge case
- Exception accumulation — rules with 2+ `unless X` qualifiers (the rule may be wrong)
- Rules where violation rate is rising (a sign the rule is fighting reality)

**Context size governance:** CLAUDE.md must stay under 600 lines (target <200). When it approaches a limit:
- Move stable, detailed patterns to `.claude/library/` or `.claude/rules/` files
- Replace inline examples with "See `.claude/rules/X.md`" references
- Keep only routing tables, non-negotiables, and architectural constraints inline
Do not add rules that a linter or type-checker already enforces.

## Methodology Layering — rationale

**(1) DDD** defines what to build — bounded contexts, aggregate boundaries, ubiquitous language. Applied conceptually at spec time (the `ddd-dotnet` plugin is disabled — tactical DDD patterns like rich aggregates conflict with the unamendable "business logic in Services" constraint).
**(2) SDD** defines how it works — spec (`requirements.md` + `design.md` + `tasks.md`) within the DDD boundaries.
**(3) TDD** verifies it is correct — Red/Green/Refactor within each SDD task.
These layers are sequential, not interchangeable. Do not apply TDD before the SDD spec exists; do not write an SDD spec without first confirming DDD boundaries.

## Scope of inspection for complex tasks

Before proposing anything that touches UI, styles, or components, inspect ALL of: every page, every custom component, every relevant rules file, AND verify what the platform/libraries already provide. Never limit the audit to the files initially mentioned. Cross-file pattern counts (how many times the same inline style appears) must be established before proposing centralization.

## Docs/ layout — examples and detail

**Example resolutions:**
- New business feature `Project Signups` → `Docs/Management/BusinessFeatures/project-signups/`
- New dev-cycle activity → `Docs/Management/cross-cutting/[name]/`
- Sub-feature nested under Projects → `Docs/Management/BusinessFeatures/projects/[sub-feature]/`

**Excluded from glob scans (access by explicit path only; `.claudeignore`-enforced):**
- `Docs/Plans/**` — legacy plans folder

## Tool Selection

**Primary AI assistant:** Claude Code (Anthropic CLI)
**Decision rationale:** Spec-first discipline (CLAUDE.md + rules files), subagent delegation support, 1M-token context window, terminal-native workflow, MCP client built-in.
**Lock-in accepted:** Spec format and rules files are Claude Code-specific; migrating to Cursor or Copilot would require translating CLAUDE.md to `.cursorrules` or `copilot-instructions.md`.
**Re-evaluation trigger:** If Anthropic discontinues Claude Code, pricing exceeds $200/month, or a competing tool delivers >2x productivity improvement on SDD tasks.

**Tooling Evaluation & Migration:** for guidance on evaluating Tessl Registry, sdd-mcp, Spec Kit migration, or Cursor integration, read `Docs/Design/tooling-evaluations.md` by explicit path (the folder is glob-ignored).

---

> **Authorship note:** This file must be human-reviewed before it is relied upon (see `library/authorship-log.md`).

## Constitutional constraints — rationale *(moved from CLAUDE.md 2026-11-03)*

| Constraint | Reason |
|------------|--------|
| Business logic in Services | Layer discipline prevents business rules from scattering across the UI and becoming untestable. |
| Language — English only | Multilingual identifiers make search, grep, and onboarding unreliable. |
| Native dialogs banned | `DisplayAlert`/`DisplayActionSheet`/`DisplayPromptAsync` bypass the app's theme, violate MD3 interaction patterns, and on Android are not dismissible via back gesture. |
| UI component library: MudBlazor only | One component library keeps the Blazor Hybrid and Blazor Web heads visually consistent and avoids theming conflicts between libraries. MD3 theme via MudTheme. |
| MD3 terminology | Invented names require mental translation and break cross-reference with m3.material.io. |
| Safe areas in the Hybrid head via CSS `env(safe-area-inset-*)` | Without it, content renders behind the status bar, notch or home indicator on Android and iOS. Covered by the `maui-safe-area` vendored skill. |
| Incremental edits (one `.razor` / `.razor.cs` file at a time) | Build errors cascade — batching edits hides which change introduced the error. |

**Constitutional role.** A spec is checked against CLAUDE.md before it is written: architecture
constraints, naming, DI lifetimes and error-handling idioms (all in `code-principles.md`), and UI
component priority. A spec that conflicts with them is invalid however correct it looks in isolation —
resolve with Helder first.

## MCP & skill routing — detail *(moved from CLAUDE.md 2026-11-03)*

- **Context7** — for *generating code* against .NET, MAUI, Blazor, MudBlazor, EF Core, Npgsql or ASP.NET Core APIs,
  not for architectural discussion. `resolve-library-id` → `query-docs` for the specific class/method. Always
  pass the exact manifest version (`Directory.Packages.props` / `.csproj`), never "latest"; report
  any version mismatch to Helder before generating code.
- **MudBlazor MCP (`mudblazor`)** — component API and examples at the manifest version. Required for every
  MudBlazor component question before hand-writing markup.
- **Microsoft Learn MCP (`microsoft-learn`)** — .NET, MAUI, Blazor, ASP.NET Core and Azure platform docs.
- Database: no database MCP is approved; see `mcp-governance.md`.
- **GitHub MCP** — disabled 2026-07-07 (unused); use `gh`. Re-enabling needs the Security Stance review.
- **Disabled tooling** — other `maui-*` skills and the `ddd-dotnet`/`bdd-dotnet`/`data-dotnet` plugins.
  `dotnet-skills` plugin disabled 2026-11-03 (plugin skills ignore `skillOverrides`); its four used skills
  are vendored into `.claude/skills/` (`VENDORED.md`). Unused built-in / claude.ai skills: `skillOverrides`
  in `settings.json`. `csharp-nullable-reference-types` is deliberately excluded — its adoption waits for the open nullable decision
  (`code-style-reference.md § Nullable Reference Types`).

**Per-layer lookup table** (the "MCP & Skills" step):

| Work | Look up |
|------|---------|
| All UI / coding | `proame-coding` skill — maps to `crud-pages.md`, `dialogs-validation.md`, `m3-components.md`, `theme-locale.md`, `ux-patterns.md`, `database-indexing.md`; MudBlazor MCP for component APIs |
| Domain / Contracts / Infrastructure | `code-style-reference.md`; Context7 for EF Core and Npgsql |
| Tests | `testing.md` + `testing-structure.md` (risk-tiered TDD; the generic TDD skill is disabled); Context7 for xUnit, Moq, bUnit, Testcontainers |
| Services with HTTP | Context7 |
| DI | `code-style-reference.md § DI Registration Conventions`; `dependency-injection-patterns` |
| C# style beyond the reference | `modern-csharp-coding-standards` |
| EF Core beyond `database-indexing.md` | `efcore-patterns`; PostgreSQL tuning `database-performance` |
| Razor / MudBlazor UI | `proame-coding`; MudBlazor MCP; `maui-current-apis` for Hybrid head API currency |
| Hybrid head (safe areas, lifecycle, secure storage) | `maui-safe-area`, `maui-app-lifecycle`, `maui-secure-storage`, `maui-authentication` (enabled Blazor Hybrid skills only) |

## Methodology authority — skill-conflict detail *(moved from CLAUDE.md 2026-11-03)*

User-preference overrides apply to superpowers skill *defaults* (folder locations), never to skill
*disciplines* (red/green/refactor). Two enabled skills conflict with project rules, and the project wins:

- `brainstorming`'s HARD-GATE ("design approval before ANY code, including a config change") does not
  override `workflow.md`'s ceremony table — typo / cosmetic / single-file bug fix need no spec.
- `test-driven-development`'s Iron Law is deliberately not enabled and does not override `testing.md`'s
  risk-tiered TDD (Level C has no mandatory test). See `.claude/settings.json § skillOverrides`.

**Rule layering.** Lower layers only strengthen upper ones: Global `~/.claude/CLAUDE.md` → Project
`./CLAUDE.md` → Modular `.claude/rules/*.md` → Local `.claude/CLAUDE.local.md` (gitignored, testing only).

**Command naming.** The `pro-` prefix marks a command as this solution's workflow, avoids collisions with
built-in and plugin skills (project `review` vs built-in `/review`), and survives copying these settings
to bootstrap another solution. `/pro-review` reviews this solution's task output; the built-in `/review`
reviews GitHub PRs.

## Stack notes (not needed in every session)

Moved here from `CLAUDE.md § App` on 2026-11-15.

- **Planned, not registered:** MediatR · FluentValidation.
- **Stack decision:** `Docs/Benchmark/benchmark.md` (MAUI Blazor Hybrid + Blazor Web App, shared RCL `Proame.UI`, MudBlazor, PostgreSQL).
