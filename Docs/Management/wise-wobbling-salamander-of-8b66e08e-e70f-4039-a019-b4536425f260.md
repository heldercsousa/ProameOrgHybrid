# Plan — Alternative "v2" prototype (2-3 pages) from the Gemini UI/UX research

## Evaluation of the research
**Useful:**
- Its main point is to stop the agent producing generic, templated UI ("AI slop"):
  - decide the aesthetic direction before writing markup;
  - critique the result against Nielsen's heuristics afterwards;
  - check semantics and accessibility (ARIA) with an audit;
  - use modern CSS: `oklch()`, `color-mix()`, fluid `clamp()` type.
- It separates two modes. "Operate" is for the admin area: dense, easy to scan. "Persuade" is for the public pages: expressive. This split fits PROAME well.
- The .NET MAUI DevFlow MCP lets us inspect the real BlazorWebView on Android and iOS. It is experimental. It is worth evaluating later, when the app exists, not now.
- It says skills and Playwright do not prove WCAG compliance and recommends a separate axe audit. That is correct, and the rules do not yet require one.

**Weak or conflicting:**
- The research assumes MD3 is optional. In PROAME, MD3 comes from a constitutional decision: MudBlazor is the only component library.
  - Its two paths are custom CSS/Tailwind or Fluent UI Blazor. Custom CSS/Tailwind means hand-rolling data grids, dialogs and forms. Fluent UI Blazor would be a second library. Both break the constitution.
  - **Realistic path:** keep MudBlazor and restyle it beyond the MD3 defaults: `MudTheme`, typography, shape, density, plus CSS overrides. Without MudBlazor, v2 could not be built in practice.
  - So the v2 prototype must only use visuals that MudBlazor theming and overrides can reproduce. No layouts that need custom components.
- The star counts, "10/10/2026" benchmarks and token figures cannot be verified. I treat them as indicative only.
- Mobbin is paid and Figma was already rejected (2026-06-02). Both are excluded.

**Verdict:** worth a small try. It is a cheap way to see whether a non-MD3 look is clearly better. If it is, adopting it is an architectural decision for Helder: how far we restyle MudBlazor. It is not a library swap.

## Scope — v2 sample, current prototype untouched
- Location: `Docs/Benchmark/prototype/v2/`.
  - It is published by the existing Pages workflow at `/v2/`.
  - It reuses `../assets/logo/` and a trimmed copy of the `data.js` seed. It has its own `styles.css` and `app.js`, with no build step.
  - v1 gets one link, "Ver alternativa v2", and v2 links back.
- 3 pages:
  1. **Home**, in Persuade mode: hero, projects, how to help.
  2. **Projeto + inscrição**, a public form: consent, field help, Turnstile placeholder.
  3. **Admin › Inscrições**, in Operate mode: dense table, filters, status chips.
- Light and dark themes, logo-derived brand colour in `oklch()`, and the WCAG AA rule (brand green as a fill with dark ink).

## Process
1. Use the built-in `frontend-design` skill for the aesthetic direction, written to `v2/DESIGN.md`: type pairing, spacing, shape, motion, and what replaces MD3.
   - Optional: install Impeccable (`npx impeccable install`, third-party) only for its `critique` step. It is skipped if the install touches more than `.claude/skills`.
2. One implementor subagent works in a worktree on `task/prototype-v2`, because of the `.css` rule.
3. Verify with Playwright at 390 / 768 / 1280 px, light and dark:
   - no horizontal overflow;
   - 0 console errors;
   - axe-core injected through `browser_evaluate`, with 0 serious or critical issues;
   - screenshots of v1 and v2 side by side for Helder.
4. Register the new `Docs/` files and the two Gemini files in `Docs/Chats` with `sln_nest.py`. Then commit, fast-forward develop and push. Pages redeploys.

## Also: cleanup of earlier leftovers
- Delete the stray `step1-390-palC-light.png` in the repo root.
- Stop the Python server on port 8765.
- Delete the stale remote branch `task/prototype-header`.
- Prune the finished worktrees.
- Commit the pending `Proame.sln` change together with the Gemini file registration.
- Record the vector-logo gate in the store-release backlog item. It is currently only in the Benchmark README.
- Palette C light: tone down the bright `#79ff57` note box.
