import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBatchTable1695390448843 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "batch" table
    await queryRunner.createTable(
      new Table({
        name: "batch",
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
            name: "received",
            type: "integar",
            default: 0,
            isNullable: true,
          },
          {
            name: "transfer",
            type: "integar",
            default: 0,
            isNullable: true,
          },
          {
            name: "available",
            type: "integar",
            default: 0,
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
    // Drop the "batch" table
    await queryRunner.dropTable("batch");
  }
}
