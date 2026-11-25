# M3 Components — M3 Lists — list item component

> Maps Material 3 list items to MudBlazor (`MudList`, `MudListItem`, `MudDataGrid` rows). Shared row component for card-style lists lives in `Proame.UI/Components/Lists/`. Tables use `MudDataGrid` (`crud-listview.md`).

## M3 Lists — list item component

### Official M3 terminology
- **List item** — one row. **Headline** — the primary line. **Supporting text** — the secondary line. **Overline** — label above the headline. **Leading / trailing** — the slots before and after the text.

### Set variants (determined by slot population)
- One line (headline only), two lines (headline + supporting text), three lines (overline + headline + supporting text).
- The variant follows from the content; pages do not choose a height.

### Typography tokens
- Headline → `Typo.body1` (MD3 body large); supporting text → `Typo.body2` (MD3 body medium) with `Color.Secondary`; overline → `Typo.overline`. Do not set font sizes inline.

### Interactive vs non-interactive
- Interactive rows (click to open) show a hover/focus state and are real buttons or links for keyboard and screen readers.
- Non-interactive rows have no hover state and no click handler.

### Single-action vs multi-action lists
- A row with one action: the whole row is the action.
- A row with several actions: the row is not clickable; each action is a separate `MudIconButton` in the trailing slot. Do not nest actions inside a clickable row.

### Checkbox placement rule (M3)
- In selectable lists, the checkbox is a **leading** element for text-only rows and a **trailing** element when the row has a leading icon or avatar. Pick one per list and keep it consistent across the list.
- Tapping the checkbox toggles selection and does not open the row.

### Leading element presets
- `MudIcon` (single icon), `MudAvatar` (initials or image), or an image with a fixed size. Choose the preset that matches the entity type; do not mix presets in one list.

### Container padding and spacing
- Row padding and divider come from the shared list density setting in the theme. Dividers only between rows, never after the last row.

### Known gotchas
- Long headlines truncate with an ellipsis, and the full text is in a `title` attribute or tooltip.
- Empty and loading states are handled by the list container (`crud-supporting.md`), not by the row.
- `MudDataGrid` rows in a table do not use the list item variants; table layout follows the grid's column rules.

---
