export class CreatePrinterTable1732209451436 {
  name = "CreatePrinterTable1732209451436";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS printer (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          name TEXT NOT NULL,
          device_name TEXT NOT NULL,
          device_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          vendor_id TEXT NOT NULL,
          printerType TEXT NOT NULL DEFAULT 'usb',
          printerSize TEXT NOT NULL DEFAULT '3-inch',
          ip TEXT DEFAULT '',
          port INTEGER DEFAULT 0,
          enableReceipts INTEGER NOT NULL DEFAULT 0,
          enableKOT INTEGER NOT NULL DEFAULT 0,
          enableBarcodes INTEGER NOT NULL DEFAULT 0,
          printerWidthMM TEXT DEFAULT '72',
          charsPerLine TEXT DEFAULT '44',
          kitchen TEXT,
          kitchenRef TEXT DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_printer_kitchen ON printer(kitchenRef);
        CREATE INDEX IF NOT EXISTS idx_printer_type ON printer(printerType);
        CREATE INDEX IF NOT EXISTS idx_printer_device ON printer(device_id);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS printer;`;
  }
}
