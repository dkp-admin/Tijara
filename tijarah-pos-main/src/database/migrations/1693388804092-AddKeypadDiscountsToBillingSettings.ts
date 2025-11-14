import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddKeypadDiscountsToBillingSettings1693388804092
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "billing-settings",
      new TableColumn({
        name: "keypad",
        type: "boolean",
        isNullable: false,
        default: true,
      })
    );
    await queryRunner.addColumn(
      "billing-settings",
      new TableColumn({
        name: "discounts",
        type: "boolean",
        isNullable: false,
        default: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("billing-settings", "keypad");
    await queryRunner.dropColumn("billing-settings", "discounts");
  }
}
