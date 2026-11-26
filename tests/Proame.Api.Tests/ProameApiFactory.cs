using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Proame.Api.Tests;

/// <summary>
/// Hosts the API in the "Testing" environment: migrations are skipped (see Program.cs),
/// so no PostgreSQL instance is needed. The connection string is a placeholder that is never opened.
/// </summary>
public class ProameApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Proame", "Host=unused.invalid;Database=unused");
    }
}
