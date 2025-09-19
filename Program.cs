using System.Globalization;
using System.Reflection;
using AspNetCoreRateLimit;
using DotNetEnv;
using FinanceiroApp.Data;
using FinanceiroApp.Hubs;
using FinanceiroApp.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.HttpOverrides;
using QuestPDF.Infrastructure;

namespace FinanceiroApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Carrega variáveis de ambiente do .env
            Env.Load();

            QuestPDF.Settings.License = LicenseType.Community;

            var builder = WebApplication.CreateBuilder(args);

            // Configurações adicionais
            builder
                .Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables();

            // --- CONFIGURAÇÃO DE FORWARDED HEADERS (MUITO IMPORTANTE PARA PROXY REVERSO) ---
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | 
                                         ForwardedHeaders.XForwardedProto | 
                                         ForwardedHeaders.XForwardedHost;
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
                options.RequireHeaderSymmetry = false;
            });

            // --- Service Registration ---

            builder.Services.AddHttpContextAccessor();

            // Infrastructure
            var connectionString = Environment.GetEnvironmentVariable("DefaultConnection") 
                ?? builder.Configuration.GetConnectionString("DefaultConnection");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            }
            
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString)
            );

            var rateLimitPeriod = Environment.GetEnvironmentVariable("RATE_LIMIT_PERIOD") ?? "1m";
            var rateLimitLimit = int.TryParse(
                Environment.GetEnvironmentVariable("RATE_LIMIT_LIMIT"),
                out var lim
            )
                ? lim
                : 15;

            builder.Services.AddMemoryCache();
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

            // Redis Cache for AI conversation history
            var redisConnectionString = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING")
                ?? throw new InvalidOperationException("A variável de ambiente REDIS_CONNECTION_STRING) não foi encontrada.");
            builder.Services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
            });

            // Application Services
            builder.Services.AddScoped<IMovimentacaoBancariaService, MovimentacaoBancariaService>();
            builder.Services.AddScoped<IImportacaoService, ImportacaoService>();
            builder.Services.AddScoped<ILancamentoService, LancamentoService>();
            builder.Services.AddScoped<IPessoaService, PessoaService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IRelatorioFinanceiroService, RelatorioFinanceiroService>();
            builder.Services.AddScoped<IRelatorioAppService, RelatorioAppService>();

            // AI Services
            builder.Services.AddHttpClient("GeminiClient");
            builder.Services.AddScoped<IGeminiService, GeminiService>();
            builder.Services.AddScoped<IAgentActionService, AgentActionService>();

            // Messaging & Background Workers
            builder.Services.AddSingleton<RabbitMqService>();
            builder.Services.AddSingleton<IRabbitMqService>(provider => provider.GetRequiredService<RabbitMqService>());
            builder.Services.AddHostedService<EmailWorker>();
            builder.Services.AddHostedService<RelatorioFinanceiroWorker>();
            builder.Services.AddHostedService<RelatorioInterativoWorker>();
            builder.Services.AddHostedService<ExtratoCategoriaWorker>();

            // Settings
            builder.Services.Configure<SmtpSettings>(
                builder.Configuration.GetSection("SmtpSettings")
            );

            // Authentication & Authorization
            builder
                .Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.LoginPath = "/Login";
                    options.ExpireTimeSpan = TimeSpan.FromDays(7);
                    options.AccessDeniedPath = "/Login";
                    // IMPORTANTE: Configure cookies para funcionar com proxy reverso
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                });
            builder.Services.AddAuthorization();

            // MVC, API & Documentation
            builder.Services.AddControllersWithViews();
            builder
                .Services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft
                        .Json
                        .ReferenceLoopHandling
                        .Ignore;
                });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                // Adiciona informações gerais sobre a API
                options.SwaggerDoc(
                    "v1",
                    new OpenApiInfo
                    {
                        Version = "v1",
                        Title = "FinanceiroApp API",
                        Description = "API para gerenciamento financeiro.",
                        Contact = new OpenApiContact
                        {
                            Name = "Leandro Laurenzette",
                            Email = "leadrolaurenzette@gmail.com",
                        },
                        License = new OpenApiLicense
                        {
                            Name = "Licença MIT",
                            Url = new Uri("https://opensource.org/licenses/MIT"),
                        },
                    }
                );

                var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
            });

            // SignalR
            builder.Services.AddSignalR();

            var app = builder.Build();

            // --- CONFIGURAÇÃO DE MIDDLEWARES (ORDEM MUITO IMPORTANTE!) ---

            // 1. PRIMEIRO: UseForwardedHeaders (deve ser o primeiro middleware)
            app.UseForwardedHeaders();

            // 2. Middleware personalizado para corrigir scheme e host
            app.Use((context, next) =>
            {
                // Force HTTPS se vier do proxy
                var forwardedProto = context.Request.Headers["X-Forwarded-Proto"].FirstOrDefault();
                if (!string.IsNullOrEmpty(forwardedProto))
                {
                    context.Request.Scheme = forwardedProto;
                }

                // Corrige o host para incluir a porta correta
                var forwardedHost = context.Request.Headers["X-Forwarded-Host"].FirstOrDefault();
                var forwardedPort = context.Request.Headers["X-Forwarded-Port"].FirstOrDefault();
                
                if (!string.IsNullOrEmpty(forwardedHost))
                {
                    if (!string.IsNullOrEmpty(forwardedPort) && forwardedPort != "443" && forwardedPort != "80")
                    {
                        context.Request.Host = new HostString($"{forwardedHost}:{forwardedPort}");
                    }
                    else
                    {
                        context.Request.Host = new HostString(forwardedHost);
                    }
                }

                return next();
            });

            // 3. Exception handling
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            // 4. Swagger (desenvolvimento)
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FinanceiroApp API V1");
                    c.RoutePrefix = "swagger";
                });
            }

            app.UseReDoc(options =>
            {
                options.DocumentTitle = "FinanceiroApp API - Documentação";
                options.SpecUrl = "/swagger/v1/swagger.json";
                options.RoutePrefix = "docs";
            });

            // 5. Cultura brasileira (pt-BR)
            var supportedCultures = new[] { new CultureInfo("pt-BR") };
            app.UseRequestLocalization(
                new RequestLocalizationOptions
                {
                    DefaultRequestCulture = new RequestCulture("pt-BR"),
                    SupportedCultures = supportedCultures,
                    SupportedUICultures = supportedCultures,
                }
            );

            // 6. REMOVA OU COMENTE UseHttpsRedirection quando usando proxy reverso
            // app.UseHttpsRedirection(); // <-- COMENTADO PARA PROXY REVERSO
            
            // 7. Static files
            app.UseStaticFiles();

            // 8. Rate limiting
            app.UseIpRateLimiting();
            
            // 9. Routing
            app.UseRouting();

            // 10. Authentication & Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // 11. Routes
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}"
            );

            app.MapFallbackToController("Index", "Home");
            app.MapControllers();
            app.MapHub<RelatorioHub>("/relatorioHub");

            app.Run();
        }
    }
}