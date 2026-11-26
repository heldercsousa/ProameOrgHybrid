# Design — solution-scaffold

Authoritative: `CLAUDE.md` § App (Stack, Solution layout) and `Docs/Benchmark/decisions.md`. This file only adds what those do not state.

- **Templates:** `dotnet new maui-blazor-web` (MAUI Blazor Hybrid + Web App with shared RCL) is the starting point; rename/move its projects to `src/Proame.App`, `src/Proame.Web`, `src/Proame.UI`. Remaining projects: `classlib` (Domain, Contracts, Infrastructure), `webapi` minimal API (Api), `xunit` (tests). Remove template sample pages (Counter/Weather).
- **Web render modes:** default static SSR; interactivity is added per page later (admin). The scaffold page needs none.
- **Packages (versions via Context7/NuGet at implementation time, pinned in `Directory.Packages.props`):** MudBlazor, Npgsql.EntityFrameworkCore.PostgreSQL, Microsoft.EntityFrameworkCore.Design, bunit, Microsoft.AspNetCore.Mvc.Testing, xunit, Moq.
- **Config:** `ConnectionStrings:Proame` in `appsettings.Development.json` points to the compose Postgres (`Host=localhost;Port=5432;Database=proame;Username=proame;Password=proame_dev`) — local-dev only; production via Azure App Service settings.
- **Tests:** the `/health` test must not need a running database — the migrate-at-start step is skipped when the environment is `Testing` (documented in `Program.cs`).
- **Out of scope:** entities, auth, admin pages, CI, Azure resources.
