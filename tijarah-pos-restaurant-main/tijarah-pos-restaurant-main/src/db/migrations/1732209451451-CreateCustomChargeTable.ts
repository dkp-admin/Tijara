export class CreateCustomChargeTable1732209451451 {
  name = "CreateCustomChargeTable1732209451451";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "custom-charge" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          locationRefs TEXT,
          name TEXT NOT NULL,
          image TEXT,
          value REAL NOT NULL,
          type TEXT NOT NULL,
          chargeType TEXT NOT NULL,
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server',
          taxRef TEXT DEFAULT '',
          tax TEXT,
          channel TEXT DEFAULT '',
          applyAutoChargeOnOrders INTEGER DEFAULT 0,
          skipIfOrderValueIsAbove INTEGER DEFAULT 0,
          orderValue REAL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_custom_charge_company ON "custom-charge"(companyRef);
        CREATE INDEX IF NOT EXISTS idx_custom_charge_type ON "custom-charge"(type);
        CREATE INDEX IF NOT EXISTS idx_custom_charge_status ON "custom-charge"(status);
        CREATE INDEX IF NOT EXISTS idx_custom_charge_tax ON "custom-charge"(taxRef);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "custom-charge";`;
  }
}
