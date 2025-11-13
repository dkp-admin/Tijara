import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPrinterDeviceInKitchenTable1718213265147
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "printerName" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "device" JSON NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" ADD COLUMN "deviceRef" STRING DEFAULT '' NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "printerName"`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "device"`
    );
    await queryRunner.query(
      `ALTER TABLE "kitchen-management" DROP COLUMN "deviceRef"`
    );
  }
}
