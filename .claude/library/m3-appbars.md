# M3 Components — M3 Top App Bars (Small, Search, standalone) + shared base + tokens + files

> Maps Material 3 top app bar and search patterns to MudBlazor. Implemented in `Proame.UI` (layout shell and shared bar components). Component API questions: MudBlazor MCP at the manifest version.

## M3 Small Top App Bar → `MudAppBar`

- MD3 small top app bar: title, optional navigation icon (back or menu), up to three trailing actions.
- MudBlazor: `MudAppBar` with `MudIconButton` (navigation), `MudText` `Typo.h6` (title), and trailing `MudIconButton`s.
- The application shell owns one `MudAppBar`. Pages set the title and actions through the shared title state; they do not place their own bar.
- Elevation changes on scroll (MD3 "elevated on scroll") are a shell behaviour: `Elevation` is set from the scroll state of the page container.

## M3 Search Top App Bar → search field inside the bar or above the list

- MD3 search bar (docked or standalone) is implemented as a `MudTextField` with a search adornment (`Adornment.Start`, `Icons.Material.Outlined.Search`), a clear button, and a pt-BR placeholder.
- The field is always visible on list pages; it is not a bar swap and not a mode toggle (see `crud-appbar-list-toolbar.md § App Bar — Laws and Variants`).
- Search input is debounced and cancels the previous request (`code-style-reference.md § Async`).
- Leading icon: search icon when idle; back arrow only when the search is a full-screen search surface on a secondary page (rare; decided per feature).
- Back and close: the clear button empties the query; the back icon leaves the search surface.

## Shared Base Class Pattern

Shared bars derive from one base component or share one parameter set so that the same behaviour (elevation, back navigation, trailing action slots) is defined once:

| Parameter | Purpose |
|-----------|---------|
| `Title` (string) | Page title, pt-BR |
| `ShowNavigation` (bool) | Back or menu icon visibility |
| `OnNavigation` (EventCallback) | Back/menu action (via the navigation wrapper) |
| `Action1`…`Action3` (RenderFragment or icon + callback) | Up to three trailing actions |
| `IsElevated` (bool) | Elevation from scroll state |

Changing the base is a governed-component change (`component-safety-gate.md`).

## Token Mapping (MD3 canonical → MudTheme)

| MD3 role | MudTheme slot / token |
|----------|-----------------------|
| Surface | `Surface` / `Background` (light and dark palettes) |
| Surface container (elevated bar) | `Surface` with elevation shadow |
| On surface | `TextPrimary` |
| On surface variant | `TextSecondary` |
| Primary (text-bearing) | `Primary` (tone 40 on light; see `theme-locale.md`) |
| Brand fill | `#A8CF45` as a fill only, with dark ink |

Token values are defined once in the theme file (`theme-locale.md`); bars reference the slots, never hex values.

## Files

| File | Role |
|------|------|
| `Proame.UI/Layout/MainLayout.razor` (+ `.razor.cs`) | Owns the single `MudAppBar` and the shell |
| `Proame.UI/Components/AppBars/PageAppBar.razor` (+ `.razor.cs`) | Shared bar parameters (title, navigation, actions) |
| `Proame.UI/Components/AppBars/SearchField.razor` | Persistent search field used by `CrudList` |
| `Proame.UI/Theme/` (theme definition) | Palette and component defaults |

---
