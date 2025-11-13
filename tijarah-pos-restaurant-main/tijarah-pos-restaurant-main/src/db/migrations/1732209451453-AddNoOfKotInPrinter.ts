export class AddNoOfKotInPrinter1732209451453 {
  name = "AddNoOfKotInPrinter1732209451453";

  up(): string {
    return `
      ALTER TABLE printer ADD COLUMN numberOfKots INTEGER DEFAULT 1;
    `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS printer;`;
  }
}
