# Testing — Reference — Test types — service, endpoint, repository, component + database fixture

> Section file. Index: `testing-reference.md`. Level guidance by risk: `rules/testing.md § TDD Level Guidance by Risk`.

## Test Types

### 1. Unit Tests — Services (Moq)

**What:** business logic in `Proame.Api` services (or the service layer behind the API). Mock every repository interface.

**Do NOT:** start EF Core, connect to PostgreSQL, or test repository implementation here.

```csharp
public sealed class ProjectServiceTests
{
    private readonly Mock<IProjectRepository> _repo = new();
    private ProjectService CreateSut() => new(_repo.Object);

    [Fact]
    // [AC] REQ-PROJ-01: a duplicate name is rejected with a message
    public async Task CreateProjectAsync_DuplicateName_ReturnsFailure()
    {
        _repo.Setup(r => r.ExistsByNameAsync("Centro", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var (success, message, project) = await CreateSut().CreateProjectAsync("Centro", CancellationToken.None);

        Assert.False(success);
        Assert.Null(project);
        Assert.NotEmpty(message);
    }
}
```

### 2. Component Tests — bUnit

**What:** rendered state and user interactions of a Razor component in `Proame.UI`, with its dependencies replaced by fakes.

**Setup:** `TestContext` with MudBlazor services registered (`Services.AddMudServices()`), API clients replaced by fakes that return controlled results, navigation replaced by a fake of the navigation wrapper.

```csharp
[Fact]
// [AC] REQ-PROJ-07: the list shows a skeleton until the first page is loaded
public void Projects_WhileLoading_ShowsSkeleton()
{
    using var ctx = new TestContext();
    ctx.Services.AddMudServices();
    ctx.Services.AddSingleton<IProjectClient>(new FakeProjectClient(delay: true));

    var cut = ctx.Render<ProjectsPage>();

    Assert.NotEmpty(cut.FindComponents<MudSkeleton>());
}
```

**Do NOT:** test MudBlazor internals, CSS, or call `NavigationManager` directly. Wait for asynchronous state with `WaitForState` / `WaitForAssertion`, never `Task.Delay`.

### 3. Integration Tests — Repositories (Testcontainers PostgreSQL)

**What:** real EF Core + Npgsql against a PostgreSQL container. Verifies queries, indexes, collation/`citext`/`unaccent` behaviour, unique constraints, and entity configuration.

```csharp
public sealed class ProjectRepositoryTests(PostgresFixture db) : IClassFixture<PostgresFixture>
{
    [Fact]
    // [AC] REQ-PROJ-12: search ignores case and accents
    public async Task Search_IsCaseAndAccentInsensitive()
    {
        await using var context = db.CreateContext();
        var repo = new ProjectRepository(context);
        context.Projects.Add(new Project { Name = "Ação Social" });
        await context.SaveChangesAsync();

        var results = await repo.SearchAsync("acao social", CancellationToken.None);

        Assert.Single(results);
    }
}
```

**Why real PostgreSQL and not EF InMemory:** the in-memory provider does not replicate `ILIKE`, `citext`, `unaccent`, or transaction and constraint behaviour. Repository tests must run against PostgreSQL to catch those bugs. An accent-insensitive search test must exercise the mapped `immutable_unaccent` DbFunction (or the nondeterministic ICU collation) and assert that `Ação` matches `acao`; `EF.Functions.ILike` alone is case-insensitive only and must not be asserted to match accents.

### Infrastructure: `PostgresFixture`

- Starts one PostgreSQL container per test collection (Testcontainers), applies the EF Core migrations, and hands out a `DbContext` per test.
- Each test runs inside a transaction or on a freshly truncated schema, so tests do not depend on each other's data.
- Fixture code is infra: exempt from AC traceability.
- Never mock `DbContext`.

### Endpoint Tests — `WebApplicationFactory`

- Runs the API pipeline in memory with the PostgreSQL fixture as the database.
- Asserts status codes, `ProblemDetails` shape, authorization (anonymous and non-admin callers), and that private fields never appear on public endpoints.

---
