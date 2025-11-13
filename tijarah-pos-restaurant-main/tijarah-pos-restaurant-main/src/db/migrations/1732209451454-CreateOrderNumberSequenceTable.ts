export class CreateOrderNumberSequenceTable1732209451454 {
  name = "CreateOrderNumberSequenceTable1732209451454";

  up(): string {
    return `
       CREATE TABLE "order-number-sequence" (
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
         updatedAt TEXT NULL,
         _id TEXT PRIMARY KEY,
         key TEXT NOT NULL,
         deviceRef TEXT,
         value INTEGER NOT NULL,
          source TEXT NOT NULL DEFAULT 'local' CHECK(source IN ('local', 'server'))
       );
     `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "order-number-sequence";`;
  }
}
