import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCheckRequestTable1688723213098
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "check-request" table
    await queryRunner.createTable(
      new Table({
        name: "check-request",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "entityName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
            default: "'pending'", // Default value should be a string literal in single quotes
            enum: ["success", "failed", "pending"],
          },
          {
            name: "lastSync",
            type: "datetime",
            default: "CURRENT_TIMESTAMP", // Use database-specific function to get current timestamp
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "datetime",
            default: "CURRENT_TIMESTAMP", // Use database-specific function to get current timestamp
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "check-request" table
    await queryRunner.dropTable("check-request");
  }
}
