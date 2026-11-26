using System.Net;
using Xunit;

namespace Proame.Api.Tests;

public class HealthEndpointTests(ProameApiFactory factory) : IClassFixture<ProameApiFactory>
{
    // [AC] REQ-SCF-09: GET /health returns 200.
    [Fact]
    public async Task Health_ReturnsOk()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
