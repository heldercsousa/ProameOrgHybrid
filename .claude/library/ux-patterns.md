# UX Patterns

> Component names are MudBlazor. Material 3 intent is mapped to components in the `m3-*.md` files. Touch and accessibility rules apply to the Blazor Hybrid (Android, iOS) and Blazor Web heads alike.

## Touch Targets

All interactive controls must be at least **48×48 px (CSS)** on touch heads (WCAG 2.5.5 / MD3). Use MudBlazor size and padding props (`Size.Large`, `Class="pa-3"`) or a shared CSS class from the MudTheme tokens — no inline pixel sizes per control.

Icon-only FABs use the MudBlazor `MudFab` default size (56 px) with the MD3 shape.

## Form Validation Timing (pointer)

Form-field validation timing follows the **Form Validation Standard** in `dialogs-validation.md § Form Validation Standard` — validate on blur (dirty fields), keystroke-on-error to clear immediately, Save as the safety net. Two refinements apply:

- **Do not fire a blur error on a pristine field** the user only tabbed through without editing (error prevention, H5). Validate on blur only once the field is dirty, or on Save.
- **Async availability checks** (duplicate name, slug in use) show a **pending indicator** (`MudProgressCircular` adornment) while in flight (visibility of system status, H1), and every error message is **specific and actionable** — say what is wrong and how to fix it, never a bare "Inválido" (help users recover, H9). Messages are pt-BR.

## Selection Actions vs Form Actions

These are intentionally different — do not "unify" them:

| Context | Pattern | Reason |
|---------|---------|--------|
| Add/Edit form (routable page or dialog) | Labelled buttons — "Cancelar" + "Salvar" | Clear labels when entering data |
| Selection toolbar on a list (`crud-appbar-list-toolbar.md`) | Icon buttons with tooltips and `aria-label` | Space is constrained; actions are confirmable |

Labelled toolbar actions are acceptable only when icon meaning is ambiguous.

## Selection Behaviour (list pages)

- Selection is driven by the row checkbox column in `CrudList`; the page adds no selection logic (`crud-appbar-list-toolbar.md § Gestures`).
- **Select all** toggles: if all visible rows are selected, clear the selection; otherwise select all visible rows. The mode stays on after clearing only while the toolbar is still needed by the page's design.
- **Clearing selection** happens after a reload that replaces rows, never by re-matching ids on the UI thread.
- **Exit selection mode** when the selection count drops to 0 (computed from the selection state, not a separate flag).
- **Row click in selection mode** toggles the row; **row click in browse mode** follows the page's `OnRowClick`, if any.

## Empty State Positioning

Empty, error and loading placeholder states are **vertically centred** in their container, not top-aligned:

```razor
<MudStack AlignItems="AlignItems.Center" Justify="Justify.Center" Spacing="2" Class="pa-8" Style="min-height: 240px;">
    <!-- icon, headline, supporting text -->
</MudStack>
```

Never align these placeholders to the start of the container.

## Autocomplete — MudAutocomplete, shared wrapper (ruling pending)

**Rule:** every autocomplete is a `MudAutocomplete` wrapped in the shared field component in `Proame.UI`, so debounce, minimum length, cancellation, pick and clear behave the same everywhere. Behaviour belongs to the component, never to a page.

- The menu opens only when there are options. A "no results" row is shown only if the feature spec requires it (`MudAutocomplete` `NoItemsTemplate`).
- Slow searches show `Loading` in the field while the request is in flight, and the previous request is cancelled when a new search starts.
- Unpicked typed text is handled by the feature, not the component, unless the spec says otherwise.
- Component API questions go to the MudBlazor MCP at the manifest version.

## Badge / Chip Pattern (count)

Use `MudChip` (or `MudBadge` on an icon) for informational counts. Show the count, not just a binary flag:

```razor
@if (item.EventCount > 0)
{
    <MudChip T="string" Size="Size.Small" Color="Color.Secondary" Variant="Variant.Filled">
        @($"{item.EventCount} eventos")
    </MudChip>
}
```

- The count comes from the API DTO (a computed field in the service/query projection), not a separate stored column.
- Labels are pt-BR and pluralised in code, not with string concatenation in markup.

---
