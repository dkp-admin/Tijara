import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddedExpiryInBatchTable1697533900571
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "batch",
      new TableColumn({
        name: "expiry",
        type: "datetime",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("batch", "expiry");
  }
}
