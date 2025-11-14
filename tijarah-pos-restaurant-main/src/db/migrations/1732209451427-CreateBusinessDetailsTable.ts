export class CreateBusinessDetailsTable1732209451427 {
  name = "CreateBusinessDetailsTable1732209451427";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "business-details" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          source TEXT NOT NULL CHECK(source IN ('local', 'server'))
        );
        CREATE INDEX IF NOT EXISTS idx_business_details_company ON "business-details"(company);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "business-details";`;
  }
}
