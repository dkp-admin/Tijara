import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBoxesEnableBatchingInProductTable1696398503394
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "enabledBatching",
        type: "boolean",
        default: false,
        isNullable: false,
      })
    );
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "boxes",
        type: "array",
        isNullable: true,
        isArray: true,
      })
    );
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "otherBoxes",
        type: "array",
        isArray: true,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "enabledBatching");
    await queryRunner.dropColumn("products", "boxes");
    await queryRunner.dropColumn("products", "otherBoxes");
  }
}
