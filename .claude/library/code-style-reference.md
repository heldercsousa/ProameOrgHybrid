# Code Style Reference

> On-demand reference. Loaded via the `proame-coding` skill or a routing pointer from `.claude/rules/code-principles.md`.
> Language rule: English only — see `CLAUDE.md § Constitutional Constraints`.
> Spec language determinism (prohibited vague terms): see `workflow.md § Spec quality four-gate review`.

## Contents

- [XML Documentation Comments](#xml-documentation-comments)
- [Nullable Reference Types](#nullable-reference-types)
- [C# Style](#c-style)
- [Service Return Patterns](#service-return-patterns)
- [Exception Handling](#exception-handling)
- [Global Usings](#global-usings)
- [Pagination](#pagination)
- [DI Registration Conventions](#di-registration-conventions)
- [UI Rendering Performance](#ui-rendering-performance)
- [Loading Pattern — Lists and Data Loads](#loading-pattern--lists-and-data-loads)
- [Static Analysis Suppressions](#static-analysis-suppressions)

---

## XML Documentation Comments
- **Interfaces are the source of truth for method documentation.** Write `<summary>`, `<param>`, and `<returns>` on the interface method.
- **Implementing types must use `<inheritdoc />`** — never duplicate or rephrase the interface comment.
- Exception: a type may add `<remarks>` for implementation-specific notes, but the base comment must still be `<inheritdoc />`.

```csharp
// Interface — owns the documentation
public interface IProjectService
{
    /// <summary>Creates a new project with the given name.</summary>
    /// <param name="name">The display name for the project.</param>
    /// <returns>(true, message) on success; (false, reason) on failure.</returns>
    Task<(bool success, string message)> CreateProjectAsync(string name);
}

// Implementation — inherits it
public sealed class ProjectService : IProjectService
{
    /// <inheritdoc />
    public async Task<(bool success, string message)> CreateProjectAsync(string name) { ... }
}
```

## Nullable Reference Types
> **Decided by Helder, 2026-11-26 (D9)** — nullable warnings OFF; projects use `<Nullable>annotations</Nullable>` (set in `Directory.Build.props`). The `?` syntax is allowed and documents intent, but the compiler emits no nullable warnings.

- Do not add `= string.Empty` initializers or null guards whose only purpose is to silence the analyzer (real null guards for real nulls are fine).
- Do not change the nullable setting or its suppressed-warning set without an architecture decision.

## C# Style

### Design Principles
- Prefer composition over inheritance

### Modern C# (13+)
- Use `record` for DTOs (in `Proame.Contracts`) and value objects
- Use pattern matching over `if/switch` chains where it reads clearly
- Use `ArgumentNullException.ThrowIfNull`, `ArgumentOutOfRangeException.ThrowIfNegativeOrZero`
- Use collection expressions `[item1, item2]` over `new List<T> { ... }`
- Prefer primary constructors for simple types

### Naming
- Interfaces: `IProjectService`, `IProjectRepository`
- Services: `ProjectService`, `ProjectRepository`
- Razor components: `ProjectsPage.razor` (routable page) / `ProjectForm.razor` (reusable component); code-behind in `ProjectForm.razor.cs`
- Commands and event callbacks: verb + noun, e.g. `OnSaveClicked`, `OnDeleteRequested` (`EventCallback<T>` parameters)
- Async methods: `VerbNounAsync` e.g. `CreateProjectAsync`

### Projects and folders
- Each layer project lives in a folder named after its layer; the project file, assembly and root namespace keep the `Proame.` prefix:

  | Folder | Project file | Root namespace |
  |--------|--------------|----------------|
  | `src/Proame.Domain/` | `Proame.Domain.csproj` | `Proame.Domain` |
  | `src/Proame.Contracts/` | `Proame.Contracts.csproj` | `Proame.Contracts` |
  | `src/Proame.Infrastructure/` | `Proame.Infrastructure.csproj` | `Proame.Infrastructure` |
  | `src/Proame.Api/` | `Proame.Api.csproj` | `Proame.Api` |
  | `src/Proame.UI/` | `Proame.UI.csproj` (Razor Class Library) | `Proame.UI` |
  | `src/Proame.App/` | `Proame.App.csproj` (MAUI Blazor Hybrid head) | `Proame.App` |
  | `src/Proame.Web/` | `Proame.Web.csproj` (Blazor Web App head) | `Proame.Web` |
  | `tests/` | one test project per layer, named `Proame.<Layer>.Tests.csproj` | `Proame.<Layer>.Tests` |

- Business logic lives in the services layer behind the API. `Proame.UI` renders and calls the API; the heads contain no logic.
- A new project follows the same rule: folder `src/Proame.<Layer>/`, project `Proame.<Layer>.csproj`.

### Async
- Always `async/await` for I/O — never `.Result` or `.Wait()`
- Use `CancellationToken` on all async service and API-client methods; components cancel their pending work in `DisposeAsync`
- Debounce for search inputs is a timer or `Task.Delay` cancelled on the next keystroke, owned by the component (not a fire-and-forget task)

### Component Code-Behind Pattern (Razor)
```csharp
// ProjectForm.razor.cs — partial class; markup stays in ProjectForm.razor
public partial class ProjectForm : IAsyncDisposable
{
    [Parameter] public int? ProjectId { get; set; }
    [Parameter] public EventCallback<ProjectDto> OnSaved { get; set; }
    [Inject] private IProjectClient Projects { get; set; } = default!;

    private bool _isLoading = true;
    private ProjectDto? _project;
    private CancellationTokenSource? _cts;

    protected override async Task OnParametersSetAsync()
    {
        _cts?.Cancel();
        _cts = new CancellationTokenSource();
        _isLoading = true;
        _project = ProjectId is null ? new ProjectDto() : await Projects.GetAsync(ProjectId.Value, _cts.Token);
        _isLoading = false;
    }

    public async ValueTask DisposeAsync() => _cts?.Cancel();
}
```
- Markup holds bindings and layout only; no service calls, LINQ over large sets or branching business rules in `.razor`.
- Background-thread updates use `InvokeAsync(StateHasChanged)`.
- Navigation, browser APIs and clocks are injected behind interfaces so bUnit tests can fake them.

## Service Return Patterns
Services return tuples for operations that can fail:
```csharp
// Create: returns (success, message, entity?)
Task<(bool success, string message, Project? project)> CreateProjectAsync(string name, CancellationToken ct);

// Update/Delete: returns (success, message)
Task<(bool success, string message)> UpdateProjectAsync(int id, string name, CancellationToken ct);

// Validation: returns (isValid, message)
(bool isValid, string message) ValidateNameInput(string name);
```

Never throw exceptions for expected business failures (name too long, duplicate, etc.) — return `(false, message)`. The API maps the tuple to HTTP status codes and `ProblemDetails`; the UI shows the message in pt-BR through a `MudAlert` or the form's error summary.

## Exception Handling

### Global handlers
- **API:** a global exception handler (`IExceptionHandler` + `ProblemDetails`) logs unexpected exceptions with full context and returns a generic 500 payload. No stack traces in responses.
- **Heads (App/Web):** the Blazor error boundary plus global handlers for `AppDomain.CurrentDomain.UnhandledException` and `TaskScheduler.UnobservedTaskException` log the error (Fatal/Error) and never swallow it silently.

**Rule:** Do NOT add try-catch for exceptions the global handlers will catch. Let unexpected exceptions bubble up so they are logged with full context.

### Allowed try-catch patterns

**1. Cancellation (OperationCanceledException) — silently ignore:**
```csharp
catch (OperationCanceledException)
{
    // Cancellation requested — silently return
}
```

**2. Disposal races on CancellationTokenSource:**
```csharp
try { _cts?.Cancel(); _cts?.Dispose(); }
catch (ObjectDisposedException) { /* ignore disposal races */ }
```

**3. Error recovery with logging (not swallowed):**
```csharp
catch (Exception ex)
{
    _logger.LogError(ex, "Failed to load more projects (page {Page})", loadingPage);
    _isLoading = false;
    Snackbar.Add("Não foi possível carregar os dados.", Severity.Error);
}
```

**Never:** empty catch blocks that swallow errors silently (except disposal races as above).

## Global Usings

### Directory.Build.props (all projects)
Global usings shared by 2+ projects go here. Verify against the actual `Directory.Build.props` — this section is a convention, not a snapshot.

### Per-project `GlobalUsings.cs`
Applies to 2+ types in one project → add to that project's `GlobalUsings.cs`. Applies across 2+ projects → add to `Directory.Build.props`. Never list namespaces here as a snapshot; read the file.

## Pagination
A single constant in `Proame.Contracts` (e.g. `AppPagination.DefaultPageSize`) is the **single source of truth** for page size, shared by the API and the UI. Never declare a local page-size constant or hard-code the number. Server-side paging is the default for every list; the UI never loads a full table to page it locally.

## DI Registration Conventions
Registration lives in extension methods, composed from the entry points:
- `AddProameServices()` (in `Proame.Infrastructure` / services) — repositories, domain services, storage clients, DB context.
- `AddProameUi()` (in `Proame.UI`) — MudBlazor services, UI state, API client registrations.
- Entry points only compose these: `Program.cs` (Api, Web), `MauiProgram.cs` (App).

Lifetimes:
- `AddSingleton` — shared, read-mostly state (theme/config options, cached settings)
- `AddScoped` — repositories and services (per request on the API; per circuit in Blazor Web/Hybrid)
- `AddTransient` — stateless helpers and HTTP clients' delegating handlers

Never resolve services from a static `IServiceProvider` to get around injection.

## UI Rendering Performance

Large MudBlazor grids and lists re-render on every state change. Rules:
- **One state update per completed load.** Assign the list results and the loading flag in one step, then call `StateHasChanged` once — not one update per row or per field.
- **Server-side paging and filtering.** A grid never holds more rows than the current page; filters and sorting run in the API.
- **Keep render work minimal:** no LINQ over full lists, no service calls and no formatting of every row inside the render path. Compute view data once when the data changes, not in markup.
- **Selection after a reload is cleared**, not restored by re-matching IDs on the UI thread, unless the feature spec requires it.
- Virtualization (`Virtualize`) is the choice for long client-side lists; record the decision in the feature design.

```csharp
// Correct — one update for the loaded page
_rows = page.Items;
_total = page.Total;
_isLoading = false;
StateHasChanged();

// Wrong — per-row updates and LINQ in the render path
foreach (var item in page.Items) { _rows.Add(item); StateHasChanged(); }
```

## Loading Pattern — Lists and Data Loads

**Lists — never hand-roll loading.**
- Every list page uses the shared list component in `Proame.UI` (proposed name `CrudList<TItem>`; the name is fixed by the first feature's design) built on `MudDataGrid` (or `MudTable` for simple lists). The page supplies only the data callback (`ServerData`-style) that calls one API endpoint with the `CancellationToken`.
- The shared component owns: the loading state (`Loading` + `MudSkeleton` placeholders for the first load and for every reload that replaces rows), the search debounce, paging, the empty state, and the error message. A list that needs different loading behaviour changes the shared component in its own task — never a copy in the page.
- Refresh and load-more controls keep the MudBlazor pattern chosen in the feature design; they do not show the full-page skeleton.

**Any other screen that loads data before it can be used** (an edit form, a picker):
- The API call uses `CancellationToken`; a loading flag is set before it and cleared only after the results are applied. The screen shows a `MudSkeleton` (or `MudProgressCircular`) bound to the flag.
- Commands that would write (Save) are disabled while the flag is true. A failed load is caught, logged, shown with a message, and the screen navigates back — it never stays open half-filled.
- Component tests wait for the load to end (bUnit `WaitForState` / `WaitForAssertion`), never a fixed delay.

**Field searches** (autocomplete, remote lookups): the search runs against the API with debounce and a cancellation of the previous request; the field shows `Loading` while a search is running.

**Debug-build delay:** none. Skeletons are checked on a real device or in the browser with throttled network, not by an artificial delay in code.

## Static Analysis Suppressions

**Never add a new suppression** (`#pragma warning disable`, `[SuppressMessage]`, `// ReSharper disable`) without:
1. A comment explaining why the suppression is necessary (one sentence minimum)
2. An expiry comment if the suppression is temporary: `// TODO: Remove after [condition]`
3. Logging the suppression in `.claude/exception-registry.md` if it suppresses a constitutional rule

Suppressions in `Directory.Build.props` are project decisions — do not add to that list without architecture review.

If you cannot fix a warning without suppressing it, log a `blocked: spec gap` status and stop.

---

> **Authorship note:** Content adapted from the inherited governance (`.claude/rules/code-principles.md`, 2026-07-04) to the PROAME stack (MudBlazor, ASP.NET Core API, PostgreSQL). Human-review before relied upon (see `library/authorship-log.md`).
