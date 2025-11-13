import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CreateDeviceInOrderTable1690224524962
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "orders",
      new TableColumn({
        name: "device",
        type: "json",
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      "orders",
      new TableColumn({
        name: "deviceRef",
        type: "string",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("orders", "device");
    await queryRunner.dropColumn("orders", "deviceRef");
  }
}
