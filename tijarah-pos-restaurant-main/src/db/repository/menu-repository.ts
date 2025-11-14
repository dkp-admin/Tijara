import { BaseRepository } from "./base-repository";
import { Menu, CategoryMenu } from "../schema/menu";
import { Product } from "../schema/product/product";

export class MenuRepository extends BaseRepository<Menu, string> {
  constructor() {
    super("menu");
  }

  async create(menu: Menu): Promise<Menu> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO menu (
        _id, company, companyRef, location, locationRef,
        categories, products, orderType, createdAt,
        updatedAt, source
      ) VALUES (
        $id, $company, $companyRef, $location, $locationRef,
        $categories, $products, $orderType, CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP, $source
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        categories = $categories,
        products = $products,
        orderType = $orderType,
        updatedAt = CURRENT_TIMESTAMP,
        source = $source
    `);

    const params: any = {
      $id: menu._id,
      $company: JSON.stringify(menu.company),
      $companyRef: menu.companyRef,
      $location: JSON.stringify(menu.location),
      $locationRef: menu.locationRef,
      $categories: JSON.stringify(menu.categories),
      $products: JSON.stringify(menu.products),
      $orderType: menu.orderType,
      $createdAt: menu.createdAt || now,
      $updatedAt: menu.updatedAt || now,
      $source: menu.source,
    };

    try {
      const result = await statement.executeAsync(params);
      return menu;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(menus: Menu[]): Promise<Menu[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "location",
      "locationRef",
      "categories",
      "products",
      "orderType",
    ];

    const generateParams = (menu: Menu) => {
      const toRow = Menu.toRow(menu);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.location,
        toRow.locationRef,
        toRow.categories,
        toRow.products,
        toRow.orderType,
      ];
    };

    return this.createManyGeneric("menu", menus, columns, generateParams);
  }

  async paginateWithChannel(
    page: number,
    rowsPerPage: number,
    channel: string
  ): Promise<[Menu[], number]> {
    const offset = rowsPerPage * (page - 1);

    const countStatement = await this.db.getConnection().prepareAsync(`
      SELECT COUNT(*) as total FROM menu
      ${channel ? "WHERE orderType = $channel" : ""}
    `);

    const queryStatement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM menu 
      ${channel ? "WHERE orderType = $channel" : ""}
      LIMIT $limit OFFSET $offset
    `);

    try {
      const params: any = channel ? { $channel: channel } : {};
      const countResult: any = await countStatement.executeAsync(params);
      const total = parseInt((await countResult.getFirstAsync()).total, 10);

      const result = await queryStatement.executeAsync({
        ...params,
        $limit: rowsPerPage,
        $offset: offset,
      });
      const rows = await result.getAllAsync();
      return [rows.map((row) => Menu.fromRow(row)), total];
    } finally {
      await countStatement.finalizeAsync();
      await queryStatement.finalizeAsync();
    }
  }

  async update(id: string, menu: Menu): Promise<Menu> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE menu SET
        company = $company,
        companyRef = $companyRef,
        location = $location,
        locationRef = $locationRef,
        categories = $categories,
        products = $products,
        orderType = $orderType,
        updatedAt = CURRENT_TIMESTAMP,
        source = $source
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $company: JSON.stringify(menu.company),
      $companyRef: menu.companyRef,
      $location: JSON.stringify(menu.location),
      $locationRef: menu.locationRef,
      $categories: JSON.stringify(menu.categories),
      $products: JSON.stringify(menu.products),
      $orderType: menu.orderType,
      $updatedAt: now,
      $source: menu.source,
    };

    try {
      await statement.executeAsync(params);
      menu._id = id;
      menu.updatedAt = now;
      return menu;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM menu WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Menu> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM menu WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Menu not found");
      }
      return Menu.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<Menu[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM menu
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Menu.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<Menu[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM menu WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Menu.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByOrderType(orderType: string): Promise<Menu | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM menu WHERE orderType = $orderType
    `);

    try {
      const result = await statement.executeAsync({ $orderType: orderType });
      const row = await result.getFirstAsync();
      return row ? Menu.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateCategories(
    id: string,
    categories: CategoryMenu[]
  ): Promise<Menu> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE menu SET
        categories = $categories,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $categories: JSON.stringify(categories),
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateProducts(id: string, products: Product[]): Promise<Menu> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE menu SET
        products = $products,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $products: JSON.stringify(products),
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateCategory(
    id: string,
    categoryRef: string,
    updates: Partial<CategoryMenu>
  ): Promise<Menu> {
    const menu = await this.findById(id);
    const categoryIndex = menu.categories.findIndex(
      (cat) => cat.categoryRef === categoryRef
    );

    if (categoryIndex >= 0) {
      menu.categories[categoryIndex] = {
        ...menu.categories[categoryIndex],
        ...updates,
      };
      return this.update(id, menu);
    }

    throw new Error("Category not found in menu");
  }

  async reorderCategories(id: string, categoryRefs: string[]): Promise<Menu> {
    const menu = await this.findById(id);
    const categoryMap = new Map(
      menu.categories.map((cat) => [cat.categoryRef, cat])
    );

    menu.categories = categoryRefs.map((ref, index) => {
      const category = categoryMap.get(ref);
      if (category) {
        return { ...category, sortOrder: index };
      }
      throw new Error(`Category ${ref} not found in menu`);
    });

    return this.update(id, menu);
  }

  async bulkUpdate(menus: Menu[]): Promise<void> {
    await this.db.getConnection().execAsync("BEGIN TRANSACTION");

    try {
      for (const menu of menus) {
        if (menu._id) {
          await this.update(menu._id, menu);
        } else {
          await this.create(menu);
        }
      }
      await this.db.getConnection().execAsync("COMMIT");
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    }
  }
}
