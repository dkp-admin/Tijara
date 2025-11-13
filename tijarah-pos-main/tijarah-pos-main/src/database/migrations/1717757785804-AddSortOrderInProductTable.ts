import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSortOrderInProductTable1717757785804
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "sortOrder" INT DEFAULT 0 NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sortOrder"`);
  }
}
