# PROAME v2 — alternative design sample

Design trial to compare with the MD3 prototype (v1). Covers every v1 route: public Persuade pages and the Operate admin area (see the route map below). Critique of the first three pages: section "Critique 2026-11-27".

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
| Ruled list (services, releases, editais, help) | both | `MudList` (`Dense`) + `MudDivider` per item | Top rule on the list, hairline between items; no card per item |
| Filter chips (Projetos, type/date/photo) | Persuade | `MudChip` (`Variant.Outlined`, `Selected`) inside a `MudChipSet` (`Filter="true"`) | `aria-pressed` maps to `Selected`; text stays visible |
| Stacked admin list (< 640 px) | Operate | `MudTable` (`Breakpoint` set to `Breakpoint.Sm`) + `MudTd DataLabel` | Small-device mode shows each cell with its label; wide screens keep the table |
| Admin stat tiles (Painel) | Operate | `MudPaper` (`Square="true"`, `Elevation="0"`) + `MudText` (`Typo.h3`) | Top border only; no shadow |
| Project builder field list | Operate | `MudList` + `MudIconButton` (move up, move down, remove) | Base fields show a "Fixo" label instead of actions |
| Project preview | Operate | `MudForm` disabled, or `MudPaper` with the same field components as Persuade | Dashed border; shows the public signup as it will render |
| Confirmations (restore, delete edital, make Root, large PDF) | both | `MudMessageBox` for yes/no; `MudDialog` when a field is needed (promote Root) | Never native `alert`/`confirm` |
| Login two steps | Operate | `MudTextField` (`InputType.Password`) then `MudTextField` for the code; `MudButton` for recovery toggle | Prototype accepts any input |
| Help button (?) on each page | both | `MudIconButton` (`Icons.Material.Filled.HelpOutline`) → `MudDialog` | Text from the help table per route |

Dialog and tooltip behaviour in the prototype is native `<dialog>` and a button-driven tooltip. Both map to the MudBlazor components above; the prototype does not implement MudBlazor.

## Route map (v1 parity)

| v1 route | v2 route | Mode | Notes |
|---|---|---|---|
| `#/home` | `#/home` | Persuade | Hero, missão, serviços (ruled list), próximos projetos (date tiles), CTA band |
| `#/quem-somos` | `#/quem-somos` | Persuade | Body text + contact facts |
| `#/servicos` | `#/servicos` | Persuade | Ruled list of active services |
| `#/projetos` | `#/projetos` | Persuade | Type, date, photo filters (`aria-pressed`, focus kept) |
| `#/projeto/:id` | `#/projeto/:id` | Persuade | Facts, photo placeholders, signup form (dynamic fields incl. datetime range), consent, help |
| `#/colaborar` | `#/colaborar` | Persuade | Collaboration form, consent, thank-you panel |
| `#/transparencia` | `#/transparencia` | Persuade | Published editais; download is a text placeholder |
| not found | not found | Persuade | Back-to-home link |
| `#/admin/login` | `#/admin/login` | Operate | Password step, then code step (recovery code toggle) |
| `#/admin` | `#/admin` | Operate | Painel: counts, recent signups and offers, restore sample data |
| `#/admin/paginas` | same | Operate | Hero, mission, quem somos, contact; "Testar" per link (simulated) |
| `#/admin/projetos` | same | Operate | Table: title, type, start, status, signup count |
| `#/admin/projeto/:id` | same (`novo`) | Operate | Dados, fotos (1 MB cap), builder with move/remove/add, live-style preview |
| `#/admin/inscricoes` | same | Operate | Search, status, project filter; CadÚnico masked; CSV export (full data) |
| `#/admin/ofertas` | same | Operate | Status per row |
| `#/admin/editais` | same | Operate | Upload (PDF), publish/archive, delete with confirm, 2 MB confirm |
| `#/admin/administradores` | same | Operate | Toggle active (blocks last Root), temporary Root with end date |
| `#/admin/configuracoes` | same | Operate | Root only: SMTP, LGPD term versions, notification toggles |
| `#/admin/auditoria` | same | Operate | Read-only log |
| `#/admin/ajuda` | same | Operate | FAQ details |
| `#/admin/novidades` | same | Operate | Release notes |

Not ported (deliberate): the A/B/C palette switch and the phone/desktop frame toggle from v1. The v2 direction fixes one palette (oklch tokens seeded from the logo), and viewports are checked at 390, 768, and 1280 px instead of a frame.

Prototype limits: no real authentication (any login is accepted); editais store name and size only (SHA-256 is part of the real build, not this sample); photos are colour placeholders.

## Principles (summary)

## Critique 2026-11-27

Review of the three v2 pages (Home, Projeto + inscrição, Admin › Inscrições) against Nielsen's 10 heuristics and this document. Measured in Playwright at 390 px before the fixes.

| Heuristic | Finding | Fix |
|---|---|---|
| 6 Recognition over recall, 7 Flexibility | At 390 px the signups table is 784 px wide inside a 341 px wrapper. The phone column sits off-screen and is only reachable by sideways scroll. | Below 640 px each row becomes a stacked card. Every cell carries `data-label`, and the header row is visually hidden. No sideways scroll remains. MudTable maps this to `Breakpoint` + `MudTd DataLabel`. |
| 1 Visibility of system status | The admin opens straight into the signups table with no overview of what needs attention. | Painel added: four counts (published projects, new signups, new offers, published editais), each linking to its list. |
| 5 Error prevention | Restore sample data and delete edital were one-click actions. | Destructive actions open a confirmation dialog (`MudMessageBox`). Restore, delete edital, and "make Root" all confirm first. A PDF over 2 MB asks before saving. |
| 9 Help with errors | The signup and collaboration forms list errors, but the admin project builder had no inline error. | Form-level error text with focus moved to it; field-level errors stay in place. |
| 10 Help and documentation | Help existed only on the signup form. | `?` button on every page, with help text from the v1 `pageHelp` table. |
| 8 Aesthetic and minimalist design | Left accent bars on the help cards are a generic card-kit tell. | Replaced by ruled lists (top rule, hairline between items). The date tile stays the only memorable element. |
| 4 Consistency | Public nav used scroll buttons for "Projetos" and "Como ajudar" while the other items were real routes. | All nav items are real routes. Scroll buttons removed. |

Verified after the fixes: no document overflow at 390, 768, or 1280 px; axe-core wcag2a/aa/21aa reports 0 serious or critical violations on all 23 routes in both themes.

Open items from the critique, not fixed here: the public nav wraps to two lines at 390 px (a `MudNavMenu` drawer is the planned replacement); the brand green on the hero band is a fill with dark ink (checked by axe, not by a colour-picker measurement).

## Principles (summary)

1. One memorable thing per page (the date tile in Persuade; the chip column in Operate). Everything else is quiet.
2. Structure encodes information: dates are tiles because they are dates; lists are lists because they are lists. No decorative numbering.
3. Brand green is a fill with dark ink. Never text on paper.
4. Old and low-vision readers come first: Atkinson Hyperlegible, 1.6 line height, 44px touch targets on controls, visible focus rings (3px ink).
5. Pt-BR text only in the UI; copy is plain verbs and sentence case. Buttons say what they do ("Enviar inscrição").
