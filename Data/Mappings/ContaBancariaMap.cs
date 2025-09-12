using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings
{
    public class ContaBancariaMap : IEntityTypeConfiguration<ContaBancaria>
    {
        public void Configure(EntityTypeBuilder<ContaBancaria> builder)
        {
            builder.ToTable("ContaBancaria");

            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id).ValueGeneratedOnAdd().UseIdentityColumn();

            builder.Property(c => c.Descricao).IsRequired().HasMaxLength(50);

            builder.Property(c => c.NumeroConta).HasMaxLength(20);

            builder.Property(c => c.Agencia).HasMaxLength(3);

            builder.Property(c => c.DigitoAgencia).HasMaxLength(3);

            builder.Property(c => c.DigitoConta).HasMaxLength(3);

            builder.Property(c => c.Tipo).IsRequired().HasConversion<string>().HasMaxLength(20);

            builder.Property(c => c.Saldo).HasPrecision(18, 2);

            builder.Property(c => c.Ativa).IsRequired();

            builder.Property(c => c.Banco).HasMaxLength(100);

            builder
                .HasOne(c => c.Usuario)
                .WithMany()
                .HasForeignKey(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // Índices
            builder.HasIndex(
                c => new { c.UsuarioId, c.Descricao },
                "IX_ContaBancaria_Usuario_Descricao"
            );
        }
    }
}
