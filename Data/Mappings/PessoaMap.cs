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

            builder.Property(p => p.Nome).IsRequired().HasMaxLength(100);

            builder.Property(p => p.Email).HasMaxLength(100);

            builder.Property(p => p.Telefone).HasMaxLength(15);

            builder.Property(p => p.Endereco).HasMaxLength(200);

            builder.Property(p => p.Numero).HasMaxLength(5);

            builder.Property(p => p.Bairro).HasMaxLength(100);

            builder.Property(p => p.Cidade).HasMaxLength(100);

            builder.Property(p => p.Estado).HasMaxLength(50);

            builder.Property(p => p.Complemento).HasMaxLength(150);

            builder.Property(p => p.Cep).HasMaxLength(10);

            builder.Property(p => p.Cnpj).HasMaxLength(20);

            builder.Property(p => p.InscricaoEstadual).HasMaxLength(20);

            builder.Property(p => p.RazaoSocial).HasMaxLength(100);

            builder.Property(p => p.NomeFantasia).HasMaxLength(100);

            builder.Property(p => p.Cpf).HasMaxLength(11);

            builder.Property(p => p.Rg).HasMaxLength(20);

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

            builder
                .HasIndex(p => new { p.UsuarioId, p.Cnpj }, "IX_Pessoa_Usuario_Cnpj")
                .IsUnique()
                .HasFilter("\"Cnpj\" IS NOT NULL");

            builder
                .HasIndex(p => new { p.UsuarioId, p.Cpf }, "IX_Pessoa_Usuario_Cpf")
                .IsUnique()
                .HasFilter("\"Cpf\" IS NOT NULL");
        }
    }
}
