import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPrinterTypeAndSizeInPrinterTable1700216360695
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "printerType" STRING DEFAULT 'usb'`
    );
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "printerSize" STRING DEFAULT '3-inch'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "printer" DROP COLUMN "printerType"`);
    await queryRunner.query(`ALTER TABLE "printer" DROP COLUMN "printerSize"`);
  }
}
