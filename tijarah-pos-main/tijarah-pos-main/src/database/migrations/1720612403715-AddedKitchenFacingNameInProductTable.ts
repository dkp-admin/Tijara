import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedKitchenFacingNameInProductTable1720612403715
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "kitchenFacingName" JSON NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "kitchenFacingName"`
    );
  }
}
