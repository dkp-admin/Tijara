import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScheduleStatusDaysOfWeekInAdsReport1709573747995
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-report" ADD COLUMN "adType" STRING DEFAULT ''`
    );

    await queryRunner.query(
      `ALTER TABLE "ads-report" ADD COLUMN "status" STRING DEFAULT ''`
    );

    await queryRunner.query(
      `ALTER TABLE "ads-report" ADD COLUMN "daysOfWeek" STRING DEFAULT ''`
    );

    await queryRunner.query(
      `ALTER TABLE "ads-report" ADD COLUMN "schedule" JSON`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ads-report" DROP COLUMN "adType"`);
    await queryRunner.query(`ALTER TABLE "ads-report" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "ads-report" DROP COLUMN "daysOfWeek"`
    );
    await queryRunner.query(`ALTER TABLE "ads-report" DROP COLUMN "schedule"`);
  }
}
