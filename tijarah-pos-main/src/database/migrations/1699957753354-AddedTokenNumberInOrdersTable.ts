import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTokenNumberInOrdersTable1699957753354
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "tokenNum" STRING DEFAULT '' NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tokenNum"`);
  }
}
