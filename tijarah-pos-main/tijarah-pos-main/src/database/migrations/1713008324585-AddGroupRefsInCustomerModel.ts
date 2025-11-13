import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGroupRefsInCustomerModel1713008324585
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE customer ADD COLUMN groupRefs text[]");
    await queryRunner.query(`ALTER TABLE "customer" ADD COLUMN "groups" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "groups"`);
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "groupRefs"`);
  }
}
