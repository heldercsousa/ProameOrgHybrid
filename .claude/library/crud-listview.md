# CRUD Page Design Laws — CrudList — the standard list shell

> Section file split from `crud-pages.md` (token-scoped reads). Index + never-miss rules: `crud-pages.md`.

> **Loading pattern (mandatory):** a list page uses the shared list component and never hand-rolls loading, paging or the skeleton — `code-style-reference.md § Loading Pattern — Lists and Data Loads`.

## CrudList — The Standard List Shell

All **new** CRUD list pages use the shared list component in `Proame.UI` (proposed name `CrudList<TItem>`; the name and final parameter list are fixed by the first feature that builds it and recorded in its design). The page is a thin shell: a page title/toolbar (`MudAppBar` section or the page header), optional filter row, and one `<CrudList>` element with entity-specific column or row templates. Reproducing the list body (table, skeleton, empty state, selection bar, confirm dialog) in each page is **deprecated** pattern.

### What CrudList provides (do not reproduce in page markup)

- `MudDataGrid` (or `MudTable` for simple lists) with **server-side** paging, sorting and filtering through the page's data callback
- Loading state: `Loading` + `MudSkeleton` rows on the first load and on every reload that replaces rows; never a blank table
- Search input with debounce (`MudTextField` with adornment) that resets to page 1
- Selection: `MultiSelection` on the grid, a selection toolbar (select all visible, delete selected) shown only while rows are selected
- Empty states: "no items" (entity-specific headline + icon) and "no results" (search with no match) — both in pt-BR
- Floating action button (`MudFab`) for "add" when the page provides an add callback
- Delete confirmation through `MudMessageBox` — never a native dialog
- Error state: failed load shows a `MudAlert` with a retry action; the grid keeps its last good rows if one exists
- Optional `FilterContent` slot (`RenderFragment`) rendered above the grid, hidden when null

### Parameters (proposed contract — confirm in the first feature design)

| Parameter | Type | Set by page | Notes |
|-----------|------|-------------|-------|
| `Query` | `Func<GridState<TItem>, CancellationToken, Task<GridData<TItem>>>` | Yes | Calls one API endpoint with the paging/sorting/filter state; the only data call |
| `ColumnTemplate` / `RowTemplate` | `RenderFragment<TItem>` | Yes | Entity-specific columns or card row |
| `EmptyTitle`, `EmptyIcon` | `string` (pt-BR), `string` (MudBlazor icon) | Yes | "No items" state |
| `OnAdd` | `EventCallback` | Optional | Shows the FAB when set |
| `OnEdit` | `EventCallback<TItem>` | Optional | Row action |
| `OnDelete` | `Func<IReadOnlyList<TItem>, Task<bool>>` | Optional | Page runs the API delete; CrudList shows the `MudMessageBox` confirmation first |
| `SearchPlaceholder` | `string` (pt-BR) | Yes | Placeholder of the search field |
| `FilterContent` | `RenderFragment` | Optional | Filter chips or selects above the grid |

### Behaviour rules

- The page never calls the API for list rows itself; it returns data through `Query`.
- Selection clears after a reload that replaces rows (`rules/workflow.md` and `code-style-reference.md § UI Rendering Performance`).
- Pull-to-refresh and gestures on touch heads follow the gesture law in `crud-appbar-list-toolbar.md § Gestures`.
- Pages do not add their own `MudDataGrid` next to `CrudList`.

### Page skeleton (reference, to be validated by the first feature)

```razor
@page "/admin/venues"
@attribute [Authorize]

<PageTitle>Locais</PageTitle>

<CrudList TItem="VenueListItemDto"
          Query="LoadPageAsync"
          OnAdd="NavigateToAdd"
          OnEdit="NavigateToEdit"
          OnDelete="DeleteAsync"
          EmptyTitle="Nenhum local cadastrado"
          EmptyIcon="@Icons.Material.Outlined.Place"
          SearchPlaceholder="Buscar locais…">
    <ColumnTemplate>
        <PropertyColumn Property="x => x.Name" Title="Nome" />
    </ColumnTemplate>
</CrudList>
```

```csharp
// Venues.razor.cs — the page's only data code
private Task<GridData<VenueListItemDto>> LoadPageAsync(GridState<VenueListItemDto> state, CancellationToken ct)
    => Venues.ListAsync(state.Page, state.PageSize, state.SortDefinitions, ct);
```

- The API returns `(items, total)`; `Proame.Contracts` holds the page size constant (`code-style-reference.md § Pagination`).
- Navigation uses the `Proame.UI` navigation wrapper, never `NavigationManager` directly in the page.

### Optional slot: FilterContent

```razor
<CrudList ...>
    <FilterContent>
        <!-- Any MudBlazor filter control (MudChipSet, MudSelect) — shown above the grid -->
    </FilterContent>
</CrudList>
```

When `FilterContent` is null (default), no filter row is rendered. When set, the filter row is shown above the grid and its changes trigger a new `Query` call.

### Optional behaviour: row tap navigation

Pages that navigate on row tap set `OnRowClick` (`EventCallback<TItem>`). When unset, rows are not clickable except through the row edit action.

---
