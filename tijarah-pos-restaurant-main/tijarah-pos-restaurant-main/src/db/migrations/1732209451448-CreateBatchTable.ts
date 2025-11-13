export class CreateBatchTable1732209451448 {
  name = "CreateBatchTable1732209451448";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS batch (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          companyRef TEXT NOT NULL,
          company TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          location TEXT NOT NULL,
          vendorRef TEXT,
          vendor TEXT,
          productRef TEXT NOT NULL,
          product TEXT NOT NULL,
          hasMultipleVariants INTEGER DEFAULT 0,
          variant TEXT NOT NULL,
          sku TEXT,
          received REAL DEFAULT 0,
          transfer REAL DEFAULT 0,
          available REAL DEFAULT 0,
          expiry TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          source TEXT NOT NULL DEFAULT 'local' CHECK(source IN ('local', 'server'))
        );
        CREATE INDEX IF NOT EXISTS idx_batch_product ON batch(productRef);
        CREATE INDEX IF NOT EXISTS idx_batch_location ON batch(locationRef);
        CREATE INDEX IF NOT EXISTS idx_batch_company ON batch(companyRef);
        CREATE INDEX IF NOT EXISTS idx_batch_vendor ON batch(vendorRef);
        CREATE INDEX IF NOT EXISTS idx_batch_sku ON batch(sku);
        CREATE INDEX IF NOT EXISTS idx_batch_expiry ON batch(expiry);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS batch;`;
  }
}
