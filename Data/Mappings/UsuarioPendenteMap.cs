using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings
{
    public class UsuarioPendenteMap : IEntityTypeConfiguration<UsuarioPendenteModel>
    {
        public void Configure(EntityTypeBuilder<UsuarioPendenteModel> builder)
        {
            builder.ToTable("UsuarioPendente");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(100).IsUnicode(false);
            builder.Property(u => u.Token).IsRequired().HasMaxLength(36).IsUnicode(false);
            builder
                .Property(u => u.DataCriacao)
                .IsRequired()
                .HasColumnType("DATE")
                .HasDefaultValueSql("CURRENT_DATE");
            ;
        }
    }
}
