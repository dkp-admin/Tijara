export class CreateOplogsTable1732209451444 {
  name = "CreateOplogsTable1732209451444";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS opLogs (
          _id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          requestId TEXT,
          data TEXT NOT NULL,
          tableName TEXT NOT NULL,
          action TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('pushed', 'pending'))
        );
        CREATE INDEX IF NOT EXISTS idx_oplogs_table ON opLogs(tableName);
        CREATE INDEX IF NOT EXISTS idx_oplogs_status ON opLogs(status);
        CREATE INDEX IF NOT EXISTS idx_oplogs_timestamp ON opLogs(timestamp);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS opLogs;`;
  }
}
