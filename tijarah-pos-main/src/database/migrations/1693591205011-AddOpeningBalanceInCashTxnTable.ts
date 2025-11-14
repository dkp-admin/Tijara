import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOpeningBalanceInCashTxnTable1693591205011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "cash-drawer-txns",
      new TableColumn({
        name: "openingActual",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "cash-drawer-txns",
      new TableColumn({
        name: "openingExpected",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("cash-drawer-txns", "openingActual");
    await queryRunner.dropColumn("cash-drawer-txns", "openingExpected");
  }
}
