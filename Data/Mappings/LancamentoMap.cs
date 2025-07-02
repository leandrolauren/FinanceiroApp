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

            builder.Property(l => l.Descricao).HasMaxLength(200);

            builder.Property(l => l.DataLancamento).IsRequired().HasColumnType("TIMESTAMP");

            builder.Property(l => l.DataVencimento).IsRequired().HasColumnType("TIMESTAMP");

            builder.Property(l => l.DataCompetencia).IsRequired().HasColumnType("TIMESTAMP");

            builder.Property(l => l.Pago).IsRequired();

            builder.Property(l => l.DataPagamento).HasColumnType("TIMESTAMP");

            builder
                .HasOne(l => l.ContaBancaria)
                .WithMany()
                .HasForeignKey(l => l.ContaBancariaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(l => l.PlanoContas)
                .WithMany()
                .HasForeignKey(l => l.PlanoContaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(l => l.Pessoa)
                .WithMany()
                .HasForeignKey(l => l.PessoaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(l => l.Usuario)
                .WithMany()
                .HasForeignKey(l => l.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(l => l.LancamentoPai)
                .WithMany(p => p.Parcelas)
                .HasForeignKey(l => l.LancamentoPaiId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
