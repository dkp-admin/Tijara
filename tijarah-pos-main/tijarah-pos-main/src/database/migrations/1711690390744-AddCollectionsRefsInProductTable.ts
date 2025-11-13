import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollectionsRefsInProductTable1711690390744
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "collectionsRefs" ARRAY DEFAULT [] NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "collectionsRefs"`
    );
  }
}
