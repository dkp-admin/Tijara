import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNewMenuTable1721635653116 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "menu" table
    await queryRunner.createTable(
      new Table({
        name: "menu",
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
            name: "categories",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "products",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "orderType",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "updatedAt",
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
    // Drop the "menu" table
    await queryRunner.dropTable("menu");
  }
}
