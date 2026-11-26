# Task log — solution-scaffold

---
## Task: solution-scaffold (T1–T7)
**Plan:** Docs/Management/cross-cutting/solution-scaffold/tasks.md
**Status:** Done (verifier PASS 2026-11-26; merged `44f2402`)
**Started:** 2026-11-26
**Completed:** 2026-11-26

### Changed files:
- `global.json`, `Directory.Build.props`, `Directory.Packages.props`, `.editorconfig`, `docker-compose.yml`, `dotnet-tools.json` (local dotnet-ef 10.0.15)
- `Proame.sln` (10 projects added; Docs solution folders untouched)
- `src/Proame.Domain/Proame.Domain.csproj`
- `src/Proame.Contracts/Proame.Contracts.csproj`
- `src/Proame.Infrastructure/Proame.Infrastructure.csproj`, `Data/AppDbContext.cs`, `Migrations/` (InitialCreate, empty model, + snapshot)
- `src/Proame.Api/Proame.Api.csproj`, `Program.cs`, `appsettings.json`, `appsettings.Development.json`
- `src/Proame.UI/Proame.UI.csproj`, `Theme/ProameTheme.cs`, `DependencyInjection/ProameUiServiceCollectionExtensions.cs`, `Layout/MainLayout.razor`, `Pages/Home.razor`, `Pages/NotFound.razor` (pt-BR), `Routes.razor`, `_Imports.razor`, `wwwroot/app.css`
- `src/Proame.App/Proame.App.csproj`, `MauiProgram.cs`, `wwwroot/index.html` (pt-BR, MudBlazor assets); template MAUI files otherwise unchanged
- `src/Proame.Web/Proame.Web.csproj`, `Program.cs`, `Components/App.razor`, `Components/_Imports.razor`, `Components/Pages/Error.razor` (pt-BR)
- `tests/Proame.Domain.Tests/Proame.Domain.Tests.csproj` (no tests yet; no Domain logic)
- `tests/Proame.UI.Tests/Proame.UI.Tests.csproj`, `HomePageTests.cs`
- `tests/Proame.Api.Tests/Proame.Api.Tests.csproj`, `ProameApiFactory.cs`, `HealthEndpointTests.cs`
- Spec: `design.md` (impl-decision notes), `tasks.md` (T1–T7 ticked), this file

Removed from the template: Counter, Weather, NavMenu, Bootstrap assets, ReconnectModal, interactive render modes (static SSR per design).

### Build notes
Build: passed (0 errors) — `dotnet build Proame.sln` (11 projects, 0 errors; NU1507 DevExpress source warning comes from the machine-level NuGet config, not the repo) | Android: `dotnet build src/Proame.App/Proame.App.csproj -f net10.0-android` 0 errors (CS1591 XML-doc warnings only) | Tests: 2 passed, 0 failed (UI 1, API 1; Domain 0 tests) | `docker compose config` valid, no containers started | Commit SHA: `fa99674` (merge `44f2402`)

Pinned versions (Directory.Packages.props): Microsoft.Maui.Controls 10.0.20 (matches installed maui workload 10.0.20), Microsoft.AspNetCore.Components.WebView.Maui 10.0.20, MudBlazor 9.14.0, Npgsql.EntityFrameworkCore.PostgreSQL 10.0.4, Microsoft.EntityFrameworkCore(.Design) 10.0.15, Microsoft.AspNetCore.Components.Web 10.0.15, Microsoft.Extensions.Logging.Debug 10.0.15, bunit 2.15.2, Microsoft.AspNetCore.Mvc.Testing 10.0.15, xunit 2.9.3, xunit.runner.visualstudio 4.0.1, Microsoft.NET.Test.Sdk 18.12.0, Moq 4.21.0. Docker: postgres:17, azurite:3.22.0.

Files written and re-read: `Proame.App/MauiProgram.cs`, `Proame.App/wwwroot/index.html`, `Proame.Web/Components/App.razor`, `Proame.Web/Program.cs`, `Proame.UI/Layout/MainLayout.razor`, `Proame.UI/Theme/ProameTheme.cs`, `Proame.Api/Program.cs`, `Directory.Build.props`, `design.md`, `tasks.md`.

### AC traceability

| AC | Criterion | Implementation | Test / evidence |
|----|-----------|----------------|-----------------|
| REQ-SCF-01 | global.json pins SDK 10, solution builds 0 errors | `global.json` (10.0.115, latestFeature) | `dotnet build Proame.sln` 0 errors |
| REQ-SCF-02 | Projects exist and are in Proame.sln | `src/*`, `tests/*`, `Proame.sln` | `dotnet sln` registration; solution build |
| REQ-SCF-03 | Reference direction Domain ← Contracts ← Infrastructure ← Api; UI → Contracts; App/Web → UI | csproj `ProjectReference`s | Solution build; direction checked by inspection |
| REQ-SCF-04 | Directory.Build.props net10.0, Nullable annotations, ImplicitUsings, TreatWarningsAsErrors false; CPM | `Directory.Build.props`, `Directory.Packages.props` | Solution build |
| REQ-SCF-05 | AddProameUi registers MudBlazor; MudTheme light/dark palettes | `Theme/ProameTheme.cs`, `DependencyInjection/ProameUiServiceCollectionExtensions.cs` | Build; palette values match the brief (not visually verified) |
| REQ-SCF-06 | Shared home page with MudLayout + app bar, "Início", in both heads | `Pages/Home.razor`, `Layout/MainLayout.razor`; Web + App host it | Web: `GET /` returns HTML containing "Início" (manual run, HTTP 200). App: Android build only, no emulator run; bUnit `HomePageTests` |
| REQ-SCF-07 | AppDbContext + Npgsql, initial empty migration, migrate at start-up, GET /health 200 | `Proame.Infrastructure/Data/AppDbContext.cs`, `Migrations/*InitialCreate*`, `Proame.Api/Program.cs` | `HealthEndpointTests.Health_ReturnsOk`. Runtime migration against a live PostgreSQL NOT executed (no container started) |
| REQ-SCF-08 | docker-compose: Postgres 17 + Azurite; credentials only as local-dev defaults | `docker-compose.yml`, `appsettings.Development.json` | `docker compose config` valid; containers not started |
| REQ-SCF-09 | Tests: bUnit home page "Início"; API /health 200 | `tests/Proame.UI.Tests/HomePageTests.cs`, `tests/Proame.Api.Tests/HealthEndpointTests.cs` | `dotnet test Proame.sln`: 2 passed, 0 failed |
| REQ-SCF-10 | Android head builds with 0 errors | `src/Proame.App/Proame.App.csproj` | `dotnet build src/Proame.App -f net10.0-android`: 0 errors |

### Test level decision
- REQ-SCF-01..08 and 10 are Level C (plumbing, configuration, DI, build): no automated test; evidence is build, inspection or a manual run, as recorded above (testing.md risk table).

### Follow-ups
- Interactive render mode for the Web head before the first interactive page (see Design concern).
- App icon, splash and `colors.xml` still use the template purple `#512BD4`; replace with PROAME branding.
- Live check of migrate-at-start against the compose PostgreSQL; App head on an Android emulator.

### Design concern
- Design §Web render modes (static SSR) vs MudBlazor docs: MudBlazor providers (`MudThemeProvider`, `MudPopoverProvider`, etc.) are documented as needing an interactive render mode. The scaffold renders them statically; this is not a failure today but interactivity must be added before the first interactive page (admin). For Helder's review.

### Assumptions / blockers
- None blocking. Windows apphost "SAC" messages seen once during an early build did not recur.
- Spec gaps closed as impl decisions (see `design.md` "Spec updated 2026-11-26" notes).
