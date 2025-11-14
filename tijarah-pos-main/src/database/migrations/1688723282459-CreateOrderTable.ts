import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateOrderTable1688723282459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "orders" table
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "company",
            type: "json",
            isNullable: false,
          },
          {
            name: "companyRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "location",
            type: "json",
            isNullable: false,
          },
          {
            name: "locationRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "customer",
            type: "json",
            isNullable: true,
          },
          {
            name: "customerRef",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "cashier",
            type: "json",
            isNullable: true,
          },
          {
            name: "cashierRef",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "orderNum",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "items",
            type: "json",
            isNullable: false,
            isArray: true,
          },
          {
            name: "payment",
            type: "json",
            isNullable: false,
          },
          {
            name: "refunds",
            type: "json",
            isNullable: false,
            isArray: true,
          },
          {
            name: "createdAt",
            type: "datetime",
            isNullable: false,
          },
          {
            name: "source",
            type: "varchar",
            isNullable: false,
            default: "'local'",
          },
          {
            name: "appliedDiscount",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "paymentMethod",
            type: "varchar",
            isNullable: false,
            isArray: true,
          },
          {
            name: "refundAvailable",
            type: "boolean",
            isNullable: false,
            default: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "orders" table
    await queryRunner.dropTable("orders");
  }
}
