export class CreateOrdersTable1732209451435 {
  name = "CreateOrdersTable1732209451435";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS orders (
          _id TEXT PRIMARY KEY,
          company TEXT NOT NULL,
          companyRef TEXT NOT NULL,
          location TEXT NOT NULL,
          locationRef TEXT NOT NULL,
          customer TEXT,
          customerRef TEXT,
          cashier TEXT,
          cashierRef TEXT,
          device TEXT,
          deviceRef TEXT,
          orderNum TEXT NOT NULL,
          tokenNum TEXT,
          orderType TEXT,
          orderStatus TEXT DEFAULT 'completed',
          qrOrdering INTEGER DEFAULT 0,
          onlineOrdering INTEGER DEFAULT 0,
          specialInstructions TEXT,
          items TEXT NOT NULL,
          payment TEXT NOT NULL,
          dineInData TEXT NULL,
          refunds TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          acceptedAt TEXT,
          receivedAt TEXT,
          source TEXT NOT NULL DEFAULT 'local',
          appliedDiscount INTEGER DEFAULT 0,
          paymentMethod TEXT,
          refundAvailable INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(companyRef);
        CREATE INDEX IF NOT EXISTS idx_orders_location ON orders(locationRef);
        CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customerRef);
        CREATE INDEX IF NOT EXISTS idx_orders_cashier ON orders(cashierRef);
        CREATE INDEX IF NOT EXISTS idx_orders_order_num ON orders(orderNum);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(orderStatus);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS orders;`;
  }
}
