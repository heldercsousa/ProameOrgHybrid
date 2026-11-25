# Testing — Reference — Naming conventions + what to test per layer

> Section file. Index: `testing-reference.md`.

## Naming Conventions

### Test Class
`<ClassUnderTest>Tests` — one test class per production class: `ProjectServiceTests`, `ProjectRepositoryTests`, `ProjectsPageTests`.

### Test Method
`MethodName_Condition_ExpectedResult` or a plain sentence when the AC is clearer:
- `CreateProjectAsync_DuplicateName_ReturnsFailureMessage`
- `Save_WhenFormInvalid_DoesNotCallApi`

The first line of the test's comment carries the AC id (`// [AC] REQ-...`, `rules/testing.md`).

## What to Test

### Service — what defines a test boundary
- Business rules, validation, state changes, and the tuple result (`success`, `message`, `entity`).
- Mock every repository and external client with Moq; no database, no HTTP.

### API endpoint — the contract
- Status codes and `ProblemDetails` shape for success, validation failure, not-found, and unauthorised callers.
- Authorization: an anonymous call to an admin endpoint fails; a public endpoint never returns private (LGPD) fields.
- Use `WebApplicationFactory` with the real pipeline and a real PostgreSQL container for data-dependent cases.

### Repository — always test the query, not just CRUD
- Search and filter queries against real PostgreSQL: case and accent handling (`citext`/`unaccent`), paging, ordering, unique constraint enforcement.
- EF configuration: indexes and required columns exist (`database-indexing.md`).

### Component — focus on what the user sees and does
- Rendered state for loading, empty, error and loaded states.
- Commands and callbacks: a click calls the right handler once; disabled actions cannot fire.
- Not tested: MudBlazor internals, CSS layout, pixel positions (device or browser checks cover those).

---
