using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackCoffe.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDemoSeedUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "Email", "FullName", "PasswordHash", "Phone" },
                values: new object[] { "julio.cesar.ticas.demo@blackcoffe.local", "Julio Cesar Ticas Palencia", "$2a$11$bzzpUCmyByk3zrJB0cfJnugs.2Zpwcik4x66YBFeF8r2wHKJfl2F6", "50370001122" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "Email", "FullName", "PasswordHash", "Phone" },
                values: new object[] { "julio.cesar.ticas.demo@blackcoffe.local", "Julio Cesar Ticas Palencia", "$2a$11$bzzpUCmyByk3zrJB0cfJnugs.2Zpwcik4x66YBFeF8r2wHKJfl2F6", "50370001122" });
        }
    }
}

