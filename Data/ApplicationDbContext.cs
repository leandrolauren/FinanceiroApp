using FinanceiroApp.Data.Mappings;
using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TimeZoneConverter;

namespace FinanceiroApp.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<PessoaModel> Pessoas { get; set; }
    public DbSet<PlanoContasModel> PlanosContas { get; set; }
    public DbSet<LancamentoModel> Lancamentos { get; set; }
    public DbSet<UsuarioModel> Usuarios { get; set; }
    public DbSet<ContaBancaria> ContasBancarias { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PessoaMap());
        modelBuilder.ApplyConfiguration(new PlanoContaMap());
        modelBuilder.ApplyConfiguration(new LancamentoMap());
        modelBuilder.ApplyConfiguration(new UsuarioMap());
        modelBuilder.ApplyConfiguration(new ContaBancariaMap());

        var brazilTimeZone = TZConvert.GetTimeZoneInfo("America/Sao_Paulo");

        var dateTimeProperties = modelBuilder
            .Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?));

        foreach (var property in dateTimeProperties)
        {
            if (property.ClrType == typeof(DateTime))
            {
                property.SetValueConverter(
                    new ValueConverter<DateTime, DateTime>(
                        v =>
                            TimeZoneInfo.ConvertTimeToUtc(
                                DateTime.SpecifyKind(v, DateTimeKind.Unspecified),
                                brazilTimeZone
                            ),
                        v => TimeZoneInfo.ConvertTimeFromUtc(v, brazilTimeZone)
                    )
                );
            }
            else if (property.ClrType == typeof(DateTime?))
            {
                property.SetValueConverter(
                    new ValueConverter<DateTime?, DateTime?>(
                        v =>
                            v.HasValue
                                ? TimeZoneInfo.ConvertTimeToUtc(
                                    DateTime.SpecifyKind(v.Value, DateTimeKind.Unspecified),
                                    brazilTimeZone
                                )
                                : v,
                        v =>
                            v.HasValue
                                ? TimeZoneInfo.ConvertTimeFromUtc(v.Value, brazilTimeZone)
                                : v
                    )
                );
            }
        }
        base.OnModelCreating(modelBuilder);
    }
}
