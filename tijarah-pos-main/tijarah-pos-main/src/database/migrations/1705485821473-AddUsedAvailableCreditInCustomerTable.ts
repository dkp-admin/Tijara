import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsedAvailableCreditInCustomerTable1705485821473
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "usedCredit" DECIMAL(10,2) DEFAULT 0 NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "availableCredit" DECIMAL(10,2) DEFAULT 0 NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "usedCredit"`);
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "availableCredit"`
    );
  }
}
