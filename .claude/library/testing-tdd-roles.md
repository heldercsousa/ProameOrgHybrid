# Testing — Reference — Tester/Builder split + TDD workflow + running tests

> Section file. Index: `testing-reference.md`. The never-miss rules (Builder must not modify tests) are in `rules/testing.md`.

## Tester/Builder Role Separation

### Why it matters
A test written by the same pass that writes the code tends to encode the code's behaviour rather than the acceptance criterion. Separating the two roles keeps the tests tied to the spec.

### Rules
- **Tester** writes the failing test from the acceptance criterion (Red). Tester does not write production code.
- **Builder** writes the minimal production code to pass (Green). Builder does not edit tests.
- **Refactor** happens after Green with all tests passing; the tests are not changed to make a refactor easier.
- Test-file changes after Red require a spec change first (`rules/testing.md`).

### Dispatch pattern (from `workflow.md`)
- One Tester subagent and one Builder subagent, in sequence, never in parallel on the same feature.
- The task-log records which role wrote which change.

## TDD Workflow (Red → Green → Refactor)

1. **Red** — write one test for one AC; run it; confirm it fails for the right reason (not a compile error or a missing setup).
2. **Green** — write the minimal production code; run the test; confirm it passes; run the whole test project.
3. **Refactor** — clean up with the tests green; run again.

### Regression tests
Bug fix: write the failing regression test first, confirm the failure, fix, confirm the pass (`bug-tracking.md`).

### One test at a time
Single-agent sessions add one test, make it pass, then add the next. Batching tests hides which change made which test pass.

## Running Tests

- Whole solution: `dotnet test Proame.sln`
- One project: `dotnet test tests/Proame.Api.Tests/Proame.Api.Tests.csproj`
- One test: `dotnet test --filter "FullyQualifiedName~ProjectServiceTests"`
- Testcontainers tests need a running Docker engine; they are not skipped silently. A missing Docker engine is a blocked environment, not a pass.
- Coverage and mutation testing are periodic (`mutation-testing-stryker.md`), not per commit.

---
