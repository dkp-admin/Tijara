import { BaseRepository } from "./base-repository";
import { StockHistory } from "../schema/stock-history";

export interface FindAndCountOptions {
  take?: number;
  skip?: number;
  where?: {
    batchRef?: string;
    productRef?: string;
    type?: string;
    status?: string;
    createdBy?: string;
    createdAt?: { operator: string; start: Date; end: Date };
    [key: string]: any;
  };
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

export class StockHistoryRepository extends BaseRepository<
  StockHistory,
  string
> {
  constructor() {
    super("stock-history");
  }

  async create(history: StockHistory): Promise<StockHistory> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "stock-history" (
        _id, companyRef, company, locationRef, location,
        vendorRef, vendor, categoryRef, category,
        productRef, product, hasMultipleVariants, variant,
        sku, price, previousStockCount, stockCount,
        stockAction, auto, source, createdAt, updatedAt
      ) VALUES (
        $id, $companyRef, $company, $locationRef, $location,
        $vendorRef, $vendor, $categoryRef, $category,
        $productRef, $product, $hasMultipleVariants, $variant,
        $sku, $price, $previousStockCount, $stockCount,
        $stockAction, $auto, $source,$createdAt, $updatedAt
      )
      ON CONFLICT(_id) DO UPDATE SET
        companyRef = $companyRef,
        company = $company,
        locationRef = $locationRef,
        location = $location,
        vendorRef = $vendorRef,
        vendor = $vendor,
        categoryRef = $categoryRef,
        category = $category,
        productRef = $productRef,
        product = $product,
        hasMultipleVariants = $hasMultipleVariants,
        variant = $variant,
        sku = $sku,
        price = $price,
        previousStockCount = $previousStockCount,
        stockCount = $stockCount,
        stockAction = $stockAction,
        auto = $auto,
        source = $source,
        updatedAt = $updatedAt
    `);

    const params: any = {
      $id: history._id,
      $companyRef: history.companyRef,
      $company: JSON.stringify(history.company),
      $locationRef: history.locationRef,
      $location: JSON.stringify(history.location),
      $vendorRef: history.vendorRef || null,
      $vendor: history.vendor ? JSON.stringify(history.vendor) : null,
      $categoryRef: history.categoryRef || null,
      $category: history.category ? JSON.stringify(history.category) : null,
      $productRef: history.productRef,
      $product: JSON.stringify(history.product),
      $hasMultipleVariants: Number(history.hasMultipleVariants),
      $variant: JSON.stringify(history.variant),
      $sku: history.sku || null,
      $price: history.price || 0,
      $previousStockCount: history.previousStockCount || 0,
      $stockCount: history.stockCount || 0,
      $stockAction: history.stockAction || null,
      $auto: Number(history.auto),
      $createdAt: history.createdAt,
      $source: history.source,
      $updatedAt: history.updatedAt || new Date(),
    };

    try {
      await statement.executeAsync(params);
      return history;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(histories: StockHistory[]): Promise<StockHistory[]> {
    const columns = [
      "_id",
      "companyRef",
      "company",
      "locationRef",
      "location",
      "vendorRef",
      "vendor",
      "categoryRef",
      "category",
      "productRef",
      "product",
      "hasMultipleVariants",
      "variant",
      "sku",
      "price",
      "previousStockCount",
      "stockCount",
      "stockAction",
      "auto",
      "source",
      "createdAt",
      "updatedAt",
    ];

    const generateParams = (history: StockHistory) => {
      const toRow = StockHistory.toRow(history);
      return [
        toRow._id,
        toRow.companyRef,
        toRow.company,
        toRow.locationRef,
        toRow.location,
        toRow.vendorRef || null,
        toRow.vendor ? toRow.vendor : null,
        toRow.categoryRef || null,
        toRow.category ? toRow.category : null,
        toRow.productRef,
        toRow.product,
        toRow.hasMultipleVariants,
        toRow.variant,
        toRow.sku || null,
        toRow.price || 0,
        toRow.previousStockCount || 0,
        toRow.stockCount || 0,
        toRow.stockAction || null,
        toRow.auto,
        toRow.source,
        toRow.createdAt,
        toRow.updatedAt,
      ];
    };

    return this.createManyGeneric(
      "stock-history",
      histories,
      columns,
      generateParams
    );
  }
  async update(id: string, history: StockHistory): Promise<StockHistory> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "stock-history" SET
        companyRef = $companyRef,
        company = $company,
        locationRef = $locationRef,
        location = $location,
        vendorRef = $vendorRef,
        vendor = $vendor,
        categoryRef = $categoryRef,
        category = $category,
        productRef = $productRef,
        product = $product,
        hasMultipleVariants = $hasMultipleVariants,
        variant = $variant,
        sku = $sku,
        price = $price,
        previousStockCount = $previousStockCount,
        stockCount = $stockCount,
        stockAction = $stockAction,
        auto = $auto,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $companyRef: history.companyRef,
      $company: JSON.stringify(history.company),
      $locationRef: history.locationRef,
      $location: JSON.stringify(history.location),
      $vendorRef: history.vendorRef || null,
      $vendor: history.vendor ? JSON.stringify(history.vendor) : null,
      $categoryRef: history.categoryRef || null,
      $category: history.category ? JSON.stringify(history.category) : null,
      $productRef: history.productRef,
      $product: JSON.stringify(history.product),
      $hasMultipleVariants: Number(history.hasMultipleVariants),
      $variant: JSON.stringify(history.variant),
      $sku: history.sku || null,
      $price: history.price || 0,
      $previousStockCount: history.previousStockCount || 0,
      $stockCount: history.stockCount || 0,
      $stockAction: history.stockAction || null,
      $auto: Number(history.auto),
      $source: history.source,
    };

    try {
      await statement.executeAsync(params);
      history._id = id;
      return history;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "stock-history" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<StockHistory> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "stock-history" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Stock history not found");
      }
      return StockHistory.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<StockHistory[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "stock-history" ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => StockHistory.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByProduct(
    productRef: string,
    locationRef?: string
  ): Promise<StockHistory[]> {
    const conditions = ["productRef = $productRef"];
    const params: Record<string, any> = { $productRef: productRef };

    if (locationRef) {
      conditions.push("locationRef = $locationRef");
      params.$locationRef = locationRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "stock-history"
      WHERE ${conditions.join(" AND ")}
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => StockHistory.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findBySku(sku: string, locationRef?: string): Promise<StockHistory[]> {
    const conditions = ["sku = $sku"];
    const params: Record<string, any> = { $sku: sku };

    if (locationRef) {
      conditions.push("locationRef = $locationRef");
      params.$locationRef = locationRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "stock-history"
      WHERE ${conditions.join(" AND ")}
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => StockHistory.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    locationRef?: string
  ): Promise<StockHistory[]> {
    const conditions = ["createdAt BETWEEN $startDate AND $endDate"];
    const params: Record<string, any> = {
      $startDate: startDate.toISOString(),
      $endDate: endDate.toISOString(),
    };

    if (locationRef) {
      conditions.push("locationRef = $locationRef");
      params.$locationRef = locationRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "stock-history"
      WHERE ${conditions.join(" AND ")}
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => StockHistory.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getLatestStockCount(
    productRef: string,
    locationRef: string
  ): Promise<number> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT stockCount 
      FROM "stock-history" 
      WHERE productRef = $productRef
      AND locationRef = $locationRef
      ORDER BY createdAt DESC 
      LIMIT 1
    `);

    try {
      const result = await statement.executeAsync({
        $productRef: productRef,
        $locationRef: locationRef,
      });
      const row: any = await result.getFirstAsync();
      return row ? Number(row.stockCount) : 0;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async cleanupOldRecords(retentionDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "stock-history" WHERE createdAt < $cutoffDate
    `);

    try {
      await statement.executeAsync({
        $cutoffDate: cutoffDate.toISOString(),
      });
    } finally {
      await statement.finalizeAsync();
    }
  }
  async findAndCount(
    options: FindAndCountOptions
  ): Promise<[StockHistory[], number]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      // Handle where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          const paramName = `$param${paramIndex++}`;
          if (typeof value === "object" && value !== null) {
            // Handle date ranges with Between
            if (key === "createdAt" && value.operator === "Between") {
              conditions.push(
                `${key} BETWEEN $start${paramIndex} AND $end${paramIndex}`
              );
              params[`$start${paramIndex}`] = value.start;
              params[`$end${paramIndex}`] = value.end;
              paramIndex++;
            }
            // Handle JSON contains for complex fields
            else if (value.operator === "JsonContains") {
              conditions.push(`JSON_CONTAINS(${key}, ${paramName}, '$')`);
              params[paramName] = JSON.stringify(value.value);
            }
            // Handle Like/ILike operator
            else if (value.operator === "Like" || value.operator === "ILike") {
              const cleanPattern = value.value?.replace(/%/g, "") || "";
              conditions.push(`${key} LIKE ${paramName}`);
              params[paramName] = `%${cleanPattern}%`;
            }
          } else {
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value;
          }
        });
      }

      // Base query with conditions
      const baseQuery = `
        SELECT * FROM 'stock-history'
        ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
      `;

      // Count query
      const countStatement = await this.db
        .getConnection()
        .prepareAsync(
          `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`
        );

      // Build the main query with ordering and pagination
      let mainQuery = baseQuery;

      // Add ORDER BY
      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => {
            if (key.includes("batch") || key.includes("product")) {
              return `json_extract(${key}, '$.name.en') ${direction}`;
            }
            return `${key} ${direction}`;
          }
        );
        if (orderClauses.length > 0) {
          mainQuery += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      // Add pagination
      if (options.take !== undefined && options.skip !== undefined) {
        mainQuery += ` LIMIT $limit OFFSET $offset`;
        params.$limit = options.take;
        params.$offset = options.skip;
      }

      const queryStatement = await this.db
        .getConnection()
        .prepareAsync(mainQuery);

      try {
        // Get total count
        const countResult: any = await countStatement.executeAsync(params);
        const totalCount = Number((await countResult.getFirstAsync()).total);

        // Get paginated results
        const result = await queryStatement.executeAsync(params);
        const rows = await result.getAllAsync();

        return [rows.map((row) => StockHistory.fromRow(row)), totalCount];
      } finally {
        await countStatement.finalizeAsync();
        await queryStatement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in findAndCount:stock", error);
      return [[], 0];
    }
  }
}
