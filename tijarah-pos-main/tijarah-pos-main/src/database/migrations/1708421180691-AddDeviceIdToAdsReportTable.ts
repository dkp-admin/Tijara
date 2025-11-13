import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeviceIdToAdsReportTable1708421180691
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "ads-report",
      new TableColumn({
        name: "deviceRef",
        type: "varchar",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("ads-report", "deviceRef");
  }
}
