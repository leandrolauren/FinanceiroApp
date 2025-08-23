using System.Globalization;
using System.Reflection;
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

            // Configuração do banco de dados PostgreSQL
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            );
            builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();
            builder.Services.AddSingleton<IEmailWorker, EmailWorker>();

            builder.Services.Configure<SmtpSettings>(
                builder.Configuration.GetSection("SmtpSettings")
            );

            // Configuração de autenticação via Cookie
            builder
                .Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.LoginPath = "/Login";
                    options.ExpireTimeSpan = TimeSpan.FromHours(2);
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

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            // Rota padrão MVC
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}"
            );
            app.MapControllers();

            app.Run();
        }
    }
}
