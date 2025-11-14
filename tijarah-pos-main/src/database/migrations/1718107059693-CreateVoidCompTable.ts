import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateVoidCompTable1718107059693 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "void-comp" table
    await queryRunner.createTable(
      new Table({
        name: "void-comp",
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
            name: "reason",
            type: "json",
            isNullable: false,
          },
          {
            name: "type",
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
    // Drop the "void-comp" table
    await queryRunner.dropTable("void-comp");
  }
}
