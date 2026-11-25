# Theme & Locale Rules

> On-demand reference for the MudBlazor theme (Material Design 3 seeded from the PROAME logo green) and for pt-BR localization. Tokens are mirrored from the prototype: `Docs/Benchmark/prototype/styles.css`. Decision record: `Docs/Benchmark/decisions.md`.

## Theme Setup

- One `MudTheme` is defined in `Proame.UI` (a single definition file, sequential-only per `rules/workflow.md`) and applied once in the shared layout (`MudThemeProvider`).
- Both heads use the same theme: the MAUI Blazor Hybrid head (`Proame.App`) and the Blazor Web head (`Proame.Web`) render the same `Proame.UI` layout.
- Light and dark schemes: `PaletteLight` and `PaletteDark`, both defined in the same theme file. The user's choice follows the system setting by default; the admin and public areas use the same scheme logic.
- Typography and shape come from the theme's `Typography` and `LayoutProperties` (`DefaultBorderRadius`), not from per-component overrides.

## Colour System

- **Seed:** the PROAME logo green `#A8CF45`. The MD3 tonal palette is generated from it (primary, secondary, tertiary, neutral, error), and the mapping to MudBlazor palette slots is recorded in the theme file.
- **Brand green is a fill, never text.** `#A8CF45` on a light surface is about 1.8:1 contrast. Use it as a fill with dark ink (on-brand `#141F00`, about 11:1), and as the primary colour of the dark scheme (text on `#1B2A07`, about 9:1).
- **Text-bearing primary on light surfaces** uses the tone-40 primary (`#4C6707`, about 6.4:1 with white).
- **WCAG AA** is the target for every text and background pair. Check new pairs against the tokens before use.
- Neutrals are slightly green-tinted (from the same seed) so greys harmonise with the brand.
- Category colours (if the public area uses them) are tone-40 hues with at least 4.5:1 contrast with white text.

## Referencing Colours

- Components use MudBlazor colour enums (`Color.Primary`, `Color.Secondary`, `Color.Error`) or the theme's semantic CSS variables. No hex in `.razor`, `.razor.cs` or component CSS.
- Custom colour that is not in the theme: add it to the theme file as a named token first, then reference the token.
- Gradients and decorative fills are defined once in the shared stylesheet, never repeated per page.

## Typography

- Font family from the theme (`Typography.Default`); the brand font is recorded in `decisions.md` when chosen. Until then, the system font stack is the default.
- Use MudBlazor type variants (`Typo.h1`–`Typo.body2`, `Typo.caption`) — not inline font sizes.
- Minimum body text size keeps readability on phones; check it on the Hybrid head, not only in the browser.

## Component Styling

- Prefer MudBlazor parameters (`Variant`, `Color`, `Size`, `Elevation`) over custom CSS.
- Shared overrides (for example, density or default corner radius) live in the theme's `Components` section or in the one shared stylesheet.
- Per-page CSS isolation (`.razor.css`) is for layout only, never colours.

## Locale

- **User-facing text is pt-BR.** Code, comments, logs and identifiers are English (`CLAUDE.md § Constitutional Constraints`).
- Strings for the UI come from the resource/localization layer (`.resx` or a typed string catalogue in `Proame.UI`); components reference keys, not literal text, when the string is reused. One-off labels in markup are allowed if they are pt-BR and not reused.
- Culture is set to `pt-BR` for the app (number, date and currency formats). Dates display as `dd/MM/yyyy`; decimals use a comma.
- MudBlazor's own strings (pickers, paging, dialogs) are set to pt-BR through its localization support (version-specific — confirm with the MudBlazor MCP).
- Right-to-left is not a target; no RTL work is planned.
- Validation and error messages are pt-BR (`dialogs-validation.md`).

---
