import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CompanyDataCashTxnTable1688968631250
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "cash-drawer-txns",
      new TableColumn({
        name: "company",
        type: "json",
        isNullable: false,
      })
    );
    await queryRunner.addColumn(
      "cash-drawer-txns",
      new TableColumn({
        name: "companyRef",
        type: "string",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("cash-drawer-txns", "company");
    await queryRunner.dropColumn("cash-drawer-txns", "companyRef");
  }
}
