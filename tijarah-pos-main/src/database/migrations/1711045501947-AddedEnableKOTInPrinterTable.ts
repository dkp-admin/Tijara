import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEnableKOTInPrinterTable1711045501947
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "enableKOT" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "printer" DROP COLUMN "enableKOT"`);
  }
}
