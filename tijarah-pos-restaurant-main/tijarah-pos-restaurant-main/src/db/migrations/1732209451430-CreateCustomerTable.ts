export class CreateCustomerTable1732209451430 {
  name = "CreateCustomerTable1732209451430";

  up(): string {
    return `
      CREATE TABLE IF NOT EXISTS customer (
        _id TEXT PRIMARY KEY,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NULL,
        profilePicture TEXT,
        firstName TEXT NOT NULL DEFAULT '',
        lastName TEXT DEFAULT '',
        phone TEXT NOT NULL,
        email TEXT,
        vat TEXT,
        company TEXT NOT NULL,
        companyRef TEXT NOT NULL,
        locations TEXT,
        groups TEXT,
        locationRefs TEXT,
        groupRefs TEXT,
        allowCredit INTEGER DEFAULT 0,
        maximumCredit REAL DEFAULT 0,
        usedCredit REAL DEFAULT 0,
        availableCredit REAL DEFAULT 0,
        blockedCredit INTEGER DEFAULT 0,
        blacklistCredit INTEGER DEFAULT 0,
        address TEXT,
        specialEvents TEXT,
        totalSpend REAL DEFAULT 0,
        totalRefunded REAL DEFAULT 0,
        totalOrders INTEGER DEFAULT 0,
        lastOrder TEXT NULL,
        status TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'local'
      );
      CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);
      CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
      CREATE INDEX IF NOT EXISTS idx_customer_company ON customer(companyRef);
    `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS customer;`;
  }
}
