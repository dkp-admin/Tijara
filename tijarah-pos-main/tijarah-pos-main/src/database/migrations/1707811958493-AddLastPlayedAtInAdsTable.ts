import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastPlayedAtInAdsTable1707811958493
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-management" ADD COLUMN "lastPlayedAt" DATE DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ads-management" DROP COLUMN "lastPlayedAt"`
    );
  }
}
