import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVATInCustomersTable1693638887792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "customer",
      new TableColumn({
        name: "vat",
        type: "string",
        isNullable: true,
        length: "15",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("customer", "vat");
  }
}
