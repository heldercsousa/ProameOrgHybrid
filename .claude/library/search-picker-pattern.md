# Search Picker Pattern

> On-demand reference for "pick one (or several) records from a searchable list" in PROAME (MudBlazor). Read before building any picker. Autocomplete rules: `ux-patterns.md § Autocomplete`.

## 1. When to Use a Picker Dialog vs Inline Autocomplete

| Situation | Use |
|-----------|-----|
| Short list (< ~20 items), one choice, field lives in a form | `MudAutocomplete` / `MudSelect` inline |
| Large or remote list, search needed, one choice | Picker dialog (`MudDialog`) that returns the chosen record |
| Several records to pick, with search and selection | Picker dialog with `MudDataGrid` checkboxes |
| Search-as-you-type over an API | `MudAutocomplete` with `SearchFunc` calling the API with debounce and cancellation |

Pickers never navigate away from the form that asked for the value. A dialog returns the value to its caller; the form keeps its state.

## 2. Files That Constitute a Picker Implementation

For a picker named `<Entity>Picker`:

| File | Role |
|------|------|
| `Proame.UI/Pickers/<Entity>PickerDialog.razor` (+ `.razor.cs`) | The dialog: search field, results, selection, Confirm/Cancel |
| `Proame.Contracts/<Entity>ListItemDto.cs` | The row DTO returned by the search endpoint |
| API endpoint `GET /<entities>?query=&page=&size=` | Server-side search with paging (service layer does the work) |
| `Proame.UI/<Entity>Client` (typed client) | Calls the endpoint with `CancellationToken` |
| Test files | bUnit test for the dialog; service/endpoint test for the search (`testing.md`) |

## 3. Result Contract

The dialog returns a single typed value through `DialogResult`:
- Single pick: the selected DTO (or its id) in `DialogResult.Data`.
- Multi pick: a list of ids.
- Cancel: `Canceled = true`; the caller keeps its previous value.

Callers open the dialog through `IDialogService` and await the result. No message bus, no static events, no shared mutable state between page and dialog.

## 4. Dialog Component Contract

- Parameters: `string Title`, optional `IReadOnlyList<long> ExcludedIds`, optional initial search text.
- The search field is debounced; each keystroke cancels the previous request through a `CancellationTokenSource`.
- Results use `MudList` (short lists) or `MudDataGrid` (long lists) with server-side paging.
- Loading: `Loading`/`MudSkeleton` while a search runs; empty state "nenhum resultado" when the search returns nothing.
- Dispose: cancel and dispose the pending `CancellationTokenSource` in `DisposeAsync`.

### Loading discipline
- A search sets the loading flag before the call and clears it only after the results are applied.
- Results are applied in one assignment, then `StateHasChanged()`.
- A failed search shows an inline `MudAlert` with retry; the dialog stays open.

## 5. Caller Side

```csharp
var options = new DialogOptions { MaxWidth = MaxWidth.Small, FullWidth = true };
var parameters = new DialogParameters<PickerParams> { ... };
var dialog = await Dialogs.ShowAsync<VenuePickerDialog>("Escolher local", parameters, options);
var result = await dialog.Result;
if (result is { Canceled: false, Data: VenueListItemDto venue })
{
    _selected = venue;
}
```

- The caller reads the value after the dialog closes; it never reaches into the dialog's internals.
- The caller clears its state if the dialog is cancelled and the user had no prior value.

## 6. DI and Navigation

- The dialog service and API clients are registered in `AddProameUi()` (`code-style-reference.md § DI Registration Conventions`).
- Dialogs do not use `NavigationManager`. A "create new" action inside a picker opens the entity's own form in a second dialog or returns a "create" signal to the caller — decided per feature.

## 7. Testing

- bUnit: render the dialog with a fake search client; assert debounce (one call after typing stops), cancellation of a stale search, empty state, error state, and the value returned on confirm.
- Service/endpoint: the search query returns the correct page, respects the excluded ids and the business filter (in the service layer).
- Each acceptance criterion traces to a test (`testing.md § Acceptance Criteria Traceability`).

## 8. Reference Implementation

None yet. The first picker built for PROAME becomes the reference and is recorded here with its file paths.

---
