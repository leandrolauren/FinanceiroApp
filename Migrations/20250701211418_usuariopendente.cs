using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceiroApp.Migrations
{
    /// <inheritdoc />
    public partial class usuariopendente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Lancamentos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "UsuarioPendente",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", unicode: false, maxLength: 100, nullable: false),
                    SenhaHash = table.Column<string>(type: "text", nullable: false),
                    Token = table.Column<string>(type: "character varying(36)", unicode: false, maxLength: 36, nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "DATE", nullable: false, defaultValueSql: "CURRENT_DATE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioPendente", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UsuarioPendente");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Lancamentos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}
