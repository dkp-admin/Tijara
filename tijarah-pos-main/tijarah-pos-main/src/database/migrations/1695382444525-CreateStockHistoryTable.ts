import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateStockHistoryTable1695382444525
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "stock history" table
    await queryRunner.createTable(
      new Table({
        name: "stock-history",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "companyRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "company",
            type: "json",
            isNullable: false,
          },
          {
            name: "locationRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "location",
            type: "json",
            isNullable: false,
          },
          {
            name: "vendorRef",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "vendor",
            type: "json",
            isNullable: true,
          },
          {
            name: "productRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "product",
            type: "json",
            isNullable: false,
          },
          {
            name: "sku",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "price",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "stockCount",
            type: "decimal",
            precision: 10,
            scale: 3,
            isNullable: true,
            default: 0,
          },
          {
            name: "stockAction",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "datetime",
            default: "CURRENT_TIMESTAMP", // Use database-specific function to get current timestamp
            isNullable: false,
          },
          {
            name: "source",
            type: "varchar",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "stock history" table
    await queryRunner.dropTable("stock-history");
  }
}
