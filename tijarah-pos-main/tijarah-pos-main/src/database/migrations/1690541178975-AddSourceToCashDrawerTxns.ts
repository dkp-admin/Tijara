import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSourceToCashDrawerTxns1690541178975
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "cash-drawer-txns",
      new TableColumn({
        name: "source",
        type: "string",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("cash-drawer-txns", "source");
  }
}
