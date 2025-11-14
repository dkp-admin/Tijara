export class CreateProductsTable1732209451437 {
  name = "CreateProductsTable1732209451437";

  up(): string {
    return `
        CREATE TABLE IF NOT EXISTS products (
          _id TEXT PRIMARY KEY,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NULL,
          parent TEXT,
          name TEXT NOT NULL,
          kitchenFacingName TEXT,
          contains TEXT,
          image TEXT NOT NULL,
          localImage TEXT,
          companyRef TEXT NOT NULL,
          company TEXT NOT NULL,
          categoryRef TEXT NOT NULL,
          category TEXT NOT NULL,
          restaurantCategoryRefs TEXT,
          restaurantCategories TEXT,
          kitchenRefs TEXT,
          kitchens TEXT,
          collectionsRefs TEXT,
          collections TEXT NOT NULL,
          description TEXT NOT NULL,
          brandRef TEXT NOT NULL,
          brand TEXT NOT NULL,
          taxRef TEXT NOT NULL,
          tax TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          source TEXT NOT NULL DEFAULT 'local',
          enabledBatching INTEGER NOT NULL DEFAULT 0,
          bestSeller INTEGER,
          channels TEXT,
          selfOrdering INTEGER DEFAULT 1,
          onlineOrdering INTEGER DEFAULT 1,
          variants TEXT NOT NULL,
          otherVariants TEXT,
          boxes TEXT,
          otherBoxes TEXT,
          nutritionalInformation TEXT,
          modifiers TEXT,
          sortOrder INTEGER DEFAULT 0,
          sku TEXT NOT NULL,
          code TEXT,
          boxRefs TEXT,
          crateRefs TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_products_company ON products(companyRef);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryRef);
        CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brandRef);
        CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
        CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      `;
  }

  down(): string {
    return `DROP TABLE IF EXISTS products;`;
  }
}
