import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewRuleDataPointInCustomChargeTable1711378196988
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "custom-charge" ADD COLUMN "taxRef" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" ADD COLUMN "tax" JSON NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" ADD COLUMN "channel" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" ADD COLUMN "applyAutoChargeOnOrders" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" ADD COLUMN "skipIfOrderValueIsAbove" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" ADD COLUMN "orderValue" DECIMAL(10,2) DEFAULT 0 NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "custom-charge" DROP COLUMN "taxRef"`);
    await queryRunner.query(`ALTER TABLE "custom-charge" DROP COLUMN "tax"`);
    await queryRunner.query(
      `ALTER TABLE "custom-charge" DROP COLUMN "channel"`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" DROP COLUMN "applyAutoChargeOnOrders"`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" DROP COLUMN "skipIfOrderValueIsAbove"`
    );
    await queryRunner.query(
      `ALTER TABLE "custom-charge" DROP COLUMN "orderValue"`
    );
  }
}
