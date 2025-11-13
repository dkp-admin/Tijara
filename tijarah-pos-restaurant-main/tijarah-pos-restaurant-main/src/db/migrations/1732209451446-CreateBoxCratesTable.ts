export class CreateBoxCratesTable1732209451446 {
  name = "CreateBoxCratesTable1732209451446";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "box-crates" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          type TEXT NOT NULL,
          qty INTEGER NOT NULL,
          code TEXT DEFAULT '',
          costPrice REAL DEFAULT 0,
          price REAL DEFAULT 0,
          box TEXT,
          boxName TEXT,
          boxRef TEXT,
          boxSku TEXT DEFAULT '',
          crateSku TEXT DEFAULT '',
          productSku TEXT DEFAULT '',
          description TEXT,
          nonSaleable INTEGER DEFAULT 0,
          product TEXT NOT NULL,
          locationRefs TEXT,
          locations TEXT,
          prices TEXT NOT NULL,
          otherPrices TEXT,
          stocks TEXT,
          source TEXT,
          status TEXT,
          otherStocks TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_box_crates_company ON "box-crates"(companyRef);
        CREATE INDEX IF NOT EXISTS idx_box_crates_sku ON "box-crates"(productSku);
        CREATE INDEX IF NOT EXISTS idx_box_crates_box ON "box-crates"(boxSku);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "box-crates";`;
  }
}
