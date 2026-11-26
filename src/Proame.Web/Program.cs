using Proame.UI.DependencyInjection;
using Proame.UI.Services;
using Proame.Web.Components;
using Proame.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Static server-side rendering by default (design.md). Pages opt into interactivity individually later.
builder.Services.AddRazorComponents();

// Device-specific services used by the Proame.UI project
builder.Services.AddSingleton<IFormFactor, FormFactor>();
builder.Services.AddProameUi();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();

app.MapRazorComponents<App>()
    .AddAdditionalAssemblies(typeof(Proame.UI._Imports).Assembly);

app.Run();
