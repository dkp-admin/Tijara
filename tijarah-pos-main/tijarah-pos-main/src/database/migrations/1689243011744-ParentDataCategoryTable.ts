import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ParentDataCategoryTable1689243011744
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "category",
      new TableColumn({
        name: "parent",
        type: "string",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("category", "parent");
  }
}
