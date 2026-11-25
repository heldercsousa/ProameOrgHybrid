---
name: proame-coding
description: Use when implementing any PROAME feature — MudBlazor pages/components in Proame.UI, ASP.NET Core API services, EF Core + PostgreSQL, forms, dialogs, theme, auth, file uploads.
---

# PROAME Coding Reference

## Overview
Project-specific coding rules for PROAME: one Razor Class Library (`Proame.UI`) shared by the .NET MAUI Blazor Hybrid head (`Proame.App`) and the Blazor Web App head (`Proame.Web`), business logic in the ASP.NET Core API services layer (`Proame.Api`), EF Core + Npgsql on PostgreSQL (`Proame.Infrastructure`), DTOs in `Proame.Contracts`, entities in `Proame.Domain`. Read the relevant library files before implementing — they contain confirmed patterns and non-negotiable constraints.

## Rule Files — Read Before Coding

> **Token-scoped reads:** the large rule families (`crud-pages`, `m3-components`, `testing-reference`, `workflow-reference`) are split into section files. Read ONLY the section file(s) your task needs — the family index file lists them. Never read a whole family.

| Task | File |
|------|------|
| C# style, naming, async, DI lifetimes, service return tuples, exception handling, global usings, component code-behind | `.claude/library/code-style-reference.md` |
| **Any list, or any screen that loads data before use (form, picker, field search) — mandatory pattern** | `.claude/library/code-style-reference.md § Loading Pattern — Lists and Data Loads` |
| Any UI work — CRUD laws + index | `.claude/library/crud-pages.md` (index) → `crud-listview.md` · `crud-appbar-list-toolbar.md` · `crud-form-page.md` · `crud-checklists.md` · `crud-migration-specfirst.md` · `crud-supporting.md` |
| MudBlazor component APIs (MudDataGrid, MudDialog, MudForm, MudAutocomplete, MudChipSet, …) | MudBlazor MCP at the manifest version — before writing markup |
| EF Core entity config, migrations, PostgreSQL queries, indexes | `.claude/library/database-indexing.md` · `.claude/library/database-setup.md` |
| Dialogs, confirmations, validation, snackbars | `.claude/library/dialogs-validation.md` |
| Pickers, field searches, autocomplete-driven selection | `.claude/library/search-picker-pattern.md` · `.claude/library/ux-patterns.md § Autocomplete` |
| MD3 AppBar, Lists, selection toolbar, EmptyState, filter chips | `.claude/library/m3-components.md` (index + terminology) → `m3-appbars.md` · `m3-lists.md` · `m3-floating-toolbar.md` · `m3-emptystate-chips.md` |
| Colors, typography, MudTheme setup, pt-BR locale | `.claude/library/theme-locale.md` |
| Touch targets, selection UX, empty state positioning | `.claude/library/ux-patterns.md` |
| Changing a shared custom component (4-gate governance, consumer map, no-bundling) | `.claude/library/component-safety-gate.md` |
| Tracking a bug (BUG-NNN scheme, severity, regression-test requirement, task-log rules) | `.claude/library/bug-tracking-reference.md` |
| Discovered constraints (MudBlazor/UI, Blazor heads, EF Core/PostgreSQL, .sln registration) | `.claude/library/constraints-reference.md` |
| Writing tests — structure, service/endpoint/repository/component patterns, naming, Tester/Builder, anti-patterns | `.claude/library/testing-reference.md` (index) → `testing-structure.md` · `testing-test-types.md` · `testing-conventions.md` · `testing-tdd-roles.md` · `testing-quality-audit.md` (rule: `.claude/rules/testing.md`) |
| Mutation testing (Stryker.NET) / property-based testing | `.claude/library/mutation-testing-stryker.md` · `.claude/library/property-based-testing-fscheck.md` |
| Local environment, secrets, Android signing | `.claude/library/dev-env-setup.md` |
| Activating/adding/budgeting MCP servers (security stance, token budget, Playwright, response discipline) | `.claude/library/mcp-governance.md` |
| Governance narrative (SDD rationale, enhancement-loop procedure, Constitutional Audit, tool selection) | `.claude/library/project-governance-reference.md` |

## Non-Negotiables (always enforce, no exceptions)

- **Single UI codebase:** pages and components live only in `Proame.UI`. The heads (`Proame.App`, `Proame.Web`) contain host setup and DI wiring only.
- **MudBlazor only:** no second component library. Use MudBlazor components and MudTheme tokens; no hard-coded hex colours in components.
- **No native dialogs:** never `DisplayAlert`, `DisplayActionSheet`, `DisplayPromptAsync`, `window.alert`, `window.confirm`. Use `MudDialog` or `MudMessageBox`.
- **Business logic in the API services layer:** never in components or pages.
- **MD3 terminology:** component names, style and parameter names follow the official MD3 patterns (m3.material.io) as mapped in the `m3-*.md` files. No invented names.
- **Admin autonomy:** content the NGO changes routinely (pages, projects, form fields, editais) is editable from the admin area, never hard-coded.
- **LGPD:** beneficiary data is private API only, admin-authenticated, never in public endpoints or logs.
- **Language:** code, comments, logs and identifiers in English. **User-facing UI text in Brazilian Portuguese (pt-BR).**
- **Incremental UI edits:** edit ONE `.razor` / `.razor.cs` file → build → fix errors → then next file. Never batch UI changes.
- **Safe areas (Hybrid head):** content respects `env(safe-area-inset-*)` through the shared layout CSS.

## Uploads (Editais)

Source: `CLAUDE.md § Constitutional Constraints` (Uploads). Applies to every file the admin uploads, starting with Editais PDFs.

- The size cap is admin-configurable and enforced in the API service layer, never only in the UI. An upload over the cap is rejected with a pt-BR message.
- The stored file is byte-identical to the uploaded file. Record its SHA-256 at upload time.
- No lossy conversion, recompression or ZIP packaging of the stored file.

## LGPD

Source: `CLAUDE.md § Constitutional Constraints` (Privacy, LGPD, `[Unamendable]`).

- Beneficiary data (name, address, phone, CadÚnico) is served only from the private API, behind admin authentication. Never in a public endpoint, never in logs.
- Consent is captured at signup and logged with the policy version and a timestamp.
- Every export of beneficiary data is audited.
