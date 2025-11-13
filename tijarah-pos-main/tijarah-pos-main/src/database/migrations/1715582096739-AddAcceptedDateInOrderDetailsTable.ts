import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcceptedDateInOrderDetailsTable1715582096739
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "acceptedAt" DATETIME NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "acceptedAt"`);
  }
}
