import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewDataPointInProductTable1710966570077
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "contains" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "restaurantCategoryRefs" ARRAY DEFAULT [] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "restaurantCategories" JSON[] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "bestSeller" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "channels" ARRAY DEFAULT [] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "nutritionalInformation" JSON NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "modifiers" JSON[] NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "contains"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "restaurantCategoryRefs"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "restaurantCategories"`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "bestSeller"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "channels"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "nutritionalInformation"`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "modifiers"`);
  }
}
