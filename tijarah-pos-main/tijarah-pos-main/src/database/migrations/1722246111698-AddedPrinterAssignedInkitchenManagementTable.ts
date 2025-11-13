import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPrinterAssignedInkitchenManagementTable1722246111698
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "printerAssigned" BOOLEAN DEFAULT FALSE NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "printerAssigned"`
    );
  }
}
