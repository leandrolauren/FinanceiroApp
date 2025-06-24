using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceiroApp.Migrations
{
    /// <inheritdoc />
    public partial class Add_PersonType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Tipo",
                table: "Pessoa",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Pessoa");
        }
    }
}
