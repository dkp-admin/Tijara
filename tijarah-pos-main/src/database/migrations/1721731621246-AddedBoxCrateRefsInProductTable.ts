import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBoxCrateRefsInProductTable1721731621246
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "boxRefs" ARRAY DEFAULT [] NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "crateRefs" ARRAY DEFAULT [] NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "boxRefs"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "crateRefs"`);
  }
}
