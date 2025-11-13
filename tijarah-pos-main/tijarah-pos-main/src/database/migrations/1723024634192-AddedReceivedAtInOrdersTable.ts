import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReceivedAtInOrdersTable1723024634192
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "receivedAt" DATETIME NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "receivedAt"`);
  }
}
