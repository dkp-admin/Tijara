import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPromotionsCustomChargesInBillingSettingsTable1713378840183
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" ADD COLUMN "promotions" BOOLEAN DEFAULT TRUE`
    );
    await queryRunner.query(
      `ALTER TABLE "billing-settings" ADD COLUMN "customCharges" BOOLEAN DEFAULT TRUE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" DROP COLUMN "promotions"`
    );
    await queryRunner.query(
      `ALTER TABLE "billing-settings" DROP COLUMN "customCharges"`
    );
  }
}
