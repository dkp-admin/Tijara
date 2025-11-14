export class CreatePrintTemplateTable1732209451445 {
  name = "CreatePrintTemplateTable1732209451445";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "print-template" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          location TEXT NOT NULL,
          footer TEXT NOT NULL,
          returnPolicy TEXT,
          customText TEXT,
          printBarcode INTEGER DEFAULT 0,
          showToken INTEGER DEFAULT 0,
          resetCounterDaily INTEGER DEFAULT 0,
          showOrderType INTEGER DEFAULT 0,
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server'
        );
        CREATE INDEX IF NOT EXISTS idx_print_template_location ON "print-template"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_print_template_status ON "print-template"(status);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "print-template";`;
  }
}
