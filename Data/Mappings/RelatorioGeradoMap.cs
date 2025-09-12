using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings;

public class RelatorioGeradoMap : IEntityTypeConfiguration<RelatorioGeradoModel>
{
    public void Configure(EntityTypeBuilder<RelatorioGeradoModel> builder)
    {
        builder.ToTable("RelatoriosGerados");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.TipoRelatorio).IsRequired().HasMaxLength(100);

        builder.Property(r => r.Parametros).IsRequired().HasColumnType("jsonb");

        builder.Property(r => r.Status).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.Property(r => r.Resultado).HasColumnType("jsonb");

        builder.Property(r => r.DataSolicitacao).IsRequired();

        builder
            .HasOne(r => r.Usuario)
            .WithMany()
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.UsuarioId, r.DataSolicitacao }, "IX_Relatorio_Usuario_Data");
    }
}
