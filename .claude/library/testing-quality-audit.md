# Testing — Reference — Quality-audit checklist + Builder-must-not-modify + anti-patterns

> Section file. Index: `testing-reference.md`.

## Test Quality Audit Checklist

### For each test method
- [ ] Traces to exactly one acceptance criterion (`// [AC] REQ-...` first line)
- [ ] Arranges through the public surface of the unit, not private state
- [ ] Asserts an observable outcome (return value, persisted row, rendered output, API response)
- [ ] Fails for the right reason when the behaviour is removed (checked during Red)
- [ ] Does not depend on test order, wall-clock time, or network

### For each test class
- [ ] Uses the correct double: Moq for services, real PostgreSQL for repositories, bUnit fakes for components
- [ ] No `Task.Delay` used to wait for state; uses `WaitForState` / `WaitForAssertion` or awaits the task
- [ ] Shared setup is not hiding the assertion's inputs

### Audit frequency
- At code review for every feature (the traceability matrix in the task-log).
- Periodic audit on the whole suite before a release candidate.

## Builder Must Not Modify Tests

The Builder edits production code only during Green. A test that will not pass is a spec question, not a test to edit: stop, log `blocked: spec gap`, escalate to Helder. Editing a test to pass, commenting out an assertion, weakening a fixture, or deleting a failing test is forbidden (`rules/testing.md`).

## Anti-Patterns — Never Do These

| Anti-pattern | Why | Do instead |
|--------------|-----|------------|
| EF Core InMemory provider for repository tests | Does not replicate PostgreSQL behaviour | Testcontainers PostgreSQL |
| Mocking `DbContext` | Query translation never runs | Real PostgreSQL fixture |
| `Task.Delay` to wait for UI or async state | Flaky and slow | `WaitForState` / `WaitForAssertion` |
| Calling `NavigationManager` or JS interop in component tests | Needs a running host | Fake the navigation wrapper / JS wrapper |
| Asserting MudBlazor CSS classes or pixel layout | Tests the library, breaks on upgrade | Assert the component's own state and parameters |
| Testing the heads (`Proame.App`, `Proame.Web`) directly | Heads hold no logic | Test the RCL component and the endpoint |
| Snapshot tests of whole pages | Noisy, hides intent | Assert specific rendered elements tied to ACs |
| Sharing mutable test data between tests | Order-dependent failures | Fresh data per test |

---
