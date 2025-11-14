import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedOrderTypeInOrdersTable1699972233441
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "orderType" STRING DEFAULT '' NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "orderType"`);
  }
}
