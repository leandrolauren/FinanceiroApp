using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceiroApp.Data.Mappings
{
    public class PessoaMap : IEntityTypeConfiguration<PessoaModel>
    {
        public void Configure(EntityTypeBuilder<PessoaModel> builder)
        {
            builder.ToTable("Pessoa");

            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).ValueGeneratedOnAdd().UseIdentityColumn();

            builder.Property(p => p.Nome).IsRequired().HasColumnType("TEXT").HasMaxLength(100);

            builder.Property(p => p.Email).HasColumnType("TEXT").HasMaxLength(100);

            builder.Property(p => p.Telefone).HasColumnType("TEXT").HasMaxLength(15);

            builder.Property(p => p.Endereco).HasColumnType("TEXT").HasMaxLength(200);

            builder.Property(p => p.Numero).HasColumnType("TEXT").HasMaxLength(5);

            builder.Property(p => p.Bairro).HasColumnType("TEXT").HasMaxLength(100);

            builder.Property(p => p.Cidade).HasColumnType("TEXT").HasMaxLength(100);

            builder.Property(p => p.Estado).HasColumnType("TEXT").HasMaxLength(50);

            builder.Property(p => p.Complemento).HasColumnType("TEXT").HasMaxLength(150);

            builder.Property(p => p.Cep).HasColumnType("TEXT").HasMaxLength(10);

            builder.Property(p => p.Cnpj).HasColumnType("TEXT").HasMaxLength(20);

            builder.Property(p => p.InscricaoEstadual).HasColumnType("TEXT").HasMaxLength(20);

            builder.Property(p => p.RazaoSocial).HasColumnType("TEXT").HasMaxLength(100);

            builder.Property(p => p.NomeFantasia).HasColumnType("TEXT").HasMaxLength(100);

            builder.Property(p => p.Cpf).HasColumnType("TEXT").HasMaxLength(11);

            builder.Property(p => p.Rg).HasColumnType("TEXT").HasMaxLength(20);

            builder
                .Property(p => p.DataNascimento)
                .HasColumnType("DATE")
                .HasDefaultValueSql("CURRENT_DATE");

            builder.Property(p => p.Tipo).HasColumnType("INTEGER").IsRequired();

            builder
                .HasOne(p => p.Usuario)
                .WithMany(u => u.Pessoas)
                .HasForeignKey(p => p.UsuarioId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            //Indices
            builder.HasIndex(p => p.Nome, "IX_Pessoa_Nome").IsUnique(false);

            builder.HasIndex(p => p.Email, "IX_Pessoa_Email").IsUnique(true);
        }
    }
}
