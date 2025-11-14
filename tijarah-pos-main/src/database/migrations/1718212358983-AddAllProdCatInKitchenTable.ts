import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllProdCatInKitchenTable1718212358983
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "allProducts" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "allCategories" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "allProducts"`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "allCategories"`
    );
  }
}
