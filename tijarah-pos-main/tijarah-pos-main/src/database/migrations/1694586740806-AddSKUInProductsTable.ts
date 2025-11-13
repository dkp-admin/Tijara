import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSKUInProductsTable1694586740806 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "sku",
        type: "array",
        isNullable: false,
        isArray: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "sku");
  }
}
