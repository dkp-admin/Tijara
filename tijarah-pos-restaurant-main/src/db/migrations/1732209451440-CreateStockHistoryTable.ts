export class CreateStockHistoryTable1732209451440 {
  name = "CreateStockHistoryTable1732209451440";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "stock-history" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          companyRef TEXT NOT NULL,
          company TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          location TEXT NOT NULL,
          vendorRef TEXT,
          vendor TEXT,
          categoryRef TEXT,
          category TEXT,
          productRef TEXT NOT NULL,
          product TEXT NOT NULL,
          hasMultipleVariants INTEGER DEFAULT 0,
          variant TEXT NOT NULL,
          sku TEXT,
          price REAL,
          previousStockCount REAL DEFAULT 0,
          stockCount REAL DEFAULT 0,
          stockAction TEXT,
          auto INTEGER DEFAULT 0,
          source TEXT NOT NULL DEFAULT 'local'
        );
        CREATE INDEX IF NOT EXISTS idx_stock_history_product ON "stock-history"(productRef);
        CREATE INDEX IF NOT EXISTS idx_stock_history_location ON "stock-history"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_stock_history_date ON "stock-history"(createdAt);
        CREATE INDEX IF NOT EXISTS idx_stock_history_sku ON "stock-history"(sku);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "stock-history";`;
  }
}
