# Requirements — solution-scaffold

Sources: `CLAUDE.md` (Stack, Solution layout, Constitutional Constraints), `Docs/Benchmark/decisions.md` (D1, D2, D8–D11).

| AC | Criterion |
|----|-----------|
| REQ-SCF-01 | `global.json` pins the .NET 10 SDK (rollForward `latestFeature`); `dotnet build Proame.sln` succeeds with 0 errors on Windows. |
| REQ-SCF-02 | Projects exist and are in `Proame.sln`: `src/Proame.Domain`, `src/Proame.Contracts`, `src/Proame.Infrastructure`, `src/Proame.Api`, `src/Proame.UI` (Razor Class Library), `src/Proame.App` (MAUI Blazor Hybrid), `src/Proame.Web` (Blazor Web App), plus `tests/Proame.Domain.Tests`, `tests/Proame.Api.Tests`, `tests/Proame.UI.Tests` (xUnit; bUnit in UI tests). |
| REQ-SCF-03 | Reference direction: Domain ← Contracts ← Infrastructure ← Api; UI references Contracts only; App and Web reference UI only (thin heads, no pages of their own beyond the host). |
| REQ-SCF-04 | `Directory.Build.props` sets `net10.0`, `<Nullable>annotations</Nullable>` (D9), `ImplicitUsings` enabled, `TreatWarningsAsErrors` false. Central package versions in `Directory.Packages.props`. |
| REQ-SCF-05 | `Proame.UI` registers MudBlazor via `AddProameUi()`; `src/Proame.UI/Theme/ProameTheme.cs` defines a `MudTheme` with light and dark palettes matching the tokens in `Docs/Benchmark/prototype/styles.css` (primary `#4C6707` light / `#B1D74E` dark, brand `#A8CF45` as fill only). |
| REQ-SCF-06 | One shared home page (`/`) in `Proame.UI` renders the PROAME layout (MudLayout + app bar, pt-BR text "Início") in both the Web head and the App head. |
| REQ-SCF-07 | `Proame.Api` uses EF Core + Npgsql with an `AppDbContext` (no entities yet beyond an initial empty migration) and applies migrations at start-up (D10); exposes `GET /health` returning 200. |
| REQ-SCF-08 | `docker-compose.yml` at the repo root starts PostgreSQL 17 and Azurite; the connection string comes from configuration/user-secrets, never hard-coded credentials in committed files except the local-dev compose defaults. |
| REQ-SCF-09 | `dotnet test Proame.sln` passes: at least one bUnit test asserting the home page renders "Início", and one API test asserting `/health` returns 200 (WebApplicationFactory; DB access replaced or Testcontainers). |
| REQ-SCF-10 | The Android head builds (`dotnet build src/Proame.App -f net10.0-android`) with 0 errors. iOS/macOS build not required on Windows. |
