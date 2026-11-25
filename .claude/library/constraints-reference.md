# Constraint Registry — Reference

> Extracted from `.claude/rules/constraints-registry.md`. The rule file is a routing table; this file holds the full detail. Discovered via the `proame-coding` skill map or the rule's routing table.
> Discovered during implementation. Supersedes documented best practices where listed. Review before implementing features in the indicated area.

---

## UI — MudBlazor / MD3

- **Single component library:** MudBlazor is the only UI component library. No second library, no hand-rolled replacements for components MudBlazor already provides (`MudDataGrid`, `MudTable`, `MudDialog`, `MudMessageBox`, `MudForm`, `MudAutocomplete`, `MudChip`, `MudAppBar`, `MudNavMenu`, `MudSkeleton`). Component API questions go to the MudBlazor MCP at the manifest version. (CLAUDE.md Constitutional Constraints)
- **Colours only from MudTheme tokens:** no hard-coded hex in `.razor`, `.razor.cs` or component CSS. Palette seeded from `#A8CF45` and mapped in the MudTheme definition in `Proame.UI`; reference tokens: `Docs/Benchmark/prototype/styles.css`. (CLAUDE.md)
- **Brand green is a fill, never text:** `#A8CF45` on light surfaces fails WCAG AA for text; use dark ink on it. Verify contrast for every new colour pairing.
- **Dialogs are MudBlazor only:** `MudDialog` / `MudMessageBox`. Native dialogs (`DisplayAlert`, JS `alert`/`confirm`) are forbidden — hook-enforced where the hook applies. (CLAUDE.md)
- **Incremental edits:** edit one `.razor` / `.razor.cs` file → build → fix → next. Batched markup edits make the error source ambiguous.

## MAUI Blazor Hybrid & Web Heads

- **One RCL for all UI:** every page and component lives in `Proame.UI`. The heads (`Proame.App`, `Proame.Web`) contain only host setup, DI wiring and platform glue. (CLAUDE.md Solution layout)
- **Safe areas in the Hybrid head:** the `BlazorWebView` content must respect system bars and the notch. Use CSS `env(safe-area-inset-*)` in the shared layout CSS; the `maui-safe-area` vendored skill covers Blazor Hybrid specifics. Verify on Android and iOS, not only on the desktop window.
- **Render modes (Web head):** public and SEO pages use static SSR; admin pages use interactive render modes. Do not make a public page interactive without a recorded reason (it changes SEO and first-paint behaviour).
- **Authentication state reaches components via `CascadingParameter`** (or an auth-state provider in `Proame.UI`), never by reading tokens directly inside pages.
- **Navigation is behind an interface** (`INavigator`-style wrapper in `Proame.UI`) so that component tests can fake it; direct `NavigationManager` calls are limited to the wrapper.

## EF Core / PostgreSQL

- **Provider:** PostgreSQL via EF Core + Npgsql only. No EF Core InMemory provider in any test (see `rules/testing.md`).
- **String search and uniqueness are database-side:** case- and accent-insensitive matching uses `citext` columns or `EF.Functions.ILike(...)` (with the `unaccent` extension where accent-insensitivity is required); trigram indexes (`pg_trgm`) for substring search when measured as necessary. Extension and index choices are recorded in the feature's design.
- **No C#-side string normalization for search/deduplication:** never `ToLowerInvariant()`, `ToUpperInvariant()`, `RemoveDiacritics()`, or `*Normalized` shadow columns for search, duplicate detection or uniqueness. Reasons: (1) correctness — lower-casing does not strip accents ("café" ≠ "cafe"), so accent-insensitive matching silently fails; (2) performance — a C#-computed value cannot use a database index, forcing a scan. Configure the column collation or the database-side comparison in the entity configuration and let the engine normalize at query time.
- **Migrations are the only schema change path:** EF Core migrations in `Proame.Infrastructure`, sequential-only (`rules/workflow.md § Sequential-only file registry`). Never edit an applied migration; add a new one.
- **Repository tests run against a real PostgreSQL container** (Testcontainers). Reason: `ILIKE`, `citext`, `unaccent` and transaction behaviour do not exist in an in-memory fake.

## Visual Studio Solution (.sln)

- **Solution item registration — HARD GATE:** Any file created, moved, or deleted in `Docs/` or `.claude/` **must** be reflected in `Proame.sln` in the same commit. Missing entries make files invisible in VS Solution Explorer. This is not optional and is checked in the subagent exit checklist.

  **Logical folder = physical folder (Helder ruling 2026-11-15):** a `Docs\` file is listed under the Solution Folder chain that mirrors its directory (`Docs > Management > <section> > <feature> > changes > <slug>`). `.claude/scripts/sln_nest.py` holds the placement logic: `backlog_gen.py register` and the `PostToolUse` `Write` hook (`sln-register-doc.py`) call it, and `python .claude/scripts/sln_nest.py [--dry-run]` repairs every misplaced entry (it creates missing folders with path-derived GUIDs). Prefer the script to hand edits.

  **When to act:**
  - **Create** a file → add `RelativePath\file = RelativePath\file` to the matching Solution Folder's `ProjectSection(SolutionItems)`. If no folder exists for the feature yet, create one with a new GUID.
  - **Move** a file → remove the old path entry, add the new path entry.
  - **Delete** a file → remove its entry from the `.sln`.

  **New Solution Folder pattern** (copy when adding a folder for a new feature):
  \\\${nl}  Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "feature-name", "feature-name", "{NEW-GUID}"
  	ProjectSection(SolutionItems) = preProject
  		Docs\Management\[Path]\file.md = Docs\Management\[Path]\file.md
  	EndProjectSection
  EndProject
  \\\${nl}  Then add a `NestedProjects` entry in `GlobalSection(NestedProjects)`:
  - Under `BusinessFeatures` → parent `{8AB01C9F-E0FD-49D5-AE2C-E27AD8C8F05D}`
  - Under `DevCycleCraft` → parent `{0C4BA720-519E-4818-BD9B-34AC19E4FCD7}`
  - Under `Management` root → parent `{15F1DA03-2180-47BF-BC40-1BB457C97F9E}`

  **GUIDs — the counter's single source of truth is the `.sln` itself (do not restate a value):**
  The final GUID segment is **exactly 12 hex characters**: ten zeros followed by a two-hex-digit counter, e.g. `{FA1234BC-0001-4000-8000-0000000000XX}`.

  > **Never hand-count.** Derive the next value from the `.sln`:
  > `python -c "import re;print(max(re.findall(r'FA1234BC-0001-4000-8000-0000000000(..)',open('Proame.sln',encoding='utf-8-sig').read())))"`

  `backlog_gen.py register` allocates GUIDs itself — this counter is documentation for **hand-made** folders only.

  **Trap (caused three malformed GUIDs):** appending the counter to a full twelve-zero block yields a **14-character** final segment and an invalid GUID. Replace the last two zeros; do not append.

  **Note:** `.claude/library/*` and `.claude/rules/*` files are NOT `.sln`-registered in practice (the HARD GATE is applied to `Docs/` files).

---

## Design / Prototyping Tools

- **Stitch MCP — generates CSS/HTML/Tailwind, NOT MudBlazor:** Stitch converts designs to pure CSS + HTML or Tailwind — no MudBlazor integration. Do NOT use Stitch to generate MudBlazor components. Stitch's only value is design-token export (palette, typography) → manual mapping to `MudTheme`. Evaluated 2026-06-02.
- **Figma MCP — no MudBlazor Code Connect; paid plan required:** Figma MCP needs a paid plan for useful call volume and has no MudBlazor Code Connect plugin. Not suitable for MudBlazor code generation from designs. Evaluated 2026-06-02.
- **Clickable prototype is the visual reference:** `Docs/Benchmark/prototype/` (MD3 styles in `styles.css`). Implementation matches the prototype's tokens, not a generated design export.

---

## How to add entries

When a session discovers a new constraint — a MudBlazor behaviour, an EF Core or Npgsql limit, a Blazor Hybrid platform quirk, a PostgreSQL performance requirement — add an entry here before ending the session:

1. Place it under the appropriate section header (create one if needed).
2. One bullet per constraint. Include the symptom, the rule, and a reference file in parentheses if one exists.
3. Commit the update as part of the task commit (Rule 3).

Signs a constraint was discovered: "I found that…", "turns out…", "this fails because…", "we need to avoid…" appearing before a build fix.
