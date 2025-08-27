using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceiroApp.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueCnpjCpf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pessoa_UsuarioId",
                table: "Pessoa");

            migrationBuilder.CreateIndex(
                name: "IX_Pessoa_Usuario_Cnpj",
                table: "Pessoa",
                columns: new[] { "UsuarioId", "Cnpj" },
                unique: true,
                filter: "\"Cnpj\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Pessoa_Usuario_Cpf",
                table: "Pessoa",
                columns: new[] { "UsuarioId", "Cpf" },
                unique: true,
                filter: "\"Cpf\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pessoa_Usuario_Cnpj",
                table: "Pessoa");

            migrationBuilder.DropIndex(
                name: "IX_Pessoa_Usuario_Cpf",
                table: "Pessoa");

            migrationBuilder.CreateIndex(
                name: "IX_Pessoa_UsuarioId",
                table: "Pessoa",
                column: "UsuarioId");
        }
    }
}
