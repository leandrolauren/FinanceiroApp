using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings
{
    public class PlanoContaMap : IEntityTypeConfiguration<PlanoContasModel>
    {
        public void Configure(EntityTypeBuilder<PlanoContasModel> builder)
        {
            builder.ToTable("PlanoConta");

            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).ValueGeneratedOnAdd().UseIdentityColumn();

            builder.Property(p => p.Descricao).IsRequired().HasMaxLength(100);

            builder.Property(p => p.Tipo).IsRequired().HasConversion<int>();

            // Indices
            builder.HasIndex(
                p => new { p.UsuarioId, p.Descricao },
                "IX_PlanoConta_Usuario_Descricao"
            );

            builder
                .HasOne(p => p.PlanoContasPai)
                .WithMany(p => p.Filhos)
                .HasForeignKey(p => p.PlanoContasPaiId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(p => p.Usuario)
                .WithMany(u => u.Planos)
                .HasForeignKey(p => p.UsuarioId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
