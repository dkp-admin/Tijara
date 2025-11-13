export class CreateCategoryTable1732209451449 {
  name = "CreateCategoryTable1732209451449";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS category (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          parent TEXT,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          localImage TEXT,
          image TEXT,
          description TEXT DEFAULT '',
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'local' CHECK(source IN ('local', 'server'))
        );
        CREATE INDEX IF NOT EXISTS idx_category_company ON category(companyRef);
        CREATE INDEX IF NOT EXISTS idx_category_parent ON category(parent);
        CREATE INDEX IF NOT EXISTS idx_category_status ON category(status);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS category;`;
  }
}
