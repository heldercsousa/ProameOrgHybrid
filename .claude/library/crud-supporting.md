# CRUD Page Design Laws — Confirm-Delete Dialog, Skeleton, DI Registration, Empty State

> Section file. Index + never-miss rules: `crud-pages.md`.

## Confirm-Delete Dialog

> **Note:** the confirmation lives inside `CrudList` (`crud-listview.md`). Do not add a dialog to page markup for the standard delete. The page supplies the delete callback (`OnDelete`); `CrudList` shows the confirmation first.

Use `MudMessageBox` (static `Show`) for any destructive action — never a native browser dialog and never a bottom sheet:

```csharp
bool? confirmed = await Dialog.ShowMessageBox(
    title: "Excluir registro",
    markupMessage: new MarkupString("Esta ação não pode ser desfeita."),
    yesText: "Excluir",
    cancelText: "Cancelar");
```

- Titles, messages and button labels are pt-BR and come from the resource/localization layer (`theme-locale.md`), not hard-coded in several places.
- The primary destructive button uses the error colour from the MudTheme tokens; the cancel button is the default focus.
- Deleting several rows states the count in the message ("3 registros") computed by the caller.

---

## Skeleton (Loading State)

> **Note:** the skeleton is internal to `CrudList`. Do not add `MudSkeleton` placeholders to page markup for list rows. The component state `_isLoading` (or the grid's `Loading` binding) is still required on the page only for non-list screens.

- Row skeletons use `MudSkeleton` with `Animation="Animation.Wave"` and match the row height of the list (`Height` equal to the row height in the MudTheme density setting).
- Show six placeholder rows on the first load.
- The skeleton is rendered before the request starts: set the loading flag, call `StateHasChanged()`, then await the data call.
- Reduced motion: skeleton animation is disabled when the user prefers reduced motion (`prefers-reduced-motion` in the shared CSS).

---

## DI Registration

Registration rules (lifetimes and extension-method composition) are in `code-style-reference.md § DI Registration Conventions`. Summary for CRUD pieces:

| Type | Lifetime | Reason |
|------|----------|--------|
| Razor page / component | Not registered (Blazor creates them) | Components are resolved by the router |
| Page-level state holder (if any) | `AddScoped` (per circuit) or `AddTransient` | Fresh state per navigation in Blazor Web/Hybrid |
| API client (`IVenueClient`-style) | `AddScoped` (Blazor) / typed `HttpClient` | Per-circuit in the UI; typed client in the API host |
| Service (API) | `AddScoped` | Per request |
| Repository (API) | `AddScoped` | Per request, shares the request's `DbContext` |

---

## Empty State

Use the shared empty-state component (`EmptyState` in `Proame.UI`) for all empty and no-results states. It shows an icon (`MudBlazor` `Icons.Material.Outlined.*`), a pt-BR headline, and an optional action button:

```razor
<EmptyState Icon="@Icons.Material.Outlined.Place"
            Headline="Nenhum local cadastrado"
            Visible="@(_isEmptyNoItems)" />
```

Two standard states drive visibility:
- **No items** — no records exist at all (the page offers the add action).
- **No results** — the search or filter returned no matches (the page offers "limpar busca").

The empty-state component is a governed component once two pages consume it (`component-safety-gate.md`).
