using System.Globalization;
using AspNetCoreRateLimit;
using DotNetEnv;
using FinanceiroApp.Data;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace FinanceiroApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Carrega variáveis de ambiente do .env
            Env.Load();

            var builder = WebApplication.CreateBuilder(args);

            // Configurações adicionais
            builder
                .Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            builder.Services.AddHttpContextAccessor();

            // Gemini
            builder.Services.AddHttpClient("GeminiClient");
            builder.Services.AddScoped<IGeminiService, GeminiService>();

            // Configuração do banco de dados PostgreSQL
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            );
            builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();
            builder.Services.AddSingleton<IEmailWorker, EmailWorker>();

            builder.Services.AddScoped<IMovimentacaoBancariaService, MovimentacaoBancariaService>();
            builder.Services.AddScoped<IImportacaoService, ImportacaoService>();

            builder.Services.Configure<SmtpSettings>(
                builder.Configuration.GetSection("SmtpSettings")
            );

            // Configuração de autenticação via Cookie
            builder
                .Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.LoginPath = "/Login";
                    options.ExpireTimeSpan = TimeSpan.FromDays(7);
                    options.AccessDeniedPath = "/Login";
                });
            builder
                .Services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft
                        .Json
                        .ReferenceLoopHandling
                        .Ignore;
                });

            builder.Services.AddAuthorization();

            // Habilita Controllers e Views (MVC)
            builder.Services.AddControllersWithViews();

            var rateLimitPeriod = Environment.GetEnvironmentVariable("RATE_LIMIT_PERIOD") ?? "1m";
            var rateLimitLimit = int.TryParse(
                Environment.GetEnvironmentVariable("RATE_LIMIT_LIMIT"),
                out var lim
            )
                ? lim
                : 15;

            builder.Services.AddMemoryCache();
            builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
            builder.Services.AddInMemoryRateLimiting();

            builder.Services.Configure<IpRateLimitOptions>(options =>
            {
                options.EnableEndpointRateLimiting = true;
                options.StackBlockedRequests = false;
                options.RealIpHeader = "X-Real-IP";
                options.ClientIdHeader = "X-ClientId";
                options.HttpStatusCode = 429;
                options.GeneralRules = new List<RateLimitRule>
                {
                    new RateLimitRule
                    {
                        Endpoint = "*",
                        Period = rateLimitPeriod,
                        Limit = rateLimitLimit,
                    },
                };
            });
            builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
            builder.Services.AddInMemoryRateLimiting();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "FinanceiroApp API", Version = "v1" });
            });

            var app = builder.Build();

            var emailWorker = app.Services.GetRequiredService<IEmailWorker>();
            Task.Run(() => emailWorker.Start());

            // Middlewares
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FinanceiroApp API V1");
                    c.RoutePrefix = "swagger";
                });
            }

            // Cultura brasileira (pt-BR)
            var supportedCultures = new[] { new CultureInfo("pt-BR") };
            app.UseRequestLocalization(
                new RequestLocalizationOptions
                {
                    DefaultRequestCulture = new RequestCulture("pt-BR"),
                    SupportedCultures = supportedCultures,
                    SupportedUICultures = supportedCultures,
                }
            );

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseIpRateLimiting();
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            // Rota padrão MVC
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}"
            );

            app.MapFallbackToController("Index", "Home");
            app.MapControllers();

            app.Run();
        }
    }
}
