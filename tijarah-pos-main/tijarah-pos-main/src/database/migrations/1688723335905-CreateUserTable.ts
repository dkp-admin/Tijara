import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1688723335905 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "device-user" table
    await queryRunner.createTable(
      new Table({
        name: "device-user",
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
            name: "profilePicture",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "phone",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "userType",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "permissions",
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
            name: "onboarded",
            type: "boolean",
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
            name: "__v",
            type: "integer",
            isNullable: false,
          },
          {
            name: "pin",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "key",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "value",
            type: "varchar",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "device-user" table
    await queryRunner.dropTable("device-user");
  }
}
