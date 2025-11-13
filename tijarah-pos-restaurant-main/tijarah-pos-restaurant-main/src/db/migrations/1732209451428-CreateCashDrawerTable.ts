export class CreateCashDrawerTable1732209451428 {
  name = "CreateCashDrawerTable1732209451428";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "cash-drawer-txns" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          userRef TEXT NOT NULL,
          user TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          openingActual REAL,
          openingExpected REAL,
          closingActual REAL,
          closingExpected REAL,
          difference REAL,
          totalSales REAL,
          transactionType TEXT NOT NULL,
          description TEXT NOT NULL,
          shiftIn INTEGER NOT NULL,
          dayEnd INTEGER NOT NULL,
          started TEXT NOT NULL,
          ended TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'local' CHECK(source IN ('local', 'server'))
        );
        CREATE INDEX IF NOT EXISTS idx_cash_drawer_location ON "cash-drawer-txns"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_cash_drawer_user ON "cash-drawer-txns"(userRef);
        CREATE INDEX IF NOT EXISTS idx_cash_drawer_date ON "cash-drawer-txns"(started);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "cash-drawer-txns";`;
  }
}
