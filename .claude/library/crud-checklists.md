# CRUD Page Design Laws — Component + Code-Behind checklists (list page)

> Section file. Index + never-miss rules: `crud-pages.md`.

## Component Checklist (list page)

Every list page's state holder (the `.razor.cs` code-behind of the page, or a state class it owns) shall have:

| Member | Purpose |
|--------|---------|
| `GridData<TDto>` / list of items | The rows on the current page (paging comes from the API) |
| `IReadOnlyList<TDto> SelectedItems` | Selected rows (checkbox selection in `CrudList`) |
| `bool _isLoading` | Drives the skeleton (only for screens that are not `CrudList`) |
| `string _searchText` | Bound to the `CrudList` search field |
| `int SelectedCount` | Derived from `SelectedItems` |
| `string AppBarTitle` | Derived: entity name, or "N selecionados" when rows are selected |
| `bool CanDeleteSelected` | `SelectedCount > 0` (if delete is supported) |
| Add / edit / delete callbacks | `OnAdd`, `OnEdit`, `OnDelete` parameters passed to `CrudList` |

> **CrudList binding notes:**
> - The empty-state flags for "no results" are owned by `CrudList`.
> - The "no items" flag is supplied by the page, because the wording differs per entity.
> - Page state changes go through the component's own `StateHasChanged` or `InvokeAsync`; never mutate state from a background thread without `InvokeAsync`.

---

## Code-Behind Checklist (list page)

Every list page code-behind shall:
- Declare the page with `@page` and the `[Authorize]` attribute the feature design requires (no anonymous access to admin routes).
- Inject the API client and the navigation wrapper through `[Inject]`; no static service locators.
- Implement only the data callback (`Query`), the navigation callbacks (`OnAdd`, `OnEdit`) and the delete callback (`OnDelete`).
- Dispose its pending work in `DisposeAsync` (cancel the `CancellationTokenSource`).

```razor
@* Projects.razor — markup only *@
@page "/admin/projects"
@attribute [Authorize]
@implements IAsyncDisposable

<CrudList TItem="ProjectListItemDto"
          Query="LoadPageAsync"
          OnAdd="NavigateToAdd"
          OnEdit="NavigateToEdit"
          OnDelete="DeleteAsync"
          EmptyTitle="Nenhum local cadastrado"
          SearchPlaceholder="Buscar locais…">
    <ColumnTemplate>
        <PropertyColumn Property="x => x.Name" Title="Nome" />
    </ColumnTemplate>
</CrudList>
```

```csharp
// Projects.razor.cs — code-behind
public partial class Projects : IAsyncDisposable
{
    [Inject] private IProjectClient Client { get; set; } = default!;
    [Inject] private INavigator Navigator { get; set; } = default!;

    private Task<GridData<ProjectListItemDto>> LoadPageAsync(GridState<ProjectListItemDto> state, CancellationToken ct)
        => Client.ListAsync(state.Page, state.PageSize, state.SortDefinitions, ct);

    private void NavigateToAdd() => Navigator.To("/admin/projects/new");
    private void NavigateToEdit(ProjectListItemDto item) => Navigator.To($"/admin/projects/{item.Id}");

    private async Task<bool> DeleteAsync(IReadOnlyList<ProjectListItemDto> items)
    {
        // API call; returns the (success) flag the list uses to reload
        return true;
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
}
```

- The sample is a shape reference, not a template to copy verbatim. Business rules stay in the API.
- Do not add row-tap, selection or search handlers to the page; `CrudList` owns them.

---
