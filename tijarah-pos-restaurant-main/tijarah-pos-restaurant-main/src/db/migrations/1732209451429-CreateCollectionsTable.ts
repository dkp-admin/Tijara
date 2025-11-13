export class CreateCollectionsTable1732209451429 {
  name = "CreateCollectionsTable1732209451429";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS collections (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          localImage TEXT,
          image TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          source TEXT NOT NULL DEFAULT 'local' CHECK(source IN ('local', 'server'))
        );
        CREATE INDEX IF NOT EXISTS idx_collections_company ON collections(companyRef);
        CREATE INDEX IF NOT EXISTS idx_collections_status ON collections(status);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS collections;`;
  }
}
