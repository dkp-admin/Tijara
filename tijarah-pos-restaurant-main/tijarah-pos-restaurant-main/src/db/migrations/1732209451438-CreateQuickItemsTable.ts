export class CreateQuickItemsTable1732209451438 {
  name = "CreateQuickItemsTable1732209451438";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "quick-items" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          menuRef TEXT NULL,
          menu TEXT NULL,
          product TEXT NOT NULL,
          productRef TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'product',
          source TEXT NOT NULL DEFAULT 'local'
        );
        CREATE INDEX IF NOT EXISTS idx_quick_items_location ON "quick-items"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_quick_items_product ON "quick-items"(productRef);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "quick-items";`;
  }
}
