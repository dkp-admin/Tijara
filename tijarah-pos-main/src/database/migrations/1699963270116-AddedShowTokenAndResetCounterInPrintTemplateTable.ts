import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedShowTokenAndResetCounterInPrintTemplateTable1699963270116
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "print-template" ADD COLUMN "showToken" BOOLEAN DEFAULT FALSE NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "print-template" ADD COLUMN "resetCounterDaily" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "print-template" DROP COLUMN "showToken"`
    );
    await queryRunner.query(
      `ALTER TABLE "print-template" DROP COLUMN "resetCounterDaily"`
    );
  }
}
