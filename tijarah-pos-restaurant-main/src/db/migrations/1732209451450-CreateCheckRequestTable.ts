export class CreateCheckRequestTable1732209451450 {
  name = "CreateCheckRequestTable1732209451450";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "check-request" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          entityName TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('success', 'failed', 'pending')),
          lastSync TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_check_request_entity ON "check-request"(entityName);
        CREATE INDEX IF NOT EXISTS idx_check_request_status ON "check-request"(status);
        CREATE INDEX IF NOT EXISTS idx_check_request_date ON "check-request"(createdAt);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "check-request";`;
  }
}
