using MudBlazor;

namespace Proame.UI.Theme;

/// <summary>
/// The single MudBlazor theme for all PROAME heads (D8, D11).
/// Colours come from the prototype tokens in Docs/Benchmark/prototype/styles.css.
/// Components reference colours only through MudBlazor <c>Color</c> enums, never hex literals.
/// </summary>
public static class ProameTheme
{
    public static MudTheme Theme { get; } = new()
    {
        PaletteLight = new PaletteLight
        {
            Primary = "#4C6707",
            Secondary = "#586249",
            Tertiary = "#386663",
            Error = "#BA1A1A",
            Background = "#FAFAEF",
            Surface = "#FAFAEF",
            TextPrimary = "#1A1C16",
            AppbarBackground = "#FAFAEF",
            AppbarText = "#1A1C16",
        },
        PaletteDark = new PaletteDark
        {
            Primary = "#B1D74E",
            Secondary = "#C0CBAD",
            Tertiary = "#A0D0CB",
            Background = "#12140E",
            Surface = "#1E201A",
            TextPrimary = "#E2E3D8",
        },
    };
}
