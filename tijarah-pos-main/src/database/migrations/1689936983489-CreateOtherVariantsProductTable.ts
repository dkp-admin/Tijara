import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CreateOtherVariantsProductTable1689936983489
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "otherVariants",
        type: "array",
        isArray: true,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "otherVariants");
  }
}
