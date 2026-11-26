using Microsoft.Extensions.Logging;
using Proame.UI.DependencyInjection;
using Proame.UI.Services;
using Proame.Services;

namespace Proame;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        // Add device-specific services used by the Proame.UI project
        builder.Services.AddSingleton<IFormFactor, FormFactor>();
        builder.Services.AddProameUi();

        builder.Services.AddMauiBlazorWebView();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
