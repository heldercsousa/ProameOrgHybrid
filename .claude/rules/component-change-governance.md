# Component Change Governance — Routing Table

> Full detail (governed-component list, four-gate specifics, artifacts template, no-bundling rationale): `.claude/library/component-safety-gate.md`. The non-negotiables below stay inline (`[HARD RULE]`).

A change to any **governed component** (a custom UI component in `Proame.UI` consumed by 2+ pages/components — e.g. `AppBarBase`-derived bars, `EmptyState`, `ListItemRow`, `AutocompleteField`, `CrudListBase`, `FloatingToolbar`) ripples across every consumer. Such a change is a deliberate, tracked, reviewed act — never a side effect of a feature task.

## The Rule `[HARD RULE]` — all four gates required, in order, before any edit

1. **Dedicated task** for the component change + explicit MD3 review against m3.material.io, mapped to the MudBlazor component that implements it.
2. **Consumer map** — grep every component tag usage (e.g. `<AppBar` or the shared list component tag) and every `@page`/parameter binding (never from memory).
3. **Per-consumer risk assessment** — one line per consumer: what could break + verification step.
4. **Helder approval** recorded before implementation begins.

## No bundling `[HARD RULE]`

A governed-component change may NEVER be bundled into a feature/bug/other task. Its own task, its own task-log entry (with consumer map + per-consumer risk table, or the entry is invalid).

## Scope trigger

A component becomes governed **the moment a second consumer binds to it** — add it to the list in `component-safety-gate.md` in the same commit. A brand-new component with no consumers is NOT governed.
