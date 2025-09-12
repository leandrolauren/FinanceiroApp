using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings
{
    public class LancamentoMap : IEntityTypeConfiguration<LancamentoModel>
    {
        public void Configure(EntityTypeBuilder<LancamentoModel> builder)
        {
            builder.ToTable("Lancamentos");

            builder.HasKey(l => l.Id);

            builder.Property(l => l.Tipo).IsRequired().HasConversion<string>().HasMaxLength(10);

            builder.Property(l => l.Valor).IsRequired().HasPrecision(18, 2);

            builder.Property(l => l.Descricao).IsRequired().HasMaxLength(200);

            builder.Property(l => l.OfxFitId).HasMaxLength(150);

            builder
                .Property(l => l.DataLancamento)
                .IsRequired()
                .HasColumnType("TIMESTAMP")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(l => l.DataVencimento).IsRequired().HasColumnType("TIMESTAMP");

            builder.Property(l => l.DataCompetencia).IsRequired().HasColumnType("TIMESTAMP");

            builder.Property(l => l.Pago).IsRequired();

            builder.Property(l => l.DataPagamento).HasColumnType("TIMESTAMP").IsRequired(false);

            builder
                .HasOne(l => l.ContaBancaria)
                .WithMany(c => c.Lancamentos)
                .HasForeignKey(l => l.ContaBancariaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(l => l.PlanoContas)
                .WithMany(p => p.Lancamentos)
                .HasForeignKey(l => l.PlanoContaId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            builder
                .HasOne(l => l.Pessoa)
                .WithMany(p => p.Lancamentos)
                .HasForeignKey(l => l.PessoaId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            builder
                .HasOne(l => l.Usuario)
                .WithMany(u => u.Lancamentos)
                .HasForeignKey(l => l.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            builder
                .HasOne(l => l.LancamentoPai)
                .WithMany(p => p.Parcelas)
                .HasForeignKey(l => l.LancamentoPaiId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(
                l => new { l.UsuarioId, l.DataVencimento },
                "IX_Lancamento_Usuario_Vencimento"
            );
            builder.HasIndex(
                l => new { l.UsuarioId, l.DataCompetencia },
                "IX_Lancamento_Usuario_Competencia"
            );
            builder.HasIndex(
                l => new { l.UsuarioId, l.DataPagamento },
                "IX_Lancamento_Usuario_Pagamento"
            );
            builder.HasIndex(
                l => new
                {
                    l.UsuarioId,
                    l.Tipo,
                    l.Pago,
                },
                "IX_Lancamento_Usuario_Tipo_Pago"
            );
            builder
                .HasIndex(l => new { l.UsuarioId, l.OfxFitId }, "IX_Lancamento_Usuario_FitId")
                .IsUnique()
                .HasFilter("\"OfxFitId\" IS NOT NULL");
        }
    }
}
