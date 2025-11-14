import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAdTypeInAdsReport1708577404525 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "ads-report",
      new TableColumn({
        name: "type",
        type: "string",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("ad-reports", "type");
  }
}
