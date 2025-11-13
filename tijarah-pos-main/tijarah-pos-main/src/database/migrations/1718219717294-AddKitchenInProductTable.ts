import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKitchenInProductTable1718219717294
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "kitchenRefs" ARRAY DEFAULT [] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "kitchens" JSON[] NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "kitchenRefs"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "kitchens"`);
  }
}
