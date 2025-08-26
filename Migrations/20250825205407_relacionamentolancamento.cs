using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceiroApp.Migrations
{
    /// <inheritdoc />
    public partial class relacionamentolancamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lancamentos_Pessoa_PessoaModelId",
                table: "Lancamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Lancamentos_PlanoConta_PlanoContasModelId",
                table: "Lancamentos");

            migrationBuilder.DropIndex(
                name: "IX_Lancamentos_PessoaModelId",
                table: "Lancamentos");

            migrationBuilder.DropIndex(
                name: "IX_Lancamentos_PlanoContasModelId",
                table: "Lancamentos");

            migrationBuilder.DropColumn(
                name: "PessoaModelId",
                table: "Lancamentos");

            migrationBuilder.DropColumn(
                name: "PlanoContasModelId",
                table: "Lancamentos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PessoaModelId",
                table: "Lancamentos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlanoContasModelId",
                table: "Lancamentos",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lancamentos_PessoaModelId",
                table: "Lancamentos",
                column: "PessoaModelId");

            migrationBuilder.CreateIndex(
                name: "IX_Lancamentos_PlanoContasModelId",
                table: "Lancamentos",
                column: "PlanoContasModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lancamentos_Pessoa_PessoaModelId",
                table: "Lancamentos",
                column: "PessoaModelId",
                principalTable: "Pessoa",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Lancamentos_PlanoConta_PlanoContasModelId",
                table: "Lancamentos",
                column: "PlanoContasModelId",
                principalTable: "PlanoConta",
                principalColumn: "Id");
        }
    }
}
