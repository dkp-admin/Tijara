import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelfOnlineOrderingInProductTable1712046170122
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "selfOrdering" BOOLEAN DEFAULT TRUE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "onlineOrdering" BOOLEAN DEFAULT TRUE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "selfOrdering"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "onlineOrdering"`
    );
  }
}
