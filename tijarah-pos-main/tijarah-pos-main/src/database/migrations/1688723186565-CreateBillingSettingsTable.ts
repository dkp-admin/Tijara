import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateBillingSettingsTable1688723186565
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "billing-settings" table
    await queryRunner.createTable(
      new Table({
        name: "billing-settings",
        columns: [
          {
            name: "_id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
            isNullable: false,
          },
          {
            name: "quickAmounts",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "paymentTypes",
            type: "array",
            isArray: true,
            isNullable: false,
          },
          {
            name: "defaultCompleteBtn",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "defaultCash",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "noOfReceiptPrint",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "cashManagement",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "orderTypes",
            type: "varchar",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key and column
    await queryRunner.dropForeignKey(
      "billing-settings",
      "FK_BILLING_SETTINGS_PAYMENT_TYPES"
    );
    await queryRunner.dropColumn("billing-settings", "paymentTypes");

    // Drop the "billing-settings" and "payment-types" tables
    await queryRunner.dropTable("billing-settings");
    await queryRunner.dropTable("payment-types");
  }
}
