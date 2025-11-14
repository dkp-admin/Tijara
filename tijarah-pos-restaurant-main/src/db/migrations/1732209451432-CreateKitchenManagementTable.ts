export class CreateKitchenManagementTable1732209451432 {
  name = "CreateKitchenManagementTable1732209451432";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "kitchen-management" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          allProducts INTEGER DEFAULT 0,
          allCategories INTEGER DEFAULT 0,
          productRefs TEXT,
          categoryRefs TEXT,
          products TEXT,
          categories TEXT,
          printerName TEXT,
          printerAssigned INTEGER DEFAULT 0,
          device TEXT,
          deviceRef TEXT,
          status TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server' CHECK(source IN ('local', 'server'))
        );
        CREATE INDEX IF NOT EXISTS idx_kitchen_company ON "kitchen-management"(companyRef);
        CREATE INDEX IF NOT EXISTS idx_kitchen_location ON "kitchen-management"(locationRef);
        CREATE INDEX IF NOT EXISTS idx_kitchen_status ON "kitchen-management"(status);
        CREATE INDEX IF NOT EXISTS idx_kitchen_device ON "kitchen-management"(deviceRef);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "kitchen-management";`;
  }
}
