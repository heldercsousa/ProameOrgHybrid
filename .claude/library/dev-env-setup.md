# Developer Environment Setup

> On-demand reference. Exact tool versions come from `global.json`, `Directory.Packages.props` and the `.csproj` files, never from this file.

## Required Tools

| Tool | Used for | Notes |
|------|----------|-------|
| .NET 10 SDK | Build and test every project | Pin with `global.json` once created |
| .NET MAUI workloads (`dotnet workload install maui`) | `Proame.App` (Android, iOS, Windows, macOS heads) | Android SDK via the MAUI workload; iOS/macOS builds need a Mac host |
| Docker Desktop (or Docker Engine) | `docker compose` for PostgreSQL and Azurite; Testcontainers | Required for repository and endpoint tests |
| Android emulator (Android Studio) | Device checks for the Hybrid head | Clean-build rule in `rules/workflow.md` (E2E gate) |
| Azure CLI | Azure resources and deployment (App Service, PostgreSQL Flexible Server, Blob Storage) | Under PROAME's own accounts |
| `gh` CLI | GitHub pull requests and issues | |
| Node.js (optional) | Playwright MCP / browser checks for the web head | Version from the MCP configuration |

## Solution Bootstrap

1. Clone the repository and check out `develop`.
2. `dotnet restore Proame.sln`
3. `docker compose up -d` (PostgreSQL + Azurite)
4. Copy `.env.local.example` to `.env.local` and fill in the keys you need (git-ignored).
5. `dotnet build Proame.sln` — expect 0 errors.
6. `dotnet test Proame.sln` — requires Docker for the Testcontainers suites.

## Environment Variables and Secrets

- Keys are listed in `.env.local.example`; values live in `.env.local` or user secrets, never in source or `appsettings*.json`.
- Load them into a PowerShell session with `. .\.claude\scripts\load-env.ps1`.
- Azure secrets reach production through App Service configuration or Key Vault references.

## Android Release Signing

- Release builds for Android need a keystore. The keystore path, alias and passwords are supplied through environment variables or CI secrets, referenced from the `Proame.App` project's Release configuration — never committed.
- The keystore file itself is stored outside the repository (secure backup owned by Helder).
- Deployment command names are in `.claude/commands/`; the Google Play or sideload distribution route is decided in the release spec.

## Troubleshooting

- `Docker engine is not running` in tests → start Docker Desktop; Testcontainers tests do not skip silently.
- MAUI Android build fails after a branch switch with resource errors → delete the Android `obj/` and `bin/` output for `Proame.App` and rebuild (the clean-build rule in `rules/workflow.md`).
- `dotnet ef` cannot connect → check the connection string keys in `.env.local` and that the container is healthy (`docker compose ps`).

---
