export class CreateLogsTable1732209451433 {
  name = "CreateLogsTable1732209451433";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          entityName TEXT,
          eventName TEXT,
          response TEXT,
          eventType TEXT,
          triggeredBy TEXT,
          success INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_logs_entity ON logs(entityName);
        CREATE INDEX IF NOT EXISTS idx_logs_event_type ON logs(eventType);
        CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(createdAt);
        CREATE INDEX IF NOT EXISTS idx_logs_triggered_by ON logs(triggeredBy);
        CREATE INDEX IF NOT EXISTS idx_logs_success ON logs(success);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS logs;`;
  }
}
