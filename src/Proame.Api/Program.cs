using Microsoft.EntityFrameworkCore;
using Proame.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Proame")));

var app = builder.Build();

// D10: migrations run at API start-up, before the app serves requests.
// Skipped in the "Testing" environment so tests need no running database.
if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.MapGet("/health", () => Results.Ok());

app.Run();

// Exposes the entry point to Proame.Api.Tests (WebApplicationFactory<Program>).
public partial class Program { }
