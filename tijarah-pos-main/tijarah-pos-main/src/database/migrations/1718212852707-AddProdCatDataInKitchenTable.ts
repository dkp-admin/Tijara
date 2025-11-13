import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProdCatDataInKitchenTable1718212852707
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "products" JSON[] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "categories" JSON[] NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "products"`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "categories"`
    );
  }
}
