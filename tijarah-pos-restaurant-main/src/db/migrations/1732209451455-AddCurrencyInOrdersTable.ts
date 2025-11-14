export class AddCurrencyInOrdersTable1732209451455 {
  name = "AddCurrencyInOrdersTable1732209451455";

  up(): string {
    return `
      ALTER TABLE orders ADD COLUMN currency TEXT;
    `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS orders;`;
  }
}
