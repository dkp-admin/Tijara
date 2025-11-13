import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddedVariantInBatchTable1697116257685
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "batch",
      new TableColumn({
        name: "variant",
        type: "json",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("batch", "variant");
  }
}
