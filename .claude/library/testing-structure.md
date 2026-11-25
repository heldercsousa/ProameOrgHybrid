# Testing — Reference — Test project structure

> Section file. Index: `testing-reference.md`.

## Test Project Structure

Tests live under `tests/`, one project per layer, named after the production project:

```
tests/
├── Proame.Domain.Tests/          ← invariants of domain types (Level A where logic exists)
├── Proame.Api.Tests/             ← service tests (Moq) + endpoint tests (WebApplicationFactory)
├── Proame.Infrastructure.Tests/  ← repository tests against real PostgreSQL (Testcontainers)
└── Proame.UI.Tests/              ← Razor component tests (bUnit)
```

Layout inside a project follows the production folders (`Services/`, `Endpoints/`, `Repositories/`, `Components/`). Test doubles and builders shared by several projects live in one `Proame.Tests.Shared` project (infra; exempt from AC traceability).

- **Services:** `Services/<Entity>ServiceTests.cs`
- **Repositories:** `Repositories/<Entity>RepositoryTests.cs`
- **Components:** `Components/<Name>Tests.cs` (bUnit)

Heads (`Proame.App`, `Proame.Web`) have no test project of their own; their wiring is covered by the endpoint and component tests and by device/browser checks.

### .csproj — project-specific deltas only
- Package versions come from `Directory.Packages.props` (central package management). Test packages: xUnit, Moq, bUnit, Testcontainers.PostgreSQL, Microsoft.AspNetCore.Mvc.Testing (endpoint tests), coverlet.
- Reference only the production projects the tests need. Test projects do not reference the heads.
- Test SDK and target framework match the solution (`net10.0`).

### Global usings
- Keep test global usings to xUnit, Moq, and the production namespaces the project uses most (`Proame.Contracts`, `Proame.Domain`). Per-project `GlobalUsings.cs` only when 2+ test types use it (`code-style-reference.md § Global Usings`).

---
