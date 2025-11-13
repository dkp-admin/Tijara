import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreditManagementInCustomersTable1705398325949
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "allowCredit" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "maximumCredit" DECIMAL(10,2) DEFAULT 0 NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "blockedCredit" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "blacklistCredit" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "allowCredit"`);
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "maximumCredit"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "blockedCredit"`
    );
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "blacklistCredit"`
    );
  }
}
