using Bunit;
using Xunit;
using Proame.UI.DependencyInjection;
using Proame.UI.Pages;

namespace Proame.UI.Tests;

public class HomePageTests : BunitContext
{
    public HomePageTests()
    {
        Services.AddProameUi();
        JSInterop.Mode = JSRuntimeMode.Loose;
    }

    // [AC] REQ-SCF-09: the home page (/) renders "Início".
    [Fact]
    public void HomePage_RendersInicioHeading()
    {
        var cut = Render<Home>();

        Assert.Contains("Início", cut.Markup);
    }
}
