import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSectionTables1717413827625 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "section-tables" table
    await queryRunner.createTable(
      new Table({
        name: "section-tables",
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
            name: "name",
            type: "json",
            isNullable: false,
          },
          {
            name: "floorType",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "tableNaming",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "numberOfTable",
            type: "integar",
            isNullable: false,
          },
          {
            name: "tables",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "status",
            type: "varchar",
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
    // Drop the "section-tables" table
    await queryRunner.dropTable("section-tables");
  }
}
