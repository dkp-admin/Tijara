import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTotalRefundedInCustomersTable1697446644525
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "totalRefunded" DECIMAL(10,2) DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "totalRefunded"`
    );
  }
}
