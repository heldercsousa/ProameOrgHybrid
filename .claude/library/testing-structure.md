> **PROAME note:** inherited from MyVocaList governance. Stack-specific passages (.NET MAUI, DevExpress, Syncfusion, XAML, EF Core/SQLite, Android device steps) apply ONLY if the chosen stack is .NET; otherwise apply the stack-neutral principle and ignore the specifics. Chosen stack: see `Docs/Benchmark/benchmark.md`.

# Testing — Reference — Test project structure (csproj deltas, GlobalUsings)

> Section file split from `testing-reference.md` on 2026-07-14 (token-scoped reads). Index + provenance: `testing-reference.md`. Never-miss rules: `.claude/rules/testing.md`.

## Test Project Structure

### Project: `PROAME.Tests`

```
PROAME.Tests/
├── PROAME.Tests.csproj
├── GlobalUsings.cs
├── Unit/
│   ├── Services/              ← pure business logic, Moq dependencies
│   │   └── VenueServiceTests.cs
│   └── ViewModels/            ← ViewModel commands + state, Moq services
│       └── VenuesViewModelTests.cs
├── Integration/
│   └── Repositories/          ← real SQLite temp DB, no containers
│       └── VenueRepositoryTests.cs
└── Infrastructure/
    └── TestDbContextFactory.cs ← shared DB setup/teardown helper
```

### .csproj — project-specific deltas only

Generic test-project setup (csproj skeleton, xUnit/Moq/coverlet packages, conditional `OutputType` trick for referencing the app head) → **`maui-unit-testing` skill § Test Project Setup**. PROAME-specific facts:

- **TFM is `net10.0` only** (NOT `net10.0-android`) so tests run on the desktop host.
- Add `Microsoft.EntityFrameworkCore.Sqlite` `10.*` (repository integration tests use real SQLite).
- Reference the five non-MAUI projects: `PROAME.Domain`, `PROAME.Contracts`, `PROAME.Infra`, `PROAME.Services`, `PROAME.Extensions` (folder `Extensions/`; folder naming: `code-style-reference.md § C# Style › Projects and folders`).
- Do NOT reference `PROAME.csproj` (MAUI head) unless ViewModel tests are needed; if referenced, apply the skill's conditional `<OutputType>Library</OutputType>` on the `net10.0` TFM.

### GlobalUsings.cs

```csharp
global using Xunit;
global using Moq;
global using PROAME.Domain.Entities;
global using PROAME.Domain.Interfaces;
global using PROAME.Contracts.DTOs.List;
global using PROAME.Services;
```

---
