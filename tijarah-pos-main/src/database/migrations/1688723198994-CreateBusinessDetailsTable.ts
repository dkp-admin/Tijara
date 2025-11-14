import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBusinessDetailsTable1688723198994
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "business-details" table
    await queryRunner.createTable(
      new Table({
        name: "business-details",
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
            name: "location",
            type: "json",
            isNullable: false,
          },
          {
            name: "source",
            type: "varchar",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "business-details" table
    await queryRunner.dropTable("business-details");
  }
}
