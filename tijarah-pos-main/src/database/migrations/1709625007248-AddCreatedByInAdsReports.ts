import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByInAdsReports1709625007248
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-report" ADD COLUMN "createdByRole" STRING DEFAULT ''`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-report" DROP COLUMN "createdByRole"`
    );
  }
}
