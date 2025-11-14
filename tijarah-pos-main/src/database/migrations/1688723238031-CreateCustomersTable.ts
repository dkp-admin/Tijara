import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateCustomersTable1688723238031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "customer" table
    await queryRunner.createTable(
      new Table({
        name: "customer",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "profilePicture",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "firstName",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "lastName",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "phone",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: true,
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
            name: "locations",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "locationRefs",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "address",
            type: "json",
            isNullable: true,
          },
          {
            name: "specialEvents",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "totalSpend",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "totalOrders",
            type: "integar",
            isNullable: false,
          },
          {
            name: "lastOrder",
            type: "datetime",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign keys and columns

    await queryRunner.dropTable("customer");
  }
}
