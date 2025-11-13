export class CreateAdReportTable1732209451443 {
  name = "CreateAdReportTable1732209451443";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "ads-report" (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          adRef TEXT NOT NULL,
          type TEXT NOT NULL,
          adType TEXT NOT NULL,
          status TEXT NOT NULL,
          daysOfWeek TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          deviceRef TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          businessTypeRef TEXT NOT NULL,
          businessType TEXT NOT NULL,
          createdByRole TEXT NOT NULL,
          adName TEXT NOT NULL,
          schedule TEXT NOT NULL,
          location TEXT NOT NULL,
          company TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_ads_report_ad ON "ads-report"(adRef);
        CREATE INDEX IF NOT EXISTS idx_ads_report_location ON "ads-report"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_ads_report_company ON "ads-report"(companyRef);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "ads-report";`;
  }
}
