import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCardPaymentOptionInBillingSettingsTable1698500732749
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" ADD COLUMN "cardPaymentOption" STRING DEFAULT 'manual'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" DROP COLUMN "cardPaymentOption"`
    );
  }
}
