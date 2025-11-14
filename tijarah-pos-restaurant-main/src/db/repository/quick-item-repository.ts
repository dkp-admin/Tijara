import { QuickItem } from "../schema/quick-item";
import { BaseRepository } from "./base-repository";

export class QuickItemsRepository extends BaseRepository<QuickItem, string> {
  constructor() {
    super("quick-items");
  }

  async create(item: QuickItem): Promise<QuickItem> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "quick-items" (
        _id, company, companyRef, location, locationRef,
        menuRef, menu, product, productRef, type, source, createdAt, updatedAt
      ) VALUES (
        $id, $company, $companyRef, $location, $locationRef,
        $menuRef, $menu, $product, $productRef, $type, $source, CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        menuRef = $menuRef,
        menu = $menu,
        product = $product,
        productRef = $productRef,
        type = $type,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: item._id,
      $company: JSON.stringify(item.company),
      $companyRef: item.companyRef,
      $location: JSON.stringify(item.location),
      $locationRef: item.locationRef,
      $menuRef: item.menuRef,
      $menu: item.menu,
      $product: JSON.stringify(item.product),
      $productRef: item.productRef,
      $type: item.type,
      $source: item.source,
    };

    try {
      await statement.executeAsync(params);
      return item;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(items: QuickItem[]): Promise<QuickItem[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "location",
      "locationRef",
      "menuRef",
      "menu",
      "product",
      "productRef",
      "type",
      "source",
    ];

    const generateParams = (item: QuickItem) => {
      const toRow = QuickItem.toRow(item);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.location,
        toRow.locationRef,
        toRow.menuRef,
        toRow.menu,
        toRow.product,
        toRow.productRef,
        toRow.type,
        toRow.source,
      ];
    };

    return this.createManyGeneric(
      "quick-items",
      items,
      columns,
      generateParams
    );
  }

  async update(id: string, item: QuickItem): Promise<QuickItem> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "quick-items" SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        menuRef = $menuRef,
        menu = $menu,
        product = $product,
        productRef = $productRef,
        type = $type,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params: any = {
      $id: id,
      $company: JSON.stringify(item.company),
      $companyRef: item.companyRef,
      $location: JSON.stringify(item.location),
      $locationRef: item.locationRef,
      $menuRef: item.menuRef,
      $menu: item.menu,
      $product: JSON.stringify(item.product),
      $productRef: item.productRef,
      $type: item.type,
      $source: item.source,
    };

    try {
      await statement.executeAsync(params);
      item._id = id;
      return item;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "quick-items" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<QuickItem> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "quick-items" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Quick item not found");
      }
      return QuickItem.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<QuickItem[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "quick-items"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => QuickItem.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<QuickItem[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "quick-items" WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => QuickItem.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByMenu(menuRef: string): Promise<QuickItem[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "quick-items" WHERE menuRef = $menuRef
    `);

    try {
      const result = await statement.executeAsync({ $menuRef: menuRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => QuickItem.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByProduct(productRef: string): Promise<QuickItem[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "quick-items" WHERE productRef = $productRef
    `);

    try {
      const result = await statement.executeAsync({ $productRef: productRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => QuickItem.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async bulkCreate(items: QuickItem[]): Promise<QuickItem[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "quick-items" (
        _id, company, companyRef, location, locationRef,
        menuRef, menu, product, productRef, type, source, createdAt, updatedAt
      ) VALUES (
        $id, $company, $companyRef, $location, $locationRef,
        $menuRef, $menu, $product, $productRef, $type, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    await this.db.getConnection().execAsync("BEGIN TRANSACTION");
    const results: QuickItem[] = [];

    try {
      for (const item of items) {
        const params: any = {
          $id: item._id,
          $company: JSON.stringify(item.company),
          $companyRef: item.companyRef,
          $location: JSON.stringify(item.location),
          $locationRef: item.locationRef,
          $menuRef: item.menuRef,
          $menu: item.menu,
          $product: JSON.stringify(item.product),
          $productRef: item.productRef,
          $type: item.type,
          $source: item.source,
        };

        await statement.executeAsync(params);
        results.push(item);
      }

      await this.db.getConnection().execAsync("COMMIT");
      return results;
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteByMenu(menuRef: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "quick-items" WHERE menuRef = $menuRef
    `);

    try {
      await statement.executeAsync({ $menuRef: menuRef });
    } finally {
      await statement.finalizeAsync();
    }
  }
}
