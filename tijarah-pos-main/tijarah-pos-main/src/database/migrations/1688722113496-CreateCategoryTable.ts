import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateCategoryTable1688722113496 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "category" table
    await queryRunner.createTable(
      new Table({
        name: "category",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "name",
            type: "json",
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
            name: "localImage",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "image",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "description",
            type: "varchar",
            isNullable: false,
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
            default: "'local'",
          },
        ],
      }),
      true
    );

    // Create indexes if needed
    await queryRunner.createIndex(
      "category",
      new TableIndex({
        name: "IDX_CATEGORY_COMPANY_REF",
        columnNames: ["companyRef"],
      })
    );

    await queryRunner.createIndex(
      "category",
      new TableIndex({
        name: "IDX_CATEGORY_LOCATION_REF",
        columnNames: ["locationRef"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "category" table
    await queryRunner.dropTable("category");
  }
}
