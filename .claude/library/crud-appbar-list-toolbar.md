# CRUD Page Design Laws — App Bar, List Layout, Selection Toolbar — laws and variants

> Section file split from `crud-pages.md` (token-scoped reads). Index + never-miss rules: `crud-pages.md`.
> Component names below are MudBlazor (`MudAppBar`, `MudDataGrid`, `MudFab`, `MudPaper`). Material 3 intent is mapped to the MudBlazor component that implements it in `m3-appbars.md`, `m3-lists.md` and `m3-floating-toolbar.md`.

## App Bar — Laws and Variants

### Law
Every list page sits under the single application top bar (`MudAppBar` in the shared layout of `Proame.UI`). The page adds **one** title and at most three trailing actions to it; search is a persistent `MudTextField` docked above the grid inside `CrudList` — always visible, never a bar-swap or a search mode toggle.

### Standard configuration
- Page title: set through the layout's title state (`PageTitle` / shared title service) so the app bar and the browser/document title agree.
- Search: rendered by `CrudList` (`SearchPlaceholder` parameter), debounced, pt-BR placeholder.
- Trailing actions: `MudIconButton` in the app bar only for page-wide actions (for example filter or export); row and selection actions live in the grid and the selection bar.

### Variants — allowed adaptations

| Scenario | Adaptation |
|----------|-----------|
| Additional trailing actions (e.g. filter, sort) | Add up to three `MudIconButton`s with `aria-label` in pt-BR |
| No search on this page | Omit the search field from `CrudList` (`SearchPlaceholder` unset) |
| Complex filter (not simple text search) | Filter icon opens a `MudDialog` or a side panel (`MudDrawer`); **do not** embed a filter form in the app bar |
| Selection count in title | Title shows the entity name when 0 rows are selected and "N selecionados" when N ≥ 1, bound to the selection state |
| Root page (no back button) | No back icon in the app bar |
| Secondary page (has back) | Back `MudIconButton` (`ArrowBack`) calling the navigation wrapper |

### Never
- Do not build a custom title bar in the page as a replacement for `MudAppBar`.
- Do not add a second search bar or a search-mode toggle to a CRUD list page. Search is the persistent field inside `CrudList`.

---

## List Layout — Laws and Variants

> **Note:** Writing a `MudDataGrid` (or `MudTable`) directly in page markup, with its own skeleton, empty state and selection logic, is the old pattern. Use `CrudList` (`crud-listview.md`); pass entity-specific columns or row templates.

### Law
All list rows are rendered by the grid component (`MudDataGrid` for tables, `MudList` / `MudListItem` for card-style lists on narrow screens). No hand-built card layouts per page. Row layout is the same on Android, iOS and Web heads — responsive behaviour is a `Proame.UI` concern, not a head concern.

### Standard configuration
- `Dense` and `Hover` on desktop; touch target at least 48 px on touch heads.
- Row actions in a trailing `MudIconButton` column (edit) with `aria-label` in pt-BR.
- Empty and loading states supplied by `CrudList` (`crud-listview.md`).

### Variants — allowed adaptations

| Slot | Options | Notes |
|------|---------|-------|
| Leading content | `MudAvatar` / `MudIcon` / omitted | Pick the M3 preset that matches the entity type |
| Headline | Any string binding | Required — always populated |
| Supporting text | Optional second line (`MudText` `Typo.body2`) | Use when a second line of info helps the user |
| Overline | Optional label above headline (`Typo.overline`) | Reserved for category/type labels |
| Trailing content | Status `MudChip`, metadata text, or an independent action button | Multi-action: each action is its own `MudIconButton` |
| Selection | Owned by `CrudList` (see Gestures below) | Pages add no selection logic |

### Gestures — selection law

Selection is driven by an explicit **checkbox column** (`MudDataGrid` `MultiSelection`), not by long-press. Reason: long-press is not reliably available across Blazor Hybrid and web input, and a visible checkbox is the accessible pattern.

| Mode | Row click | Checkbox | Row action (edit icon) |
|---|---|---|---|
| Browse (0 selected) | Opens the row's detail or edit page if the page sets `OnRowClick`; otherwise no effect | Selects the row → selection mode | Opens edit |
| Selection (≥1 selected) | Toggles the row | Toggles the row | Opens edit |

- Selection mode is a `CrudList` concern, never a page concern.
- Clearing the selection happens after any reload that replaces rows.
- Keyboard: `Space` toggles the checkbox, arrow keys move focus, `Enter` opens the row action — verify with the keyboard in the web head.

### Never
- Do not wrap rows in swipe containers for delete. Delete goes through the selection bar (selection) or the row's delete action inside a confirmation `MudMessageBox`.
- Do not handle row clicks or selection in the page markup — `CrudList` owns them.
- Do not hide actions behind a per-row overflow menu when the entity has at most two actions; the icon button is the rule.

---

## Selection Toolbar — Laws and Variants

> **Note:** MudBlazor has no Material 3 "floating toolbar" component. The selection toolbar is a `MudPaper` (elevated, rounded) with `MudButton`/`MudIconButton` actions, positioned bottom-centre and shown only in selection mode. It is a **shared component** in `Proame.UI` once two pages use it, and then it is a governed component (`component-safety-gate.md`).

### Law
Every list page that has selection actions shows the selection toolbar centred at the bottom, paired with the primary FAB (`MudFab`, the one `Color.Primary` action). In browse mode only the FAB shows. The toolbar is visible only while rows are selected.

### Standard slot assignments
| Slot | Action | Enabled when |
|------|--------|--------------|
| 1 | Select all visible rows (toggle; clears when all are selected) | Always |
| 2 | Delete selected | At least one row selected |

Editing is row-click or the row edit action — there is no toolbar Edit action.

### Variants — allowed adaptations

| Scenario | Adaptation |
|----------|-----------|
| Different actions | Assign the slots that make sense for the entity (up to three actions plus the FAB) |
| No edit | Omit the edit action; use remaining slots for other actions |
| Extra actions (share, archive, export) | Add up to three actions, same component |
| Read-only list | Omit the selection toolbar entirely if there are no page-level actions |

### Enablement
Enablement comes from the selection state (`Disabled` binding), never from a visual toggle state. Do not emphasise several buttons with the primary colour; the FAB is the single primary action.

### Layout
The FAB and the selection toolbar sit in one bottom-centred flex row (CSS, using `env(safe-area-inset-bottom)` on the Hybrid head). The grid's bottom padding must clear the toolbar height plus the FAB offset, so no row is hidden behind it.

---
