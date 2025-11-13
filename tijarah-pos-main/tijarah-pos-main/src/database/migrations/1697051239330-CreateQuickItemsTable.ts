import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateQuickItemsTable1697051239330 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "quick-items" table
    await queryRunner.createTable(
      new Table({
        name: "quick-items",
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
            name: "product",
            type: "json",
            isNullable: false,
          },
          {
            name: "productRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "type",
            type: "varchar",
            isNullable: false,
            default: "'product'",
          },
          {
            name: "source",
            type: "varchar",
            isNullable: false,
            default: "'local'",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "quick-items" table
    await queryRunner.dropTable("quick-items");
  }
}
