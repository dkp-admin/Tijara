import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedAutoInStockHistoryTable1724245359119
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock-history" ADD COLUMN "auto" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stock-history" DROP COLUMN "auto"`);
  }
}
