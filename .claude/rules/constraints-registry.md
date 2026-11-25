# Constraint Registry — Routing Table

> Full detail for every constraint: `.claude/library/constraints-reference.md` (`##` sections: UI — MudBlazor/MD3 · MAUI Blazor Hybrid & Web Heads · EF Core/PostgreSQL · Visual Studio Solution · Design/Prototyping · How to add entries), loaded via the `proame-coding` skill map. The `##` headings below are cross-referenced by `§` anchor; the HARD RULE/HARD GATE lines stay inline.

Other areas: UI and theme (MudBlazor, MD3 tokens, no second component library) → `§ UI — MudBlazor / MD3`; MAUI Blazor Hybrid and Blazor Web heads (safe areas, single RCL, render modes) → `§ MAUI Blazor Hybrid & Web Heads`; Stitch/Figma evaluations → `§ Design / Prototyping Tools`; adding a newly discovered constraint → `§ How to add entries`.

## EF Core / PostgreSQL

Full detail (migration policy, Npgsql configuration, search via `citext`/`ILIKE`/`unaccent`/`pg_trgm`, Testcontainers fixtures): `library/constraints-reference.md § EF Core / PostgreSQL`. Never-miss:

- **No C#-side string normalization for search/deduplication — HARD RULE (all relational DBs):** never `ToLowerInvariant()`/`ToUpperInvariant()`/`RemoveDiacritics()` or `*Normalized` shadow columns for search/uniqueness/dedup. Use database-side comparison (`citext` columns or `EF.Functions.ILike(...)` with `unaccent` where accent-insensitivity is required) and let PostgreSQL use its indexes. Rationale in the library.
- **Schema changes go through EF Core migrations only** — never hand-edited SQL against a shared database. Migrations are sequential-only files (`workflow.md § Sequential-only file registry`).

## Visual Studio Solution (.sln)

- **Solution item registration — HARD GATE:** any file created, moved, or deleted in `Docs/` or `.claude/` **must** be reflected in `Proame.sln` in the same commit (checked in the subagent exit checklist; a PostToolUse hook auto-registers new `Docs/` files written via `Write`). In practice the gate applies to `Docs/` files — `.claude/library/*` and `.claude/rules/*` are NOT `.sln`-registered.
- Common case: add `RelativePath\file = RelativePath\file` to the matching Solution Folder's `ProjectSection(SolutionItems)`. **New-folder pattern, `NestedProjects` parent GUIDs, and the sequential GUID counter** are in `library/constraints-reference.md § Visual Studio Solution (.sln)` — the counter's **only** source of truth. Never restate its value; derive it from the `.sln` with the one-liner given there.
