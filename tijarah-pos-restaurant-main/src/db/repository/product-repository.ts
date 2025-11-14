import { rowsPerPage } from "../../utils/constants";
import { Product } from "../schema/product/product";
import { BaseRepository } from "./base-repository";

export interface WhereClause {
  where?: {
    collectionsRefs?: { _like?: string } | string;
    [key: string]: any;
  };
}

export interface FindOptions {
  take?: number;
  skip?: number;
  where?: {
    name?: { operator?: string; value?: string } | string;
    categoryRef?: string;
    variants?: { operator?: string; value?: string };
    [key: string]: any;
  };
}

export class ProductRepository extends BaseRepository<Product, string> {
  constructor() {
    super("products");
  }

  async create(product: Product): Promise<Product> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO products (
        _id, parent, name, kitchenFacingName, contains, image,
        localImage, companyRef, company, categoryRef, category,
        restaurantCategoryRefs, restaurantCategories, kitchenRefs,
        kitchens, collectionsRefs, collections, description,
        brandRef, brand, taxRef, tax, status, source,
        enabledBatching, bestSeller, channels, selfOrdering,
        onlineOrdering, variants, otherVariants, boxes,
        otherBoxes, nutritionalInformation, modifiers,
        sortOrder, sku, code, boxRefs, crateRefs, createdAt, updatedAt
      ) VALUES (
        $id, $parent, $name, $kitchenFacingName, $contains, $image,
        $localImage, $companyRef, $company, $categoryRef, $category,
        $restaurantCategoryRefs, $restaurantCategories, $kitchenRefs,
        $kitchens, $collectionsRefs, $collections, $description,
        $brandRef, $brand, $taxRef, $tax, $status, $source,
        $enabledBatching, $bestSeller, $channels, $selfOrdering,
        $onlineOrdering, $variants, $otherVariants, $boxes,
        $otherBoxes, $nutritionalInformation, $modifiers,
        $sortOrder, $sku, $code, $boxRefs, $crateRefs, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        parent = $parent,
        name = $name,
        kitchenFacingName = $kitchenFacingName,
        contains = $contains,
        image = $image,
        localImage = $localImage,
        companyRef = $companyRef,
        company = $company,
        categoryRef = $categoryRef,
        category = $category,
        restaurantCategoryRefs = $restaurantCategoryRefs,
        restaurantCategories = $restaurantCategories,
        kitchenRefs = $kitchenRefs,
        kitchens = $kitchens,
        collectionsRefs = $collectionsRefs,
        collections = $collections,
        description = $description,
        brandRef = $brandRef,
        brand = $brand,
        taxRef = $taxRef,
        tax = $tax,
        status = $status,
        source = $source,
        enabledBatching = $enabledBatching,
        bestSeller = $bestSeller,
        channels = $channels,
        selfOrdering = $selfOrdering,
        onlineOrdering = $onlineOrdering,
        variants = $variants,
        otherVariants = $otherVariants,
        boxes = $boxes,
        otherBoxes = $otherBoxes,
        nutritionalInformation = $nutritionalInformation,
        modifiers = $modifiers,
        sortOrder = $sortOrder,
        sku = $sku,
        code = $code,
        boxRefs = $boxRefs,
        crateRefs = $crateRefs,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: product._id,
      $parent: product.parent || null,
      $name: JSON.stringify(product.name),
      $kitchenFacingName: product.kitchenFacingName
        ? JSON.stringify(product.kitchenFacingName)
        : null,
      $contains: product.contains || null,
      $image: product.image,
      $localImage: product.localImage || null,
      $companyRef: product.companyRef,
      $company: JSON.stringify(product.company),
      $categoryRef: product.categoryRef,
      $category: JSON.stringify(product.category),
      $restaurantCategoryRefs: JSON.stringify(product.restaurantCategoryRefs),
      $restaurantCategories: JSON.stringify(product.restaurantCategories),
      $kitchenRefs: JSON.stringify(product.kitchenRefs),
      $kitchens: JSON.stringify(product.kitchens),
      $collectionsRefs: JSON.stringify(product.collectionsRefs),
      $collections: JSON.stringify(product.collections),
      $description: product.description,
      $brandRef: product.brandRef,
      $brand: JSON.stringify(product.brand),
      $taxRef: product.taxRef,
      $tax: JSON.stringify(product.tax),
      $status: product.status,
      $source: product.source,
      $enabledBatching: Number(product.enabledBatching),
      $bestSeller: product.bestSeller ? Number(product.bestSeller) : null,
      $channels: JSON.stringify(product.channels),
      $selfOrdering: Number(product.selfOrdering),
      $onlineOrdering: Number(product.onlineOrdering),
      $variants: JSON.stringify(product.variants),
      $otherVariants: product.otherVariants
        ? JSON.stringify(product.otherVariants)
        : null,
      $boxes: product.boxes ? JSON.stringify(product.boxes) : null,
      $otherBoxes: product.otherBoxes
        ? JSON.stringify(product.otherBoxes)
        : null,
      $nutritionalInformation: product.nutritionalInformation
        ? JSON.stringify(product.nutritionalInformation)
        : null,
      $modifiers: product.modifiers ? JSON.stringify(product.modifiers) : null,
      $sortOrder: product.sortOrder || 0,
      $sku: JSON.stringify(product.sku),
      $code: JSON.stringify(product.code || []),
      $boxRefs: JSON.stringify(product.boxRefs || []),
      $crateRefs: JSON.stringify(product.crateRefs || []),
    };

    try {
      await statement.executeAsync(params);
      return product;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async prepareQuery(products: Product[]) {
    const startQueryBuildTime = Date.now();

    const placeholders = products
      .map(
        () =>
          `(${new Array(40)
            .fill("?")
            .join(",")}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .join(",");

    const query = `
      INSERT INTO products (
        _id, parent, name, kitchenFacingName, contains, image,
        localImage, companyRef, company, categoryRef, category,
        restaurantCategoryRefs, restaurantCategories, kitchenRefs,
        kitchens, collectionsRefs, collections, description,
        brandRef, brand, taxRef, tax, status, source,
        enabledBatching, bestSeller, channels, selfOrdering,
        onlineOrdering, variants, otherVariants, boxes,
        otherBoxes, nutritionalInformation, modifiers,
        sortOrder, sku, code, boxRefs, crateRefs, createdAt, updatedAt
      ) VALUES ${placeholders}
    `;

    const params = products.flatMap((product) => [
      product._id,
      product.parent,
      product.name,
      product.kitchenFacingName,
      product.contains,
      product.image,
      product.localImage,
      product.companyRef,
      product.company,
      product.categoryRef,
      product.category,
      product.restaurantCategoryRefs,
      product.restaurantCategories,
      product.kitchenRefs,
      product.kitchens,
      product.collectionsRefs,
      product.collections,
      product.description,
      product.brandRef,
      product.brand,
      product.taxRef,
      product.tax,
      product.status,
      product.source,
      product.enabledBatching,
      product.bestSeller,
      product.channels,
      product.selfOrdering,
      Number(product.onlineOrdering),
      JSON.stringify(product.variants),
      product.otherVariants ? JSON.stringify(product.otherVariants) : null,
      product.boxes ? JSON.stringify(product.boxes) : null,
      product.otherBoxes ? JSON.stringify(product.otherBoxes) : null,
      product.nutritionalInformation
        ? JSON.stringify(product.nutritionalInformation)
        : null,
      product.modifiers ? JSON.stringify(product.modifiers) : null,
      product.sortOrder || 0,
      JSON.stringify(product.sku),
      JSON.stringify(product.code || []),
      JSON.stringify(product.boxRefs || []),
      JSON.stringify(product.crateRefs || []),
    ]);

    const endQueryTime = Date.now();

    return { query, params, difference: endQueryTime - startQueryBuildTime };
  }

  async createMany(products: Product[]): Promise<Product[]> {
    const columns = [
      "_id",
      "parent",
      "name",
      "kitchenFacingName",
      "contains",
      "image",
      "localImage",
      "companyRef",
      "company",
      "categoryRef",
      "category",
      "restaurantCategoryRefs",
      "restaurantCategories",
      "kitchenRefs",
      "kitchens",
      "collectionsRefs",
      "collections",
      "description",
      "brandRef",
      "brand",
      "taxRef",
      "tax",
      "status",
      "source",
      "enabledBatching",
      "bestSeller",
      "channels",
      "selfOrdering",
      "onlineOrdering",
      "variants",
      "otherVariants",
      "boxes",
      "otherBoxes",
      "nutritionalInformation",
      "modifiers",
      "sortOrder",
      "sku",
      "code",
      "boxRefs",
      "crateRefs",
    ];

    const generateParams = (product: Product) => {
      const toRowProd = Product.toRow(product);
      return [
        toRowProd._id,
        toRowProd.parent,
        toRowProd.name,
        toRowProd.kitchenFacingName,
        toRowProd.contains,
        toRowProd.image,
        toRowProd.localImage,
        toRowProd.companyRef,
        toRowProd.company,
        toRowProd.categoryRef,
        toRowProd.category,
        toRowProd.restaurantCategoryRefs,
        toRowProd.restaurantCategories,
        toRowProd.kitchenRefs,
        toRowProd.kitchens,
        toRowProd.collectionsRefs,
        toRowProd.collections,
        toRowProd.description,
        toRowProd.brandRef,
        toRowProd.brand,
        toRowProd.taxRef,
        toRowProd.tax,
        toRowProd.status,
        toRowProd.source,
        toRowProd.enabledBatching,
        toRowProd.bestSeller,
        toRowProd.channels,
        toRowProd.selfOrdering,
        Number(toRowProd.onlineOrdering),
        toRowProd.variants,
        toRowProd.otherVariants,
        toRowProd.boxes,
        toRowProd.otherBoxes,
        toRowProd.nutritionalInformation,
        toRowProd.modifiers,
        toRowProd.sortOrder,
        toRowProd.sku,
        toRowProd.code,
        toRowProd.boxRefs,
        toRowProd.crateRefs,
      ];
    };

    return this.createManyGeneric(
      "products",
      products,
      columns,
      generateParams
    );
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM products WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Product> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM products WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Product not found");
      }
      return Product.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<Product[]> {
    const statement = await this.db.getConnection().prepareAsync(`
    SELECT * FROM products 
    ORDER BY sortOrder ASC, 
    json_extract(name, '$.en') ASC
  `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Product.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async update(id: string, product: Product): Promise<Product> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE products SET
        parent = $parent,
        name = $name,
        kitchenFacingName = $kitchenFacingName,
        contains = $contains,
        image = $image,
        localImage = $localImage,
        companyRef = $companyRef,
        company = $company,
        categoryRef = $categoryRef,
        category = $category,
        restaurantCategoryRefs = $restaurantCategoryRefs,
        restaurantCategories = $restaurantCategories,
        kitchenRefs = $kitchenRefs,
        kitchens = $kitchens,
        collectionsRefs = $collectionsRefs,
        collections = $collections,
        description = $description,
        brandRef = $brandRef,
        brand = $brand,
        taxRef = $taxRef,
        tax = $tax,
        status = $status,
        source = $source,
        enabledBatching = $enabledBatching,
        bestSeller = $bestSeller,
        channels = $channels,
        selfOrdering = $selfOrdering,
        onlineOrdering = $onlineOrdering,
        variants = $variants,
        otherVariants = $otherVariants,
        boxes = $boxes,
        otherBoxes = $otherBoxes,
        nutritionalInformation = $nutritionalInformation,
        modifiers = $modifiers,
        sortOrder = $sortOrder,
        sku = $sku,
        code = $code,
        boxRefs = $boxRefs,
        crateRefs = $crateRefs,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $parent: product.parent || null,
      $name: JSON.stringify(product.name),
      $kitchenFacingName: product.kitchenFacingName
        ? JSON.stringify(product.kitchenFacingName)
        : null,
      $contains: product.contains || null,
      $image: product.image,
      $localImage: product.localImage || null,
      $companyRef: product.companyRef,
      $company: JSON.stringify(product.company),
      $categoryRef: product.categoryRef,
      $category: JSON.stringify(product.category),
      $restaurantCategoryRefs: JSON.stringify(product.restaurantCategoryRefs),
      $restaurantCategories: JSON.stringify(product.restaurantCategories),
      $kitchenRefs: JSON.stringify(product.kitchenRefs),
      $kitchens: JSON.stringify(product.kitchens),
      $collectionsRefs: JSON.stringify(product.collectionsRefs),
      $collections: JSON.stringify(product.collections),
      $description: product.description,
      $brandRef: product.brandRef,
      $brand: JSON.stringify(product.brand),
      $taxRef: product.taxRef,
      $tax: JSON.stringify(product.tax),
      $status: product.status,
      $source: product.source,
      $enabledBatching: Number(product.enabledBatching),
      $bestSeller: product.bestSeller ? Number(product.bestSeller) : null,
      $channels: JSON.stringify(product.channels),
      $selfOrdering: Number(product.selfOrdering),
      $onlineOrdering: Number(product.onlineOrdering),
      $variants: JSON.stringify(product.variants),
      $otherVariants: product.otherVariants
        ? JSON.stringify(product.otherVariants)
        : null,
      $boxes: product.boxes ? JSON.stringify(product.boxes) : null,
      $otherBoxes: product.otherBoxes
        ? JSON.stringify(product.otherBoxes)
        : null,
      $nutritionalInformation: product.nutritionalInformation
        ? JSON.stringify(product.nutritionalInformation)
        : null,
      $modifiers: product.modifiers ? JSON.stringify(product.modifiers) : null,
      $sortOrder: product.sortOrder || 0,
      $sku: JSON.stringify(product.sku),
      $code: JSON.stringify(product.code || []),
      $boxRefs: JSON.stringify(product.boxRefs || []),
      $crateRefs: JSON.stringify(product.crateRefs || []),
    };

    try {
      await statement.executeAsync(params);
      product._id = id;
      return product;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateVariants(id: string, variants: any[]): Promise<Product> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE products SET variants = $variants, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $variants: JSON.stringify(variants),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateBoxes(id: string, boxes: any[]): Promise<Product> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE products SET boxes = $boxes, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $boxes: JSON.stringify(boxes),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<Product> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE products SET status = $status, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $status: status,
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE products SET status = $status, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    await this.db.getConnection().execAsync("BEGIN TRANSACTION");

    try {
      for (const id of ids) {
        await statement.executeAsync({
          $id: id,
          $status: status,
        });
      }
      await this.db.getConnection().execAsync("COMMIT");
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateSortOrder(
    sortOrders: { id: string; order: number }[]
  ): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE products SET sortOrder = $order, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    await this.db.getConnection().execAsync("BEGIN TRANSACTION");

    try {
      for (const { id, order } of sortOrders) {
        await statement.executeAsync({
          $id: id,
          $order: order,
        });
      }
      await this.db.getConnection().execAsync("COMMIT");
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCategory(categoryRef: string): Promise<Product[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM products 
      WHERE categoryRef = $categoryRef 
      AND status = 'active'
      ORDER BY sortOrder ASC
    `);

    try {
      const result = await statement.executeAsync({
        $categoryRef: categoryRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Product.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findBySku(sku: string): Promise<Product | null> {
    // Normalize the SKU by trimming whitespace
    const normalizedSku = sku.trim();

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM products 
      WHERE 
        LOWER(sku) = LOWER($sku)
        OR sku LIKE '%' || $sku || '%'
        OR EXISTS (
          SELECT 1 FROM json_each(variants) 
          WHERE LOWER(json_extract(value, '$.sku')) = LOWER($sku)
          OR json_extract(value, '$.sku') LIKE '%' || $sku || '%'
        )
        OR EXISTS (
          SELECT 1 FROM json_each(boxes) 
          WHERE LOWER(json_extract(value, '$.sku')) = LOWER($sku)
          OR json_extract(value, '$.sku') LIKE '%' || $sku || '%'
        )
      LIMIT 1
    `);

    try {
      const result = await statement.executeAsync({
        $sku: normalizedSku,
      });

      const row = await result.getFirstAsync();
      if (!row) return null;

      return Product.fromRow(row);
    } catch (error) {
      console.error("Error in findBySku:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCollection(collectionRef: string): Promise<Product[]> {
    const statement = await this.db.getConnection().prepareAsync(`
     SELECT * FROM products 
WHERE collectionsRefs LIKE '%' || $collectionRef || '%'
AND status = 'active'
ORDER BY sortOrder ASC
    `);

    try {
      const result = await statement.executeAsync({
        $collectionRef: collectionRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Product.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async search(
    query: string,
    filters?: {
      categoryRef?: string;
      bestSeller?: boolean;
      onlineOrdering?: boolean;
      selfOrdering?: boolean;
    }
  ): Promise<Product[]> {
    let conditions = [
      `(
  json_extract(name, '$.en') LIKE '%' || $pattern || '%' 
  OR json_extract(name, '$.ar') LIKE '%' || $pattern || '%'
  OR sku LIKE '%' || $query || '%'
  OR code LIKE '%' || $query || '%'
)
AND status = 'active'`,
    ];

    const params: Record<string, any> = {
      $pattern: `%${query}%`,
      $query: query,
    };

    if (filters?.categoryRef) {
      conditions.push("categoryRef = $categoryRef");
      params.$categoryRef = filters.categoryRef;
    }
    if (filters?.bestSeller !== undefined) {
      conditions.push("bestSeller = $bestSeller");
      params.$bestSeller = Number(filters.bestSeller);
    }
    if (filters?.onlineOrdering !== undefined) {
      conditions.push("onlineOrdering = $onlineOrdering");
      params.$onlineOrdering = Number(filters.onlineOrdering);
    }
    if (filters?.selfOrdering !== undefined) {
      conditions.push("selfOrdering = $selfOrdering");
      params.$selfOrdering = Number(filters.selfOrdering);
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM products 
      WHERE ${conditions.join(" AND ")}
      ORDER BY sortOrder ASC
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => Product.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async count(query: WhereClause): Promise<number> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (query.where) {
        Object.entries(query.where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            if (value._like) {
              const paramName = `$pattern${paramIndex++}`;
              const cleanPattern = value._like.replace(/%/g, "");

              switch (key) {
                case "collectionsRefs":
                  conditions.push(
                    `collectionsRefs LIKE '%' || ${paramName} || '%'`
                  );
                  params[paramName] = cleanPattern;
                  break;
                case "name":
                  conditions.push(`(
                    json_extract(name, '$.en') LIKE ${paramName}
                    OR json_extract(name, '$.ar') LIKE ${paramName}
                  )`);
                  params[paramName] = `%${cleanPattern}%`;
                  break;
                default:
                  conditions.push(`${key} LIKE ${paramName}`);
                  params[paramName] = `%${cleanPattern}%`;
              }
            }
          } else {
            const paramName = `$value${paramIndex++}`;
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value;
          }
        });
      }

      const statement = await this.db.getConnection().prepareAsync(`
        SELECT COUNT(*) as total 
        FROM products
        ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      `);

      try {
        const result = await statement.executeAsync(params);
        const countResult: any = await result.getFirstAsync();
        return Number(countResult.total);
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in count method:", error);
      throw error;
    }
  }

  async getPaginatedProducts(
    pageParam: number = 1,
    categoryId?: string,
    query?: string,
    rowsPerPage: number = 100
  ): Promise<[Product[], number]> {
    const conditions: string[] = ["status = 'active'"];
    const params: Record<string, any> = {
      $limit: rowsPerPage,
      $offset: rowsPerPage * (pageParam - 1),
    };

    if (categoryId) {
      conditions.push("categoryRef = $categoryRef");
      params.$categoryRef = categoryId;
    }

    if (query) {
      // Create a nested OR condition group
      const searchConditions: string[] = [
        "json_extract(name, '$.en') LIKE $pattern",
        "json_extract(name, '$.ar') LIKE $pattern",
      ];

      params.$pattern = `%${query}%`;

      if (Number(query) || query.trim()) {
        searchConditions.push(`
          EXISTS (
            SELECT 1 FROM json_each(variants) 
            WHERE json_extract(value, '$.sku') LIKE $skuPattern
          )`);
        params.$skuPattern = `%${query}%`;

        searchConditions.push(`
          EXISTS (
            SELECT 1 FROM json_each(variants) 
            WHERE json_extract(value, '$.code') LIKE $codePattern
          )`);
        params.$codePattern = `%${query}%`;
      }

      // Join all search conditions with OR and wrap them in parentheses
      conditions.push(`(${searchConditions.join(" OR ")})`);
    }

    const baseQuery = `
      SELECT * FROM products 
      WHERE ${conditions.join(" AND ")}
    `;

    const countStatement = await this.db
      .getConnection()
      .prepareAsync(`SELECT COUNT(*) as total FROM (${baseQuery})`);

    const queryStatement = await this.db.getConnection().prepareAsync(`
      ${baseQuery}
      ORDER BY json_extract(name, '$.en')
      LIMIT $limit OFFSET $offset
    `);

    try {
      const countResult: any = await countStatement.executeAsync(params);
      const total = Number((await countResult.getFirstAsync()).total);

      const result = await queryStatement.executeAsync(params);
      const rows = await result.getAllAsync();
      return [rows.map((row) => Product.fromRow(row)), total];
    } finally {
      await countStatement.finalizeAsync();
      await queryStatement.finalizeAsync();
    }
  }
  async getPaginatedProductsWithQuery(
    pageParam: number = 1,
    rowsPerPage: number = 100,
    whereClause?: string,
    categoryId?: string,
    additionalParams: Record<string, any> = {}
  ): Promise<[Product[], number]> {
    try {
      let conditions: string[] = [];
      const params: Record<string, any> = {
        $limit: rowsPerPage,
        $offset: rowsPerPage * (pageParam - 1),
        ...additionalParams,
      };

      if (whereClause) {
        conditions.push(whereClause);
      } else {
        conditions.push("status = 'active'");

        if (categoryId) {
          conditions.push("categoryRef = $categoryRef");
          params.$categoryRef = categoryId;
        }
      }

      const baseQuery = `
        SELECT * FROM products
        WHERE ${conditions.join(" AND ")}
      `;

      const countStatement = await this.db
        .getConnection()
        .prepareAsync(`SELECT COUNT(*) as total FROM (${baseQuery})`);

      const queryStatement = await this.db.getConnection().prepareAsync(`
        ${baseQuery}
        ORDER BY _id DESC
        LIMIT $limit OFFSET $offset
      `);

      try {
        const countResult: any = await countStatement.executeAsync(params);
        const total = Number((await countResult.getFirstAsync()).total);

        const result = await queryStatement.executeAsync(params);
        const rows = await result.getAllAsync();
        return [rows.map((row) => Product.fromRow(row)), total];
      } finally {
        await countStatement.finalizeAsync();
        await queryStatement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in getPaginatedProductsWithQuery:", error);
      throw error; // Better to throw the error and handle it at a higher level
    }
  }

  async fetchProductsFromList(
    pageParam: number,
    query: string
  ): Promise<Product[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM products 
      WHERE status = 'active'
      AND variants IS NOT NULL
      AND variants != 'false'
      AND (
        LOWER(json_extract(name, '$.en')) LIKE LOWER($pattern)
        OR LOWER(json_extract(name, '$.ar')) LIKE LOWER($pattern)
        OR EXISTS (
          SELECT 1 FROM json_each(variants) 
          WHERE json_extract(value, '$.sku') LIKE $skuPattern
        )
        OR EXISTS (
          SELECT 1 FROM json_each(boxes) 
          WHERE json_extract(value, '$.sku') LIKE $skuPattern
        )
      )
      ORDER BY json_extract(name, '$.en')
      LIMIT $limit OFFSET $offset
    `);

    try {
      const pattern = `%${query}%`;
      const result = await statement.executeAsync({
        $pattern: pattern,
        $skuPattern: pattern,
        $limit: rowsPerPage,
        $offset: rowsPerPage * (pageParam - 1),
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Product.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  // Helper method for building WHERE clause
  private buildSearchWhereClause(query?: string, categoryId?: string): string {
    const conditions: string[] = ["status = 'active'"];

    if (categoryId) {
      conditions.push(`categoryRef = '${categoryId}'`);
    }

    if (query?.trim()) {
      const searchConditions = [
        `json_extract(name, '$.en') LIKE '%${query}%'`,
        `json_extract(name, '$.ar') LIKE '%${query}%'`,
      ];

      if (Number(query)) {
        searchConditions.push(`
          EXISTS (
            SELECT 1 FROM json_each(variants) 
            WHERE json_extract(value, '$.sku') LIKE '%${query}%'
          )`);
      }

      searchConditions.push(`
        EXISTS (
          SELECT 1 FROM json_each(variants) 
          WHERE json_extract(value, '$.code') LIKE '%${query}%'
        )`);

      conditions.push(`(${searchConditions.join(" OR ")})`);
    }

    return `WHERE ${conditions.join(" AND ")}`;
  }

  async find(options: FindOptions): Promise<[Product[], number]> {
    try {
      let baseQuery = "SELECT * FROM products";
      const params: any[] = [];
      const conditions: string[] = [];

      // Handle where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle ILike operator for name
            if ("operator" in value && value.operator === "ILike") {
              const cleanPattern = value.value?.replace(/%/g, "") || "";

              if (key === "name") {
                conditions.push(`(
                  LOWER(json_extract(${key}, '$.en')) LIKE LOWER(?)
                  OR LOWER(json_extract(${key}, '$.ar')) LIKE LOWER(?)
                )`);
                params.push(`%${cleanPattern}%`, `%${cleanPattern}%`);
              } else if (key === "variants") {
                // Handle variant SKU and code search
                conditions.push(`(
                  json_extract(variants, '$[*].sku') LIKE ?
                  OR json_extract(variants, '$[*].code') LIKE ?
                )`);
                params.push(`%${cleanPattern}%`, `%${cleanPattern}%`);
              }
            }
          } else if (key === "categoryRef") {
            // Handle exact match for categoryRef
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        });
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" OR ")}`;
      }

      // Add order by
      baseQuery += ` ORDER BY json_extract(name, '$.en')`;

      // Add pagination
      if (options.take !== undefined && options.skip !== undefined) {
        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(options.take, options.skip);
      }

      // Get count
      const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery})`;
      const countResult: any = await this.db
        .getConnection()
        .getFirstAsync(countQuery, params);
      const totalCount = Number(countResult.total);

      // Get results
      const rows = await this.db.getConnection().getAllAsync(baseQuery, params);
      return [rows.map((row) => Product.fromRow(row)), totalCount];
    } catch (error) {
      console.error("Error in find:prod", error);
      return [[], 0];
    }
  }

  async bulkCreate(products: Product[]): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO products (
        _id, parent, name, kitchenFacingName, contains, image,
        localImage, companyRef, company, categoryRef, category,
        restaurantCategoryRefs, restaurantCategories, kitchenRefs,
        kitchens, collectionsRefs, collections, description,
        brandRef, brand, taxRef, tax, status, source,
        enabledBatching, bestSeller, channels, selfOrdering,
        onlineOrdering, variants, otherVariants, boxes,
        otherBoxes, nutritionalInformation, modifiers,
        sortOrder, sku, code, boxRefs, crateRefs,createdAt, updatedAt
      ) VALUES (
        $id, $parent, $name, $kitchenFacingName, $contains, $image,
        $localImage, $companyRef, $company, $categoryRef, $category,
        $restaurantCategoryRefs, $restaurantCategories, $kitchenRefs,
        $kitchens, $collectionsRefs, $collections, $description,
        $brandRef, $brand, $taxRef, $tax, $status, $source,
        $enabledBatching, $bestSeller, $channels, $selfOrdering,
        $onlineOrdering, $variants, $otherVariants, $boxes,
        $otherBoxes, $nutritionalInformation, $modifiers,
        $sortOrder, $sku, $code, $boxRefs, $crateRefs, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    await this.db.getConnection().execAsync("BEGIN TRANSACTION");

    try {
      for (const product of products) {
        const params: any = {
          $id: product._id,
          $parent: product.parent || null,
          $name: JSON.stringify(product.name),
          $kitchenFacingName: product.kitchenFacingName
            ? JSON.stringify(product.kitchenFacingName)
            : null,
          $contains: product.contains || null,
          $image: product.image,
          $localImage: product.localImage || null,
          $companyRef: product.companyRef,
          $company: JSON.stringify(product.company),
          $categoryRef: product.categoryRef,
          $category: JSON.stringify(product.category),
          $restaurantCategoryRefs: JSON.stringify(
            product.restaurantCategoryRefs
          ),
          $restaurantCategories: JSON.stringify(product.restaurantCategories),
          $kitchenRefs: JSON.stringify(product.kitchenRefs),
          $kitchens: JSON.stringify(product.kitchens),
          $collectionsRefs: JSON.stringify(product.collectionsRefs),
          $collections: JSON.stringify(product.collections),
          $description: product.description,
          $brandRef: product.brandRef,
          $brand: JSON.stringify(product.brand),
          $taxRef: product.taxRef,
          $tax: JSON.stringify(product.tax),
          $status: product.status,
          $source: product.source,
          $enabledBatching: Number(product.enabledBatching),
          $bestSeller: product.bestSeller ? Number(product.bestSeller) : null,
          $channels: JSON.stringify(product.channels),
          $selfOrdering: Number(product.selfOrdering),
          $onlineOrdering: Number(product.onlineOrdering),
          $variants: JSON.stringify(product.variants),
          $otherVariants: product.otherVariants
            ? JSON.stringify(product.otherVariants)
            : null,
          $boxes: product.boxes ? JSON.stringify(product.boxes) : null,
          $otherBoxes: product.otherBoxes
            ? JSON.stringify(product.otherBoxes)
            : null,
          $nutritionalInformation: product.nutritionalInformation
            ? JSON.stringify(product.nutritionalInformation)
            : null,
          $modifiers: product.modifiers
            ? JSON.stringify(product.modifiers)
            : null,
          $sortOrder: product.sortOrder || 0,
          $sku: JSON.stringify(product.sku),
          $code: JSON.stringify(product.code || []),
          $boxRefs: JSON.stringify(product.boxRefs || []),
          $crateRefs: JSON.stringify(product.crateRefs || []),
        };

        await statement.executeAsync(params);
      }
      await this.db.getConnection().execAsync("COMMIT");
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }
}
