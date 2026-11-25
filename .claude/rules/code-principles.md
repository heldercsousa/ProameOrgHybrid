# Code Principles — Routing Table

> Detailed patterns live in `.claude/library/code-style-reference.md`, loaded on demand via the `proame-coding` skill. The `##` headings below are cross-referenced by `§` anchor from other files — keep them.

## Architecture Constraints
Defined in `CLAUDE.md § Constitutional Constraints` and the solution layout line in `CLAUDE.md § App`. "Business logic in the service/API layer" is unamendable: pages and components in `Proame.UI` render and bind; they never hold business rules.

## C# Style / Naming
`library/code-style-reference.md § C# Style` (design principles, modern C# 13+, naming, async, component code-behind pattern). Also: XML docs (`<inheritdoc />` rule), nullable reference types (enabled), global usings, pagination (single source of truth), static-analysis suppressions — each a `§` of the same file.

## Service Return Patterns
`library/code-style-reference.md § Service Return Patterns` — tuple returns `(bool success, string message, T? entity)`; never throw for expected business failures.

## Exception Handling
`library/code-style-reference.md § Exception Handling` — API global exception handler (ProblemDetails) and UI error boundary categories + the allowed try-catch patterns; no silent-swallow catches.

## DI Registration Conventions
`library/code-style-reference.md § DI Registration Conventions` — Singleton (shared state, theme/config) / Scoped (per-request or per-circuit services, Blazor components) / Transient (lightweight stateless helpers). Registration lives in extension methods: `AddProameServices()` (API/Infrastructure), `AddProameUi()` (`Proame.UI`), called from `Program.cs` (Api, Web) and `MauiProgram.cs` (App).

## UI Rendering and Data Loads
`library/code-style-reference.md § Loading Pattern — Lists and Data Loads` — every list and every screen that loads data follows the shared loading pattern (MudBlazor `Loading` / skeleton state, one state assignment per completed load, no service calls inside markup). Lists derive from the shared list base component; never hand-roll loading, paging or skeleton logic per page.

Persistence constraints: `constraints-registry.md § EF Core / PostgreSQL`. Design skills: `modern-csharp-coding-standards`, `dependency-injection-patterns`, `efcore-patterns`.
