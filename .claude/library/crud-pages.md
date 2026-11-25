# CRUD Page Design Laws

> This document defines the **laws and decision guidance** for building list/form page pairs in PROAME.
> It is NOT a copy-paste template. It tells you **what is non-negotiable**, **what varies**, and **how to decide**.
> Reference implementation: none yet — the first CRUD feature (`Docs/Management/BusinessFeatures/<feature>/`) becomes the reference and is linked here when shipped.

---

## The Three Laws (non-negotiable)

**1. MD3 compliance always.**
Every layout decision must be traceable to the Material Design 3 specification, implemented through MudBlazor components and the PROAME MudTheme tokens. No custom UI patterns that contradict MD3 — not for convenience, not for "it looks fine". If in doubt, check the spec first (`m3-*.md` files map each MD3 pattern to its MudBlazor component).

**2. Use existing shared components when the slot fits.**
The shared app bar, list (`CrudList`), empty state, list row, and selection toolbar components in `Proame.UI` are MD3-compliant. Use them. Only build a new component when no existing component covers the need.

**3. MudBlazor first. Custom second.**
Check MudBlazor (`MudDataGrid`, `MudDialog`, `MudAutocomplete`, `MudChipSet`, …) at the manifest version via the MudBlazor MCP before writing custom markup or CSS. A MudBlazor control that covers 90% of the need beats a custom component. Build custom only when MudBlazor has no equivalent. No second component library (CLAUDE.md Constitutional Constraints).

---

> **This file is an index** (split for token-scoped subagent reads). Read ONLY the section file(s) your task needs — never all of them. Inbound `§` references resolve via the table below.

| Section file | Covers |
|---|---|
| `crud-listview.md` | CrudList — the standard list shell — parameters and behaviour |
| `crud-migration-specfirst.md` | Page migration checklist + spec-first development — migration steps, spec-first for CRUD |
| `crud-appbar-list-toolbar.md` | App Bar, List Layout, Selection Toolbar — laws and variants — app bar variants, list layout, gestures, toolbar laws |
| `crud-form-page.md` | Form Page — laws and variants — form page laws |
| `crud-checklists.md` | Component + code-behind checklists (list page) — component checklist, code-behind checklist |
| `crud-supporting.md` | Confirm-delete dialog, skeleton, DI registration, empty state — delete confirmation, skeleton, DI, empty state |
