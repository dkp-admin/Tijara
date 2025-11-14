import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBoxCratesTable1721657189762 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "box-crates" table
    await queryRunner.createTable(
      new Table({
        name: "box-crates",
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
            name: "type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "qty",
            default: 0,
            type: "integar",
            isNullable: false,
          },
          {
            name: "code",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "costPrice",
            type: "decimal",
            precision: 10,
            scale: 2,
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
            name: "boxSku",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "crateSku",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "productSku",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "description",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "nonSaleable",
            type: "boolean",
            default: false,
            isNullable: true,
          },
          {
            name: "product",
            type: "json",
            isNullable: false,
          },
          {
            name: "locations",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "prices",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "otherPrices",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "stocks",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "otherStocks",
            type: "array",
            isNullable: false,
            isArray: true,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
            default: "'active'",
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
    // Drop the "box-crates" table
    await queryRunner.dropTable("box-crates");
  }
}
