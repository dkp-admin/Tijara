import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCustomChargeTable1700819069819
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "custom-charge" table
    await queryRunner.createTable(
      new Table({
        name: "custom-charge",
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
            name: "locationRefs",
            type: "array",
            isArray: true,
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
            isNullable: true,
          },
          {
            name: "value",
            type: "integar",
            isNullable: false,
          },
          {
            name: "type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "chargeType",
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
            default: "'server'",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "custom-charge" table
    await queryRunner.dropTable("custom-charge");
  }
}
