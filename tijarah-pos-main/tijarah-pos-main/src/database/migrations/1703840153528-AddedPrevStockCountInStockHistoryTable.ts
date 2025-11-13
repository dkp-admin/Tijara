import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPrevStockCountInStockHistoryTable1703840153528
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" ADD COLUMN "previousStockCount" DECIMAL(10,3) DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" DROP COLUMN "previousStockCount"`
    );
  }
}
