export class CreateSectionTablesTable1732209451439 {
  name = "CreateSectionTablesTable1732209451439";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "section-tables" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          name TEXT NOT NULL,
          floorType TEXT NOT NULL,
          tableNaming TEXT NOT NULL,
          numberOfTable INTEGER NOT NULL,
          tables TEXT NOT NULL,
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server'
        );
        CREATE INDEX IF NOT EXISTS idx_section_tables_location ON "section-tables"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_section_tables_company ON "section-tables"(companyRef);
        CREATE INDEX IF NOT EXISTS idx_section_tables_status ON "section-tables"(status);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "section-tables";`;
  }
}
