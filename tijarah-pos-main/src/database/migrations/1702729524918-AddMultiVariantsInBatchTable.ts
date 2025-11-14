import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultiVariantsInBatchTable1702729524918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch" ADD COLUMN "hasMultipleVariants" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch" DROP COLUMN "hasMultipleVariants"`
    );
  }
}
