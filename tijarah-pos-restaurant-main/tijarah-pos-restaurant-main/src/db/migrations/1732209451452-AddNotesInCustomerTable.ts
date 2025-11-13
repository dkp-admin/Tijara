export class AddNotesInCustomerTable1732209451452 {
  name = "AddNotesInCustomerTable1732209451452";

  up(): string {
    return `
      ALTER TABLE customer ADD COLUMN note TEXT;
    `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS customer;`;
  }
}
