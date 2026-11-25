# Build Command (`/pro-build`)

Build the PROAME solution and verify it is clean. The solution has the API, the shared UI RCL, the Blazor Web head and the MAUI Blazor Hybrid head.

## Steps

1. **Run the build:**
   ```
   dotnet build Proame.sln
   ```
   When a change touches only the MAUI head, also run `dotnet build src/Proame.App/Proame.App.csproj -f net10.0-android`.

2. **Interpret output:**
   - `Build succeeded` with 0 errors → clean. Warnings are acceptable unless they are new warnings introduced by the current change.
   - Any `error` line → must fix before proceeding.
   - Razor compile warnings and MAUI linker warnings → investigate but do not block if pre-existing.

3. **Fix errors autonomously** using the relevant reference:
   - Razor / MudBlazor compile errors → MudBlazor MCP at the manifest version, then `proame-coding`
   - Component parameter or binding errors → `library/crud-listview.md`, `library/code-style-reference.md § Component Code-Behind Pattern`
   - DI / service errors → `dependency-injection-patterns` skill, `library/code-style-reference.md § DI Registration Conventions`
   - EF Core / Npgsql errors → `efcore-patterns` skill, `library/database-setup.md`
   - Deprecated or removed .NET / MAUI API → `maui-current-apis` skill

4. **After 3 consecutive failed fix attempts on the same error:**
   - Stop looping.
   - Identify which skill or rule file is most relevant.
   - Report the error to Helder with context and ask for guidance.
   - Never present work as complete while errors remain.

## Notes
- Always build the whole solution, not only the library projects — Razor and head-level compilation only run in the heads.
- Android is the default MAUI target; iOS and Mac targets are specified by Helder.
- Builds needing Docker (Testcontainers) are tested with `/pro-review` or the test commands in `library/testing-tdd-roles.md`, not here.
