import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKitchenInPrinterTable1718189321497
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "kitchenRef" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "printer" ADD COLUMN "kitchen" JSON NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "printer" DROP COLUMN "kitchenRef"`);
    await queryRunner.query(`ALTER TABLE "printer" DROP COLUMN "kitchen"`);
  }
}
