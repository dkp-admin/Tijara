import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByInAdsManagement1709624745351
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-management" ADD COLUMN "createdByRole" STRING DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-management" DROP COLUMN "createdByRole"`
    );
  }
}
