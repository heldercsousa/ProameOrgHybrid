# M3 Components — Component Patterns and MD3 Terminology

> Entry point for Material 3 component work in PROAME. Each MD3 pattern is implemented with a MudBlazor component; this file keeps the terminology and the pre-implementation checks.

## Pre-Implementation Audit Checklist (MudBlazor first)

**Before implementing a new component OR adding styles for a component:**

1. **Check MudBlazor first.** Query the MudBlazor MCP for the component at the manifest version. If MudBlazor has an equivalent, use it.
2. **Check the existing shared components in `Proame.UI`** (`m3-appbars.md`, `m3-lists.md`, `m3-emptystate-chips.md`, `m3-floating-toolbar.md`). Reuse before building.
3. **Only then build custom** — and record why MudBlazor did not cover it in the feature design. A custom component consumed by two or more pages becomes governed (`component-safety-gate.md`).
4. **Use theme tokens only** (`theme-locale.md`). No hard-coded colours or sizes.

## Styles Must Exist Before Use

A component's CSS class or theme slot is defined in the theme file or the shared stylesheet before any page references it. A reference to an undefined token is a build-time review failure, not a runtime fallback.

## MD3 Terminology Conventions

### "Body" means a structural slot — not text content
In MD3 anatomy, "body" is a structural region of a component (for example the content area of a card or dialog), not the body text style. Use "body text" for typography and "content slot" for layout regions in code and docs.

### Typography — MD3 type scale → MudBlazor typo variants

| MD3 role | MudBlazor `Typo` |
|----------|------------------|
| Display large / medium / small | `Typo.h1` / `Typo.h2` / `Typo.h3` (display sizes via theme) |
| Headline large / medium / small | `Typo.h4` / `Typo.h5` / `Typo.h6` |
| Title large / medium / small | `Typo.h6` / `Typo.subtitle1` / `Typo.subtitle2` |
| Body large / medium / small | `Typo.body1` / `Typo.body2` / `Typo.body2` (smaller variant via class) |
| Label large / medium / small | `Typo.button` / `Typo.caption` / `Typo.overline` (theme-defined) |

Use the `Typo` parameter of `MudText`; do not set font sizes inline.

### Anatomy slot terms used in this codebase
- **Leading** — icon, avatar or image before the headline.
- **Headline / Supporting text / Overline** — the text stack of a list item (`m3-lists.md`).
- **Trailing** — checkbox, switch, metadata or action after the text.
- **Container** — the surface the component sits on.

## Search — autocomplete (cross-reference)

Autocomplete behaviour (debounce, minimum length, pick, clear, loading) is owned by the shared field in `Proame.UI`; see `ux-patterns.md § Autocomplete` and `search-picker-pattern.md`.

---
