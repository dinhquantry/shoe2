using backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260328093000_MoveProductImagesToProduct")]
    public partial class MoveProductImagesToProduct : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                table: "ProductImages",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE ProductImages pi
                INNER JOIN ProductVariants pv ON pi.ProductVariantId = pv.Id
                SET pi.ProductId = pv.ProductId;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_ProductImages_ProductVariants_ProductVariantId",
                table: "ProductImages");

            migrationBuilder.AlterColumn<int>(
                name: "ProductId",
                table: "ProductImages",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId",
                table: "ProductImages",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductImages_Products_ProductId",
                table: "ProductImages",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropIndex(
                name: "IX_ProductImages_ProductVariantId",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "ProductImages");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                table: "ProductImages",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE ProductImages pi
                INNER JOIN (
                    SELECT ProductId, MIN(Id) AS ProductVariantId
                    FROM ProductVariants
                    GROUP BY ProductId
                ) pv ON pi.ProductId = pv.ProductId
                SET pi.ProductVariantId = pv.ProductVariantId;
                """);

            migrationBuilder.Sql(
                """
                DELETE pi
                FROM ProductImages pi
                WHERE pi.ProductVariantId IS NULL;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_ProductImages_Products_ProductId",
                table: "ProductImages");

            migrationBuilder.DropIndex(
                name: "IX_ProductImages_ProductId",
                table: "ProductImages");

            migrationBuilder.AlterColumn<int>(
                name: "ProductVariantId",
                table: "ProductImages",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductVariantId",
                table: "ProductImages",
                column: "ProductVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductImages_ProductVariants_ProductVariantId",
                table: "ProductImages",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "ProductImages");
        }
    }
}
