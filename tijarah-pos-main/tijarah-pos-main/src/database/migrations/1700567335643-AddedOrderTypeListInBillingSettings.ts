import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedOrderTypeListInBillingSettings1700567335643
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" ADD COLUMN "orderTypesList" ARRAY DEFAULT '[]'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" DROP COLUMN "orderTypesList"`
    );
  }
}
