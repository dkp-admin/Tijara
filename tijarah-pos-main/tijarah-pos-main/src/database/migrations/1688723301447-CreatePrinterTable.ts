import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePrinterTable1688723301447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "printer" table
    await queryRunner.createTable(
      new Table({
        name: "printer",
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
            type: "varchar",
            isNullable: false,
          },
          {
            name: "device_name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "device_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "vendor_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "enableReceipts",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "enableBarcodes",
            type: "boolean",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the "printer" table
    await queryRunner.dropTable("printer");
  }
}
