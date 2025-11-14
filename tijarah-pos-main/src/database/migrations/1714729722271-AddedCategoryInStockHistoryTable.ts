import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCategoryInStockHistoryTable1714729722271
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" ADD COLUMN "categoryRef" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "stock-history" ADD COLUMN "category" JSON NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" DROP COLUMN "categoryRef"`
    );
    await queryRunner.query(
      `ALTER TABLE "stock-history" DROP COLUMN "category"`
    );
  }
}
