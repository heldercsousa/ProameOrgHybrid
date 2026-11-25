# Component Change Governance — Reference

> Extracted from `.claude/rules/component-change-governance.md`. The rule file is a routing table; this file holds the full detail. Discovered via the `proame-coding` skill map or the rule's routing table.
> Language rule: English only — see `CLAUDE.md § Constitutional Constraints`.
> MD3 terminology rule: MD3 pattern names are used in docs; the implementing MudBlazor component is named in code — see `m3-components.md`.

Custom shared UI components in `Proame.UI` are consumed by many pages. A change to one ripples across every consumer. This file makes such changes a deliberate, tracked, reviewed act — never a side effect of a feature task.

---

## Scope — what is a "governed component"

Any reusable custom UI component consumed by 2+ pages/components. Current set (non-exhaustive — add new ones here as they are created; names are proposed until their first feature fixes them):

| Component (proposed name) | Location (typical) |
|---------------------------|--------------------|
| `PageAppBar` | `Proame.UI/Components/AppBars/` |
| `SearchField` | `Proame.UI/Components/AppBars/` |
| `CrudList` | `Proame.UI/Components/Lists/` |
| `EmptyState` | `Proame.UI/Components/States/` |
| `ListItemRow` | `Proame.UI/Components/Lists/` |
| `SelectionToolbar` | `Proame.UI/Components/Toolbars/` |
| `AutocompleteField` (wrapper over `MudAutocomplete`) | `Proame.UI/Components/Fields/` |
| `FilterChipGroup` (wrapper over `MudChipSet`) | `Proame.UI/Components/Chips/` |
| `ConfirmDialog` helpers (over `MudMessageBox`) | `Proame.UI/Components/Dialogs/` |

> Rule: A component is governed the moment a second consumer binds to it. When you create a component's second consumer, add the component to this table in the same commit.
> Rationale: the blast radius of a shared component is proportional to its consumer count — governance must begin before the count grows silently.

### Usage contracts — shared components built for reuse anywhere

**Count consumers transitively.** A component used by a single host component that 2+ pages consume is governed from creation. For example, a row-level menu inside `CrudList` used by 4 pages is governed from its second use. Creating it needs no four gates, because there is no prior version, but every later change does. Each shared component built for reuse records its usage contract here:

- **Parameters:** the public parameter list with types and defaults.
- **Events:** the `EventCallback` list and when each fires.
- **Slots:** the `RenderFragment` slots and what the host must supply.
- **Host contract:** what the host must not do (for example, not call the component's internal state).

---

## The Four Gates (in order, before any edit)

1. **Dedicated task** — the component change has its own task in the feature's `tasks.md`, with an explicit MD3 review against the official MD3 guidance, mapped to the MudBlazor component that implements it.
2. **Consumer map** — grep every usage of the component tag and parameter bindings across `Proame.UI` and both heads. Never from memory.
3. **Per-consumer risk assessment** — one line per consumer: what could break and the verification step (bUnit test, browser or device check).
4. **Helder approval** — recorded in the task-log before implementation begins.

A change to a governed component (markup, code-behind, parameters, default styles, public contract) is forbidden unless all four gates exist first.

## No bundling `[HARD RULE]`

A governed-component change is never bundled into a feature, bug or other task. It has its own task and its own task-log entry, containing the consumer map and the per-consumer risk table. An entry without them is invalid.

## Design rules for shared components

1. **Host-agnostic.** A shared component never references a specific host (a page type, a page state class). Hosts plug in through a small interface the component owns or through parameters and callbacks.
2. **Behaviour inside the component.** Behaviour that every consumer needs (focus management, keyboard handling, dismissal, debounce) lives in the component, not in each host.
3. **Plain models.** Item models consumed by pages live in `Proame.Contracts` or the UI models folder and depend only on BCL types; pages never depend on component internals.
4. **Theme tokens only.** No hard-coded colours or sizes (`theme-locale.md`).
5. **Accessible by default.** Accessible names, keyboard operation and focus order are part of the component's contract, not each page's job.

## Artifacts template (task-log entry for a governed change)

```
### Governed component change: <ComponentName>
- Gate 1 — task: <tasks.md ref>; MD3 review: <pattern + MudBlazor mapping>
- Gate 2 — consumers: <file:line list from grep>
- Gate 3 — risk table: | consumer | what could break | verification |
- Gate 4 — Helder approval: <date, reference>
```

---
