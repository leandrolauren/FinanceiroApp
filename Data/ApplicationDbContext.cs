using FinanceiroApp.Data.Mappings;
using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TimeZoneConverter;

namespace FinanceiroApp.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<PessoaModel> Pessoas { get; set; }
    public DbSet<PlanoContasModel> PlanosContas { get; set; }
    public DbSet<LancamentoModel> Lancamentos { get; set; }
    public DbSet<UsuarioModel> Usuarios { get; set; }
    public DbSet<ContaBancaria> ContasBancarias { get; set; }
    public DbSet<UsuarioPendenteModel> UsuariosPendentes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PessoaMap());
        modelBuilder.ApplyConfiguration(new PlanoContaMap());
        modelBuilder.ApplyConfiguration(new LancamentoMap());
        modelBuilder.ApplyConfiguration(new UsuarioMap());
        modelBuilder.ApplyConfiguration(new ContaBancariaMap());
        modelBuilder.ApplyConfiguration(new UsuarioPendenteMap());

        base.OnModelCreating(modelBuilder);
    }
}
