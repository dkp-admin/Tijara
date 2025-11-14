export class CreateVoidCompTable1732209451441 {
  name = "CreateVoidCompTable1732209451441";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "void-comp" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          reason TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server'
        );
        CREATE INDEX IF NOT EXISTS idx_void_comp_company ON "void-comp"(companyRef);
        CREATE INDEX IF NOT EXISTS idx_void_comp_type ON "void-comp"(type);
        CREATE INDEX IF NOT EXISTS idx_void_comp_status ON "void-comp"(status);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "void-comp";`;
  }
}
