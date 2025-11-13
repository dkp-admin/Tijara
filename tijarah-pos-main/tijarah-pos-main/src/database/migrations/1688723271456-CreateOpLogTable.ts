import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateOpLogTable1688723271456 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "opLogs" table
    await queryRunner.createTable(
      new Table({
        name: "opLogs",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
            isNullable: false,
          },
          {
            name: "requestId",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "data",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "tableName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "action",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "timestamp",
            type: "datetime",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "opLogs" table
    await queryRunner.dropTable("opLogs");
  }
}
