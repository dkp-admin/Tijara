import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCodeInProductstable1708413129080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN "code" ARRAY DEFAULT '[]' NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "code"`);
  }
}
