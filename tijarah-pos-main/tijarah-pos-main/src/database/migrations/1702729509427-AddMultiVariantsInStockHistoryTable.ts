import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultiVariantsInStockHistoryTable1702729509427
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" ADD COLUMN "hasMultipleVariants" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" DROP COLUMN "hasMultipleVariants"`
    );
  }
}
