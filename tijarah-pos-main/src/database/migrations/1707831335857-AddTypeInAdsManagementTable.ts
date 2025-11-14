import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeInAdsManagementTable1707831335857
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-management" ADD COLUMN "type" STRING DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ads-management" DROP COLUMN "type"`);
  }
}
