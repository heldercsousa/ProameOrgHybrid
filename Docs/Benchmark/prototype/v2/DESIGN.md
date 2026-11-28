# PROAME v2 — alternative design sample

Design trial to compare with the MD3 prototype (v1). Three pages: Home, Projeto + inscrição, Admin › Inscrições.

## Aesthetic direction: "Quadro de avisos" (community notice board)

The NGO works in Gama, a neighbourhood city. Its visitors read printed notices, calendars on the wall, and handwritten signs at a community centre. v2 takes that register: warm paper ground, large confident grotesque headlines, dates shown as calendar tiles, and information ordered like a notice board rather than a card grid. Not Material: no elevation shadows, no rounded surface cards, no tonal stacking of containers.

The one memorable element is the **date tile** (a bordered day-and-month block) used for every project date. Everything else stays quiet so the tile carries the identity.

Avoided on purpose (from the v1 review, and the generic AI-design tells): tracked ALL-CAPS eyebrows, middle-dot meta strings, arrows in button text, one-word accents in headlines, numbered steps where the content is not a sequence, grey-blur shadows, gradient washes, monospace labels.

## Type

| Role | Family | Notes |
|---|---|---|
| Display (headlines, date tile numbers) | **Bricolage Grotesque** (variable, opsz/wdth/wght) | Condensed, warm, slightly irregular. Fits a hand-made civic feel. |
| Body, labels, tables, forms | **Atkinson Hyperlegible** | Designed for low-vision legibility. Suits a readership that includes older adults. |

Fallback: `system-ui`. Both come from Google Fonts; the page still works offline with the fallback.

Scale (fluid, `clamp()`):

| Token | Size | Use |
|---|---|---|
| `--t-display` | `clamp(2.6rem, 1.4rem + 4.8vw, 5.6rem)` | Home hero (Persuade only) |
| `--t-h1` | `clamp(2rem, 1.4rem + 2.4vw, 3.2rem)` | Page titles |
| `--t-h2` | `clamp(1.4rem, 1.1rem + 1vw, 1.9rem)` | Sections |
| `--t-body` | `clamp(1.0625rem, 1rem + 0.25vw, 1.2rem)` | Body (Persuade) |
| `--t-ui` | `0.9375rem` | Operate: tables, labels, chips |

Weights: 700 for headlines, 400 body, 700 labels. Line length kept under 70 characters (`max-inline-size: 66ch`). Body line-height 1.6; headlines 1.05 to 1.15.

## Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112` px, tokens `--s-1` to `--s-9`. Page gutter `clamp(1rem, 4vw, 2.5rem)`. Persuade sections use `--s-8` vertical rhythm; Operate uses `--s-3` and `--s-4`.

## Shape

- Persuade: square corners (`--r-0: 0`) for the hero band and date tiles; `--r-2: 10px` only on form controls and buttons. The hero band has one diagonal cut at the bottom edge (`clip-path`), the only non-rectilinear shape in the system.
- Operate: `--r-1: 4px` everywhere. Chips are pills (`--r-pill`).
- Borders are 1px `--line` (ink mixed 18% into paper). Date tiles use a 2px ink border.

## Colour (oklch, seeded from the logo green #A8CF45)

The brand green is a **fill only**. Text on a light surface uses the deep green token; ink on brand fills is the dark token.

| Token | Light | Dark |
|---|---|---|
| `--paper` (page) | `oklch(0.977 0.012 118)` | `oklch(0.2 0.03 135)` |
| `--surface` (inputs, table) | `oklch(0.995 0.005 118)` | `oklch(0.25 0.03 135)` |
| `--ink` (text) | `oklch(0.25 0.035 135)` | `oklch(0.95 0.02 118)` |
| `--ink-soft` (secondary text) | `oklch(0.42 0.04 132)` | `oklch(0.8 0.03 125)` |
| `--brand` (fill, seed #A8CF45) | `oklch(0.79 0.18 129)` | same |
| `--brand-ink` (ink on brand) | `oklch(0.24 0.06 135)` | same |
| `--brand-text` (green text/links) | `oklch(0.38 0.1 136)` | `oklch(0.88 0.16 128)` |
| `--ocre` (warm accent, fill) | `oklch(0.84 0.12 78)` | `oklch(0.5 0.1 75)` |
| `--danger` | `oklch(0.45 0.16 27)` | `oklch(0.85 0.1 27)` |

Derived by `color-mix(in oklch, …)`: `--line`, hover tints, zebra rows, chip backgrounds. Contrast targets: body text and secondary text at least 4.5:1 on paper and surface; verified with axe in the Playwright pass.

The seed hex is an approximation of #A8CF45 in oklch; the exact fill is checked visually against `assets/logo`.

## Modes

- **Persuade** (public pages): expressive. Large display type, brand hero band, calendar tiles, generous spacing, one page-load moment (hero headline rises once).
- **Operate** (admin): dense and scannable. `--t-ui` size, 8px row padding, sticky table header, zebra rows through `color-mix`, status chips with text (never colour alone), tabular figures.

Mode is set by a body class (`mode-persuade` / `mode-operate`) from the router.

## Motion

- One entrance: hero headline rises 12px and fades in, 700ms, once on load. Nothing else is animated on load.
- Responses to action only: tooltip opens with a 150ms opacity change; dialog uses native open.
- `prefers-reduced-motion: reduce` removes all animation and transition durations.

## Constraint: reproducible in MudBlazor

Every visual above maps to a MudTheme token or a MudBlazor component plus a small CSS override. No custom component is needed. The table below is the migration map.

## v2 element → MudBlazor mapping

| v2 element | Mode | MudBlazor component | Override / note |
|---|---|---|---|
| Utility strip (v1 link, theme switch) | both | `MudAppBar` (dense) + `MudIconButton` | Strip is a plain row above the app bar; `MudToggleIconButton` for theme |
| Brand + nav | Persuade | `MudAppBar` + `MudLink` + `MudNavMenu` (mobile drawer) | Logo via `MudImage` |
| Admin nav | Operate | `MudAppBar` + `MudTabs` (variant `Text`) | Dense `MudTabs` |
| Hero band (brand fill, diagonal cut) | Persuade | `MudContainer` + `MudPaper` (square, `Square="true"`) | `clip-path` override in CSS; `Typo.h1` for title |
| Hero CTA | Persuade | `MudButton` (`Variant.Filled`, `Color.Primary`) | Dark ink on brand from theme `OnPrimary` |
| Project row with date tile | Persuade | `MudGrid` + `MudPaper` (`Elevation="0"`, `Outlined="true"`) | Date tile is a `MudPaper` with 2px border; numbers `Typo.h3` |
| Project type tag | Persuade | `MudChip` (`Size.Small`, `Variant.Outlined`) | Text, not colour alone |
| How-to-help list | Persuade | `MudList` (`Dense`) + `MudDivider` | Dashed divider via CSS override |
| Projeto header and info | Persuade | `MudText` (`Typo.h1`, `Typo.body1`) | Max width via `MudContainer MaxWidth.Medium` |
| Inscrição form fields | Persuade | `MudTextField`, `MudSelect`, `MudCheckBox`, `MudDatePicker` | `HelperText` = visible short helper; `Adornment` with `MudIconButton` (info) |
| Info-icon tooltip (tap) | Persuade | `MudTooltip` (on tap, `Delay` 0) or `MudPopover` | Use `MudPopover` if tooltip must open on touch, `MudTooltip` is hover-first |
| Consent checkbox | Persuade | `MudCheckBox` + `MudText` (`Typo.caption`) | Required validation via `Required` |
| Turnstile placeholder | Persuade | `MudPaper` (`Outlined`) | Replaced by the Turnstile widget in production |
| "?" help button | Persuade | `MudIconButton` (`Icons.Material.Filled.HelpOutline`) → `MudDialog` | Dialogs only via `MudDialog` (CLAUDE.md) |
| Admin filter row | Operate | `MudStack` (row) + `MudSelect` + `MudTextField` (`Adornment.Start`) | `Dense="true"` |
| Signups table | Operate | `MudTable` (`Dense`, `Hover`, `Striped`, `FixedHeader`) | Sticky header via `FixedHeader`; zebra via `Striped` |
| Status chip | Operate | `MudChip` (`Size.Small`, `Color` per status) | Text + colour; never colour alone |
| Row status change | Operate | `MudSelect` (`Dense`) inside `MudTd` | Confirms via `MudMessageBox` if needed |
| Result count | Operate | `MudText` (`Typo.body2`) | Count in pt-BR |
| Toast feedback | both | `MudSnackbar` | Role status |
| Footer | both | `MudContainer` + `MudGrid` | Plain text links |

## Principles (summary)

1. One memorable thing per page (the date tile in Persuade; the chip column in Operate). Everything else is quiet.
2. Structure encodes information: dates are tiles because they are dates; lists are lists because they are lists. No decorative numbering.
3. Brand green is a fill with dark ink. Never text on paper.
4. Old and low-vision readers come first: Atkinson Hyperlegible, 1.6 line height, 44px touch targets on controls, visible focus rings (3px ink).
5. Pt-BR text only in the UI; copy is plain verbs and sentence case. Buttons say what they do ("Enviar inscrição").
