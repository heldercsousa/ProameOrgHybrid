# Database Setup — PostgreSQL, EF Core, Migrations, Local Dev

> On-demand reference. Stack: PostgreSQL via EF Core + Npgsql (`src/Proame.Infrastructure`), served by `src/Proame.Api`. Local dev runs PostgreSQL and Azurite in Docker Compose. Exact package versions come from `Directory.Packages.props`.

## Local Development

- **Start dependencies:** `docker compose up -d` from the repo root (PostgreSQL + Azurite for Blob Storage). The compose file is the only source of local ports and volumes.
- **Connection string:** from user secrets or environment variables (`.env.local` is git-ignored; `.env.local.example` lists the keys). Never commit a connection string or password.
- **Load env for shell work:** `. .\.claude\scripts\load-env.ps1` (PowerShell) before running `dotnet ef`.

## Migrations

- Migrations live in `src/Proame.Infrastructure/Migrations/` — sequential-only files (`rules/workflow.md § Sequential-only file registry`).
- Create: `dotnet ef migrations add <Name> --project src/Proame.Infrastructure --startup-project src/Proame.Api`
- Apply to local DB: `dotnet ef database update --project src/Proame.Infrastructure --startup-project src/Proame.Api`
- List: `dotnet ef migrations list --project src/Proame.Infrastructure --startup-project src/Proame.Api`
- Never edit an applied migration; add a new one. Never hand-write DDL against a shared database.
- Migrations that enable PostgreSQL extensions (`citext`, `unaccent`, `pg_trgm`) are explicit `migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS ...")` steps, reviewed in the feature design.
- **Decided by Helder, 2026-11-26 (D10):** EF Core migrations are applied automatically at API start-up, in `src/Proame.Api/Program.cs`, before `app.Run()`. Never run them from the MAUI or Web heads.

  ```csharp
  // src/Proame.Api/Program.cs — before app.Run()
  await using (var scope = app.Services.CreateAsyncScope())
  {
      var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
      await db.Database.MigrateAsync();
  }
  app.Run();
  ```

- With more than one API instance, migrations must not run concurrently. Keep a single instance during deploy, or move migrations to a deploy step (that would be a new decision).

## Startup Project

- The API (`src/Proame.Api`) is the EF Core startup project. The Infrastructure project holds the `DbContext` and configurations and must not depend on the UI heads.
- If a design-time factory is needed for `dotnet ef`, it lives in `Proame.Infrastructure` and reads the same configuration keys as the API.

## Connection and Npgsql Configuration

- Configure Npgsql in one place (the Infrastructure registration extension, `AddProameServices()`), including command timeout and retry-on-failure policy chosen in the design.
- Enable `citext` and `unaccent` in the database before any migration that uses them.
- Use `AsNoTracking()` for read-only queries (`efcore-patterns` skill).
- Timezone: store timestamps as `timestamptz` (UTC) — display conversion is a UI concern.

## Tests

- Repository and integration tests use a **real PostgreSQL container** via Testcontainers, started once per test collection and reset per test (transaction rollback or truncate). Never EF Core InMemory (`rules/testing.md`).
- Test code creates the schema by applying migrations, so that the tests exercise the same schema as production.
- Test connection strings come from the Testcontainers fixture, never from developer configuration.

## Azure

- Production database: Azure Database for PostgreSQL Flexible Server, under PROAME's own subscription.
- Connection secrets: App Service configuration or Key Vault reference — never in source or in `appsettings*.json`.
- Backups and point-in-time restore policy are recorded in the infra spec.

## Troubleshooting

- `password authentication failed` → check the connection string keys in user secrets / `.env.local`.
- `extension "citext" does not exist` → the migration that enables extensions has not run on this database.
- Migrations out of order after a branch merge → resolve with the migration rename/renumber procedure in the feature task, not by editing applied migrations.

---
