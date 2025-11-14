export class CreateMenuTable1732209451434 {
  name = "CreateMenuTable1732209451434";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS menu (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          categories TEXT NOT NULL,
          products TEXT NOT NULL,
          orderType TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server'
        );
        CREATE INDEX IF NOT EXISTS idx_menu_company ON menu(companyRef);
        CREATE INDEX IF NOT EXISTS idx_menu_location ON menu(locationRef);
        CREATE INDEX IF NOT EXISTS idx_menu_order_type ON menu(orderType);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS menu;`;
  }
}
