import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateProductTable1688723113423 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "products" table
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "parent",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "name",
            type: "json",
            isNullable: false,
          },
          {
            name: "image",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "localImage",
            type: "varchar",
            isNullable: true,
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
            name: "categoryRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "category",
            type: "json",
            isNullable: false,
          },
          {
            name: "collections",
            type: "json",
            isNullable: true,
            isArray: true,
          },
          {
            name: "description",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "brandRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "brand",
            type: "json",
            isNullable: false,
          },
          {
            name: "taxRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "tax",
            type: "json",
            isNullable: false,
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
            default: "'local'",
          },
          {
            name: "variants",
            type: "array",
            isNullable: false,
            isArray: true,
          },
        ],
      }),
      true
    );

    // Create the foreign key for "products.companyRef" referencing "companies._id"
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["companyRef"],
        referencedTableName: "companies",
        referencedColumnNames: ["_id"],
        onDelete: "CASCADE",
      })
    );

    // Create the foreign key for "products.categoryRef" referencing "category._id"
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["categoryRef"],
        referencedTableName: "category",
        referencedColumnNames: ["_id"],
        onDelete: "CASCADE",
      })
    );

    // Create the foreign key for "products.brandRef" referencing "brands._id"
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["brandRef"],
        referencedTableName: "brands",
        referencedColumnNames: ["_id"],
        onDelete: "CASCADE",
      })
    );

    // Create the foreign key for "products.taxRef" referencing "taxes._id"
    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["taxRef"],
        referencedTableName: "taxes",
        referencedColumnNames: ["_id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign keys and columns

    await queryRunner.dropForeignKey("products", "FK_PRODUCTS_TAX_REF");
    await queryRunner.dropColumn("products", "taxRef");

    await queryRunner.dropForeignKey("products", "FK_PRODUCTS_BRAND_REF");
    await queryRunner.dropColumn("products", "brandRef");

    await queryRunner.dropForeignKey("products", "FK_PRODUCTS_CATEGORY_REF");
    await queryRunner.dropColumn("products", "categoryRef");

    await queryRunner.dropForeignKey("products", "FK_PRODUCTS_COMPANY_REF");
    await queryRunner.dropColumn("products", "companyRef");

    // Drop the "products" table
    await queryRunner.dropTable("products");
  }
}
