import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBoxObjInBoxCrateTable1724328397838
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "box-crates" ADD COLUMN "box" JSON NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "box-crates" DROP COLUMN "box"`);
  }
}
