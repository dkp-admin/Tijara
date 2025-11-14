import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedShowOrderTypeInPrintTemplateTable1699972170410
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "print-template" ADD COLUMN "showOrderType" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "print-template" DROP COLUMN "showOrderType"`
    );
  }
}
