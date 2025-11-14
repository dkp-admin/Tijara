import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedStatusInBatchTable1698308940086
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch" ADD COLUMN "status" STRING DEFAULT 'active'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "status"`);
  }
}
