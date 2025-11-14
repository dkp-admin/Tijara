export class CreateBillingSettingsTable1732209451426 {
  name = "CreateBillingSettingsTable1732209451426";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS "billing-settings" (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          quickAmounts INTEGER NOT NULL,
          catalogueManagement INTEGER NOT NULL,
          paymentTypes TEXT NOT NULL,
          orderTypesList TEXT NOT NULL,
          cardPaymentOption TEXT NOT NULL DEFAULT 'manual',
          defaultCompleteBtn TEXT NOT NULL,
          defaultCash REAL NOT NULL,
          noOfReceiptPrint TEXT NOT NULL,
          cashManagement INTEGER NOT NULL,
          orderTypes TEXT NOT NULL,
          terminalId TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'server',
          keypad INTEGER NOT NULL,
          discounts INTEGER NOT NULL,
          promotions INTEGER NOT NULL DEFAULT 1,
          customCharges INTEGER NOT NULL DEFAULT 1
        );
        CREATE INDEX IF NOT EXISTS idx_billing_settings_terminal ON "billing-settings"(terminalId);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS "billing-settings";`;
  }
}
