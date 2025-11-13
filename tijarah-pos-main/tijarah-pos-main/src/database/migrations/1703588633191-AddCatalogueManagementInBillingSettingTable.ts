import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatalogueManagementInBillingSettingTable1703588633191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" ADD COLUMN "catalogueManagement" BOOLEAN DEFAULT TRUE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billing-settings" DROP COLUMN "catalogueManagement"`
    );
  }
}
