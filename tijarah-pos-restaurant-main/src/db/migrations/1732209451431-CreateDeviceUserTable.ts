export class CreateDeviceUserTable1732209451431 {
  name = "CreateDeviceUserTable1732209451431";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "device-user" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRefs TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          profilePicture TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          userType TEXT NOT NULL,
          permissions TEXT NOT NULL,
          status TEXT NOT NULL,
          onboarded INTEGER NOT NULL,
          version INTEGER NOT NULL,
          pin TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_device_user_email ON "device-user"(email);
        CREATE INDEX IF NOT EXISTS idx_device_user_phone ON "device-user"(phone);
        CREATE INDEX IF NOT EXISTS idx_device_user_company ON "device-user"(companyRef);
        CREATE INDEX IF NOT EXISTS idx_device_user_location ON "device-user"(locationRef);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "device-user";`;
  }
}
