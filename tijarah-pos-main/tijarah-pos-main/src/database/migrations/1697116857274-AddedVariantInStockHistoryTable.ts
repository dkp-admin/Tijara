import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddedVariantInStockHistoryTable1697116857274
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "stock-history",
      new TableColumn({
        name: "variant",
        type: "json",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("stock-history", "variant");
  }
}
