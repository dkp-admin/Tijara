import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAdsManagementTable1707573367620
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "ads-management",
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
            name: "slidesData",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "status",
            type: "varchar",
          },
          {
            name: "priority",
            type: "varchar",
          },
          {
            name: "locationRefs",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "companyRefs",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "businessTypeRefs",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "dateRange",
            type: "json",
          },
          {
            name: "excludedLocationRefs",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "excludedCompanyRefs",
            type: "array",
            isNullable: true,
            isArray: true,
          },
          {
            name: "daysOfWeek",
            type: "varchar",
          },
          {
            name: "createdAt",
            type: "datetime",
            default: "CURRENT_TIMESTAMP", // Use database-specific function to get current timestamp
            isNullable: false,
          },
          {
            name: "sentToPos",
            type: "boolean",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("ads-management");
  }
}
