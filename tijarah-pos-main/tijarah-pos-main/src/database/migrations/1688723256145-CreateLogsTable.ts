import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLogsTable1688723256145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "logs" table
    await queryRunner.createTable(
      new Table({
        name: "logs",
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
            name: "entityName",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "response",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "eventName",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "eventType",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "triggeredBy",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "success",
            type: "boolean",
            isNullable: true,
            default: false,
          },
          {
            name: "createdAt",
            type: "datetime",
            isNullable: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "logs" table
    await queryRunner.dropTable("logs");
  }
}
