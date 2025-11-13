import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBoxRefAndLocationRefsInBoxCrateTable1722419418426
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "box-crates" ADD COLUMN "boxRef" STRING DEFAULT '' NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "box-crates" ADD COLUMN "locationRefs" ARRAY DEFAULT '[]' NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "box-crates" DROP COLUMN "boxRef"`);
    await queryRunner.query(
      `ALTER TABLE "box-crates" DROP COLUMN "locationRefs"`
    );
  }
}
