# CRUD Page Design Laws — Page migration checklist + spec-first development

> Section file. Index + never-miss rules: `crud-pages.md`.

## Page migration checklist

Use when migrating an existing CRUD list page to `CrudList` (or building a new one from scratch).

**Markup (`.razor`)**
- [ ] Routable with `@page`; `[Authorize]` present on every admin route
- [ ] Single `<CrudList>` element as page content — no hand-built table, skeleton, selection bar, empty state or dialog in the page markup
- [ ] Required parameters set (`Query`, `EmptyTitle`, `SearchPlaceholder`; `OnAdd`/`OnEdit`/`OnDelete` as the page supports them)
- [ ] Column or row templates are entity-specific and use MudBlazor components only
- [ ] Page title set through the shared title mechanism

**Code-behind (`.razor.cs`)**
- [ ] Data callback (`Query`) calls one API endpoint with `CancellationToken`
- [ ] Navigation through the navigation wrapper, not `NavigationManager` directly
- [ ] `DisposeAsync` cancels pending work
- [ ] No row-click, selection or search handlers — `CrudList` owns them

**API and services**
- [ ] Endpoint returns `(items, total)` with server-side paging and sorting
- [ ] Business rules live in the service layer; the endpoint maps the service tuple to HTTP results
- [ ] Authorization enforced on the endpoint, not only in the UI

**DI**
- [ ] Services and repositories registered in the feature's `AddProameServices()` extension; UI registrations in `AddProameUi()`

---

## Spec-First Development

Every new CRUD feature gets a spec before any code is written. Use the spec folder structure of the feature (`Docs/Management/[section-or-filing-dir]/[feature]/`) — the files below:

| File | What it answers |
|------|----------------|
| `Docs/Management/[section-or-filing-dir]/[feature]/requirements.md` | What the feature must do. User stories, acceptance criteria, data model, validation rules, out-of-scope. |
| `Docs/Management/[section-or-filing-dir]/[feature]/design.md` | How it works technically. Architecture layers, interfaces, page structure, interaction flows, error handling, key decisions. |
| `Docs/Management/[section-or-filing-dir]/[feature]/tasks.md` | Ordered, checkboxed implementation steps. Checked off as work completes. |

The spec is the contract. Code that contradicts the spec is a bug or a spec update — one of the two must change.

**Requirement syntax (GEARS):** Write acceptance criteria as `shall` statements:
```
When [trigger], the [subject] shall [behavior].
While [state], the [subject] shall [behavior].
If [condition], then the [subject] shall [behavior].
```
One behavior per sentence. One sentence per line.

### Collaborative workflow — how to start a new CRUD with Claude

1. **Brainstorm** — invoke `superpowers:brainstorming`. Discuss the feature together: data model, UX flows, edge cases, approaches. Reach agreement on the design before any writing.
2. **Write spec** — Claude writes `Docs/Management/[section-or-filing-dir]/[feature]/requirements.md`, `design.md`, `tasks.md` based on the agreed design. User reviews and approves.
3. **Write plan** — invoke `superpowers:writing-plans`. Claude produces `Docs/Management/[section-or-filing-dir]/[feature]/plan.md` — the step-by-step implementation plan with code templates.
4. **Implement** — invoke `superpowers:executing-plans` (or `superpowers:subagent-driven-development`). Follow the plan task by task, building against the spec.
5. **Review** — invoke `superpowers:requesting-code-review` after each major task or phase.

Never skip straight to implementation. Brainstorm → Spec → Plan → Implement → Review, in that order.

---
