import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTotalSalesIncashDrawerTxnTable1722588769605
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash-drawer-txns" ADD COLUMN "totalSales" DECIMAL(10,2) DEFAULT 0 NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash-drawer-txns" DROP COLUMN "totalSales"`
    );
  }
}
