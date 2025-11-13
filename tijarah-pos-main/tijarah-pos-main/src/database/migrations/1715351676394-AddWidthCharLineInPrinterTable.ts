import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWidthCharLineInPrinterTable1715351676394
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "printerWidthMM" STRING DEFAULT '72'`
    );
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "charsPerLine"  STRING DEFAULT '44'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "printer" DROP COLUMN "printerWidthMM"`
    );
    await queryRunner.query(`ALTER TABLE "printer" DROP COLUMN "charsPerLine"`);
  }
}
