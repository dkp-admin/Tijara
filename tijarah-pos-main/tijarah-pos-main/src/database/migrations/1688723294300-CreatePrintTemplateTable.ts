import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreatePrintTemplateTable1688723294300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "print-template" table
    await queryRunner.createTable(
      new Table({
        name: "print-template",
        columns: [
          {
            name: "_id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
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
            name: "footer",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "returnPolicy",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "customText",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "printBarcode",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
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
            default: "'server'",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "print-template" table
    await queryRunner.dropTable("print-template");
  }
}
