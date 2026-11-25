# M3 Components — M3 Floating Toolbar (selection toolbar)

> MD3 floating toolbar mapped to MudBlazor. MudBlazor has no floating-toolbar component; PROAME implements it as a shared selection bar in `Proame.UI` (a `MudPaper` with `MudIconButton`/`MudButton` actions). Layout laws: `crud-appbar-list-toolbar.md § Selection Toolbar`.

## M3 Floating Toolbar

### Spec
- MD3: a floating container of up to a few actions, used for contextual actions, elevated above content, usually paired with a FAB.
- Shape: rounded container (theme `DefaultBorderRadius`), elevation shadow from the theme, surface container colour.
- Actions: icon buttons with tooltips and accessible names (pt-BR), or labelled buttons when the icon is ambiguous.

### Colour tokens
- Surface container and on-surface colours come from the theme slots (`theme-locale.md`). Toggle (selected) actions use the secondary container colour; enabled primary action uses `Color.Primary`.
- The FAB is the only primary-coloured action on a screen with a toolbar.

### When to use
- A list page with actions that apply to the selected rows (select all, delete, export).

### When NOT to use
- A form page (competes with the form's Save action and the keyboard) — `crud-form-page.md`.
- A page with no selection actions — omit it.
- Navigation — use the app bar or the navigation menu.

### Anatomy
- Container → up to three actions (plus the FAB placed beside it) → optional divider.

### Component
- `SelectionToolbar.razor` (+ `.razor.cs`) in `Proame.UI/Components/Toolbars/`: parameters for the action list (label, icon, `Disabled`, callback), `Visible` bound to the selection state.
- Enablement from the selection state; the toolbar never decides business rules.
- Governed component once two pages use it (`component-safety-gate.md`).

### Page integration pattern
- The page passes the actions; `CrudList` places the toolbar at the bottom centre with the FAB in one row (`crud-appbar-list-toolbar.md`).
- The toolbar is visible only while rows are selected.

### FAB coexistence
- FAB (`MudFab`) sits to the right of the toolbar in one flex row, bottom-centred, respecting `env(safe-area-inset-bottom)` on the Hybrid head.
- The grid's bottom padding is at least the toolbar height plus the FAB offset, so no row is hidden.

### Accessibility
- The toolbar is a labelled region (`aria-label` pt-BR "Ações da seleção").
- Each action has a tooltip and an accessible name; disabled actions stay focusable with a reason where practical.
- Keyboard: Tab moves through the actions; the FAB remains reachable.

### Motion
- Show and hide use a short fade; no scroll-linked animation (deliberately omitted). Respect `prefers-reduced-motion`.

---
