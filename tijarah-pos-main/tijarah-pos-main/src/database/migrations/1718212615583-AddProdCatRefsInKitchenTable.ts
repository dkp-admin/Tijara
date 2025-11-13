import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProdCatRefsInKitchenTable1718212615583
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "productRefs" ARRAY DEFAULT [] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "categoryRefs" ARRAY DEFAULT [] NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "productRefs"`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "categoryRefs"`
    );
  }
}
