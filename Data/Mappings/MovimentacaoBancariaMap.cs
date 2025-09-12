using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings;

public class MovimentacaoBancariaMap : IEntityTypeConfiguration<MovimentacaoBancaria>
{
    public void Configure(EntityTypeBuilder<MovimentacaoBancaria> builder)
    {
        builder.ToTable("MovimentacoesBancarias");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.DataMovimentacao).IsRequired().HasColumnType("TIMESTAMP");

        builder.Property(m => m.TipoMovimentacao).IsRequired().HasConversion<int>();

        builder.Property(m => m.Valor).IsRequired().HasPrecision(18, 2);

        builder.Property(m => m.Historico).IsRequired().HasMaxLength(255);

        builder
            .HasOne(m => m.ContaBancaria)
            .WithMany()
            .HasForeignKey(m => m.ContaBancariaId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder
            .HasOne(m => m.Lancamento)
            .WithMany()
            .HasForeignKey(m => m.LancamentoId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder
            .HasOne(m => m.Usuario)
            .WithMany()
            .HasForeignKey(m => m.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex(
            m => new { m.ContaBancariaId, m.DataMovimentacao },
            "IX_Movimentacao_Conta_Data"
        );
    }
}
