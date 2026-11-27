# Plan — Prototype update (new logo, palette themes, planning decisions)

## Context
The stakeholder provided a new PROAME logo (`assets/Logo-PROAME-2.png`, 2048×768, transparent). The chat decisions so far exist only in backlog READMEs: admin-auth/2FA, Root continuity, LGPD consent, SMTP and notifications, help levels, help center, versioning, and the post-MVP branding item. The prototype (`Docs/Benchmark/prototype/`: plain JS hash router, no build step, published to GitHub Pages) must show the stakeholder these decisions. It also has to let them pick a palette generated from the new logo.

## Execution
- One implementor subagent works in a worktree on branch `task/prototype-update` from `develop`. The `.css` edits need a worktree.
- Steps run in order. Each step ends with a Playwright check.
- At the end, the subagent registers new `Docs/` files in `Proame.sln`, commits, pushes and merges to develop. It also pushes the unpushed `1ebf764`.

## Step 1 — Palettes (Google Material Color Utilities)
- New `Docs/Benchmark/prototype/tools/palette-gen.mjs`, using npm `@material/material-color-utilities` and `sharp` (devDeps in `tools/package.json`, `node_modules` gitignored). Steps:
  1. read the logo pixels;
  2. `QuantizerCelebi` + `Score`;
  3. build `SchemeTonalSpot` light and dark;
  4. emit `themes.css`.
- Themes:
  - **A** = current `#A8CF45`;
  - **B** = top-scored logo seed (default);
  - **C** = the logo's second scored colour, or a blend.
- Selectors are `[data-palette="a|b|c"][data-theme="light|dark"]`. They map to the existing token names in `styles.css:14/61`:
  - `--primary…`, `--secondary…`, `--tertiary…`;
  - `--surface-*`;
  - `--outline*`;
  - `--inverse-*`.
- `--brand`, `--deep*` and the warn/info tokens are derived per theme.
- Switcher:
  - add a "Paleta A/B/C" control next to the "◐ Tema" button (index.html:29);
  - support a `?tema=a|b|c` URL param;
  - save the choice in localStorage `proame-palette`;
  - apply it in the pre-paint inline script (index.html:14-21).
- Add a small caption on the home page so the stakeholder knows to compare.
- Check WCAG AA contrast for on-* pairs (script logs ratios; fails < 4.5).

## Step 2 — Logo asset set (pre-sized, no runtime scaling)
- New `tools/logo-gen.mjs` (sharp) writes `assets/logo/`:
  - `logo-full@1x/2x/3x.png` (height 40/80/120);
  - `logo-symbol@1x/2x/3x.png` (symbol crop for narrow screens);
  - `favicon-32.png`, `favicon-48.png`, `apple-touch-icon.png` (180, opaque);
  - `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`;
  - `store-512.png` (Play) and `store-1024.png` (App Store, no alpha);
  - `og-image.png` (1200×630).
- Wiring:
  - `index.html`: favicon links, apple-touch-icon, `manifest.webmanifest` (new), og:image meta;
  - header `<img>` (app.js:572) → `<picture>` (symbol < 600 px) with srcset.
- **Footer** (app.js:582): replace `<h2>PROAME</h2>` with the logo image (alt "PROAME"), on a light rounded plate since the footer uses `--deep`.
- The organisation name, logo path and contacts come from one `org` object in `data.js`, per the new identity rule. Header and footer read from it.
- Remove the old `proame-logo.png` reference. The file itself is kept for history.
- Add a note in Benchmark README: a vector (SVG) redraw is needed before the store release. MAUI `MauiIcon`/`MauiSplashScreen` take an SVG.

## Step 3 — Mock the planning decisions (pt-BR UI)
Reuse helpers: `adminPage`, `alertBox`, `toast`, `fieldHtml`, `textField`, `areaField`, and the `data-action` switch (~app.js:1270) and submit map (~1404). Add one `dialog(title, html)` helper: an MD3 dialog with an overlay, no native `alert`. New state lives in the `proame-proto` seed (data.js).

1. **Help**:
   - page "?" icon in `adminPage` and the public form pages, opening a dialog with text per page;
   - field help: keep `.help` HelperText and add an info-icon tooltip that opens on tap/focus;
   - field builder (`builderHtml` ~926 / `onFieldProp`) gets a "Texto de ajuda" input bound to `field.help`.
2. **Public forms** (pageProjeto, pageColaborar):
   - the consent checkbox gets a "ler termo (versão N)" link that opens a dialog;
   - `doSignup` stores the term version and a timestamp;
   - add a Turnstile placeholder box ("Verificação anti-robô — Cloudflare Turnstile").
3. **Login** (`doLogin` 746): password, then a 6-digit code step, with a "usar código de recuperação" link. Any code works.
4. **Administradores** (`#/admin/administradores`):
   - list showing Root/Admin, 2FA on/off and last access;
   - actions: deactivate (never delete), promote to temporary Root with an expiry date;
   - a warning banner when there are fewer than 2 active Roots.
5. **Configurações** (`#/admin/configuracoes`, Root only):
   - SMTP form with a write-only password ("••• definida") and a "Enviar e-mail de teste" button;
   - LGPD term editor with a version list (moves the consent text from pagePages; old consents keep their version);
   - notification preferences, where security e-mails are fixed on;
   - a disabled "Identidade visual — Em breve" card.
6. **Auditoria** (`#/admin/auditoria`): table of seeded events (login, 2FA, export CSV, term edit, admin deactivate). Real exports and edits in the prototype append entries.
7. **Central de ajuda** (`#/admin/ajuda`): FAQ accordion with the 9 seed topics from `admin-help-center-faq-user-guide/README.md`.
8. **Novidades** (`#/admin/novidades`): release notes list. The footer shows "versão 0.2.0 · Novidades".
9. Add the new routes to `adminRoute` (532) and the admin nav/dashboard.

## Step 4 — Docs
- Update `Docs/Benchmark/README.md`:
  - fix the stale palette premise (blue/orange) and point to themes A/B/C;
  - add how to regenerate palettes and logos (`node tools/*.mjs`);
  - add the vector-logo gate.
- Register every new `Docs/` file in `Proame.sln` with `python .claude/scripts/sln_nest.py`.

## Verification
- Run `node tools/palette-gen.mjs` and `node tools/logo-gen.mjs`. Both must run without errors, with contrast ratios ≥ 4.5 logged.
- Serve the prototype (`npx http-server Docs/Benchmark/prototype`) and use Playwright at 390 px and 1280 px:
  - every palette × light/dark: home, projeto form (consent dialog, Turnstile box, field tooltip), login with 2FA, every new admin route;
  - `browser_console_messages` shows no errors;
  - take screenshots;
  - the footer logo is visible; the favicon and manifest load (network 200).
- After the merge to develop, the GitHub Pages workflow (`prototype-pages.yml`) runs and the published URL loads.
