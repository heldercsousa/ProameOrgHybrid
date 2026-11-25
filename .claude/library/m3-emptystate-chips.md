# M3 Components — M3 Empty State + Filter Chip

> Maps the Material 3 empty-state and filter-chip patterns to MudBlazor. Shared empty state is `EmptyState` in `Proame.UI`.

## M3 Empty State component

MD3 has no fixed empty-state component; the pattern is an icon, a headline, optional supporting text and an optional action, centred in its container.

- Implemented as `EmptyState` in `Proame.UI/Components/States/` with parameters `Icon` (MudBlazor icon), `Headline` (pt-BR), `SupportingText` (optional), `ActionText` + `OnAction` (optional).
- Layout: vertically and horizontally centred (`ux-patterns.md § Empty State Positioning`), `MudStack` based.
- Typography: headline `Typo.h6`, supporting text `Typo.body2` with `Color.Secondary` (contrast checked against the theme).
- Two states are used across lists: **no items** (offers the add action) and **no results** (offers "limpar busca"). The page chooses which one to show; the component does not decide.

### Section header typography

Navigation drawer section headers use the theme's `Typo.overline` or `Typo.subtitle2`. Do not restyle them per page.

## Filter Chip (MD3) → `MudChipSet` with filter chips

### When to use Filter Chips
- Narrowing a list by a small fixed set of categories (2–6 options) that the user toggles.
- Not for navigation, not for a single choice (use `MudSelect`), and not for free-text search (use the search field).

### Layout pattern (filter row above the list)
- `MudChipSet` with `Filter="true"` and `MultiSelection` as the spec requires, placed in the `FilterContent` slot of `CrudList` (`crud-listview.md`).
- The filter row is hidden when the slot is empty.
- Chip labels are pt-BR; selected chips use the primary colour with a check icon (not colour alone — accessibility).

### Chip selection → domain value mapping
- Chip values are bound to a typed enum or id list in the page state; the enum/id to label mapping lives in the shared mapping, not inline strings.
- The page sends the selected filter values to the API (server-side filtering). The UI never filters a full list in memory.

### MD3 terminology
- "Filter chip" = toggle selection chip; "Assist chip" = single-action chip (`MudChip` with `OnClick`); "Input chip" = removable entity chip (`MudChip` with `OnClose`).

---
