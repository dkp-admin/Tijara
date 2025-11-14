import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCustomerPhone1702369733553 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const orders = await queryRunner.query(
      `SELECT _id, customer FROM "orders" WHERE "customer" IS NOT NULL`
    )

    for (const order of orders) {
      let customer = JSON.parse(order.customer)

      if (!customer.phone) {
        customer.phone = "" // Set the default phone value
        await queryRunner.query(
          `UPDATE "orders" SET "customer" = ? WHERE "_id" = ?`,
          [JSON.stringify(customer), order._id]
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const orders = await queryRunner.query(
      `SELECT _id, customer FROM "orders" WHERE "customer" IS NOT NULL`
    )

    for (const order of orders) {
      let customer = JSON.parse(order.customer)

      if (customer.phone !== undefined) {
        delete customer.phone
        await queryRunner.query(
          `UPDATE "orders" SET "customer" = ? WHERE "_id" = ?`,
          [JSON.stringify(customer), order._id]
        )
      }
    }
  }
}
