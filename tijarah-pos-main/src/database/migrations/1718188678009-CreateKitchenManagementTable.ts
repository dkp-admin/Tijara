import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateKitchenManagementTable1718188678009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "kitchen-management" table
    await queryRunner.createTable(
      new Table({
        name: "kitchen-management",
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
    // Drop the "kitchen-management" table
    await queryRunner.dropTable("kitchen-management");
  }
}
