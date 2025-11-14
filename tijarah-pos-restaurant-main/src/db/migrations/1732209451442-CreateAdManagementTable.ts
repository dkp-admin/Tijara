export class CreateAdManagementTable1732209451442 {
  name = "CreateAdManagementTable1732209451442";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "ads-management" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          slidesData TEXT NOT NULL,
          status TEXT NOT NULL,
          priority TEXT NOT NULL,
          locationRefs TEXT,
          companyRefs TEXT,
          businessTypeRefs TEXT,
          dateRange TEXT NOT NULL,
          excludedLocationRefs TEXT,
          excludedCompanyRefs TEXT,
          daysOfWeek TEXT NOT NULL,
          createdByRole TEXT NOT NULL,
          lastPlayedAt TEXT,
          sentToPos INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_ads_management_status ON "ads-management"(status);
        CREATE INDEX IF NOT EXISTS idx_ads_management_type ON "ads-management"(type);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "ads-management";`;
  }
}
