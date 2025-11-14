import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class CreateCashDrawerTxnTable1688723170826
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the "cash-drawer-txns" table
    await queryRunner.createTable(
      new Table({
        name: "cash-drawer-txns",
        columns: [
          {
            name: "_id",
            type: "varchar",
            isPrimary: true,
            length: "24", // Set the length based on your specific requirements
            isNullable: false,
          },
          {
            name: "userRef",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "user",
            type: "json",
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
            name: "closingActual",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "closingExpected",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "difference",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: "transactionType",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "description",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "shiftIn",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "dayEnd",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "started",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "ended",
            type: "timestamp",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create the foreign key for "cash-drawer-txns.locationRef" referencing "locations._id"
    await queryRunner.createForeignKey(
      "cash-drawer-txns",
      new TableForeignKey({
        columnNames: ["locationRef"],
        referencedTableName: "locations",
        referencedColumnNames: ["_id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key
    await queryRunner.dropForeignKey(
      "cash-drawer-txns",
      "FK_CASH_DRAWER_TXNS_LOCATION_REF"
    );

    // Drop the "cash-drawer-txns" table
    await queryRunner.dropTable("cash-drawer-txns");
  }
}
