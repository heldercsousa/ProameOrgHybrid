# Testing — Reference

> Family index. Read ONLY the section file the task needs. Routing rules and never-miss items: `rules/testing.md`.

| File | Covers |
|------|--------|
| `testing-structure.md` | Test project structure (csproj per layer, GlobalUsings, package versions from `Directory.Packages.props`) |
| `testing-conventions.md` | Naming conventions + what to test per layer (service, API endpoint, repository, component) |
| `testing-test-types.md` | Test types — service (Moq), API endpoint, repository (Testcontainers PostgreSQL), component (bUnit) + the database fixture |
| `testing-tdd-roles.md` | Tester/Builder split, TDD workflow, running tests |
| `testing-quality-audit.md` | Quality-audit checklist, Builder-must-not-modify rule, anti-patterns |
| `mutation-testing-stryker.md` | Periodic mutation testing (Stryker.NET) |
| `property-based-testing-fscheck.md` | Property-based testing for invariant-heavy methods |

Generic xUnit, Moq, bUnit and Testcontainers setup is not repeated here; use the Context7 MCP at the manifest versions for API questions.
