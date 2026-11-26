using Microsoft.Extensions.DependencyInjection;
using MudBlazor.Services;

namespace Proame.UI.DependencyInjection;

/// <summary>Registers the services every PROAME head needs to render the shared UI.</summary>
public static class ProameUiServiceCollectionExtensions
{
    /// <summary>Adds MudBlazor services used by <c>Proame.UI</c> components.</summary>
    public static IServiceCollection AddProameUi(this IServiceCollection services)
    {
        services.AddMudServices();
        return services;
    }
}
