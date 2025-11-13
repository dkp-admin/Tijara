import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageAndSourceInCollectionTable1710527630245
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collections" ADD COLUMN "localImage" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD COLUMN "image" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD COLUMN "source" STRING DEFAULT 'server'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collections" DROP COLUMN "localImage"`
    );
    await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "image"`);
    await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "source"`);
  }
}
