import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedOrderStatusQROrderingInOrdersTable1709750589599
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "orderStatus" STRING DEFAULT 'completed' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "qrOrdering" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderStatus"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "qrOrdering"`);
  }
}
