using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceiroApp.Migrations
{
    /// <inheritdoc />
    public partial class timezone_converter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DataCriacao",
                table: "UsuarioPendente",
                type: "TIMESTAMP",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP ");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataVencimento",
                table: "Lancamentos",
                type: "TIMESTAMP",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP ");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataPagamento",
                table: "Lancamentos",
                type: "TIMESTAMP",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP ",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataLancamento",
                table: "Lancamentos",
                type: "TIMESTAMP",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP ");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataCompetencia",
                table: "Lancamentos",
                type: "TIMESTAMP",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DataCriacao",
                table: "UsuarioPendente",
                type: "TIMESTAMP ",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataVencimento",
                table: "Lancamentos",
                type: "TIMESTAMP ",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataPagamento",
                table: "Lancamentos",
                type: "TIMESTAMP ",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataLancamento",
                table: "Lancamentos",
                type: "TIMESTAMP ",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataCompetencia",
                table: "Lancamentos",
                type: "TIMESTAMP ",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TIMESTAMP");
        }
    }
}
