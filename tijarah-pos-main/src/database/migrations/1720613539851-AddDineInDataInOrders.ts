import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDineInDataInOrders1720613539851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "dineinData" json`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "dineinData"`);
  }
}
