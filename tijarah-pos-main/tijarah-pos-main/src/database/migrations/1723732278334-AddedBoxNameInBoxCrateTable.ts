import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBoxNameInBoxCrateTable1723732278334
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "box-crates" ADD COLUMN "boxName" JSON NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "box-crates" DROP COLUMN "boxName"`);
  }
}
