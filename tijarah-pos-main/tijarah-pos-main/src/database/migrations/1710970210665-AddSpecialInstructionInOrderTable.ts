import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpecialInstructionInOrderTable1710970210665
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN "specialInstructions" STRING DEFAULT '' NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "specialInstructions"`
    );
  }
}
