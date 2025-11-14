import { BaseRepository } from "./base-repository";
import { Batch } from "../schema/batch";

export interface FindAndCountOptions {
  take?: number;
  skip?: number;
  where?: {
    name?: { operator?: string; value?: string } | string;
    status?: string;
    [key: string]: any;
  };
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

export class BatchRepository extends BaseRepository<Batch, string> {
  constructor() {
    super("batch");
  }

  async findAndCount(options: FindAndCountOptions): Promise<[Batch[], number]> {
    try {
      let baseQuery = "SELECT * FROM batch";
      const params: any[] = [];
      const conditions: string[] = [];

      // Handle where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (typeof value === "object" && value !== null) {
            // Handle ILike/Like operator
            if (
              "operator" in value &&
              (value.operator === "ILike" || value.operator === "Like")
            ) {
              const cleanPattern = value.value?.replace(/%/g, "") || "";
              conditions.push(`(
                LOWER(json_extract(${key}, '$.en')) LIKE LOWER(?)
                OR LOWER(json_extract(${key}, '$.ar')) LIKE LOWER(?)
              )`);
              params.push(`%${cleanPattern}%`, `%${cleanPattern}%`);
            }
            // Handle Between operator for dates
            else if (value.operator === "Between" && value.start && value.end) {
              conditions.push(`${key} BETWEEN ? AND ?`);
              params.push(value.start, value.end);
            }
            // Handle JSON contains
            else if (value.operator === "JsonContains") {
              conditions.push(`JSON_CONTAINS(${key}, ?, '$')`);
              params.push(JSON.stringify(value.value));
            }
          } else {
            // Handle direct equality comparison
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        });
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      // Count total before applying pagination
      const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;
      const countResult: any = await this.db
        .getConnection()
        .getFirstAsync(countQuery, [...params]);
      const totalCount = Number(countResult.total);

      // Add ORDER BY
      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => {
            // Handle JSON fields ordering
            if (
              key.includes("name") ||
              key.includes("company") ||
              key.includes("location")
            ) {
              return `json_extract(${key}, '$.en') ${direction}`;
            }
            return `${key} ${direction}`;
          }
        );
        if (orderClauses.length > 0) {
          baseQuery += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      // Add pagination
      if (options.take !== undefined && options.skip !== undefined) {
        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(options.take, options.skip);
      }

      // Get paginated results
      const rows = await this.db.getConnection().getAllAsync(baseQuery, params);

      return [
        rows
          .filter((t: any) => {
            return t.sku === options.where?.[0].sku;
          })
          .map((row) => Batch.fromRow(row)),
        totalCount,
      ];
    } catch (error) {
      console.error("Error in findAndCount:", error);
      return [[], 0];
    }
  }

  async find(options: {
    where: {
      variant?: string;
      status?: string;
      expiry?: any;
      [key: string]: any;
    };
    order?: {
      [key: string]: "ASC" | "DESC";
    };
  }): Promise<Batch[]> {
    let query = "SELECT * FROM batch WHERE 1=1";
    const params: any[] = [];

    // Handle where conditions
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value === undefined) return;

        // Handle LIKE operator for variant
        if (
          value &&
          typeof value === "object" &&
          "operator" in value &&
          value.operator === "Like"
        ) {
          query += ` AND ${key} LIKE ?`;
          params.push(value.value);
        }
        // Handle Raw operator for expiry
        else if (
          value &&
          typeof value === "object" &&
          "operator" in value &&
          value.operator === "Raw"
        ) {
          query += ` AND ${value.expression.replace("${alias}", key)}`;
        }
        // Handle normal equality
        else {
          query += ` AND ${key} = ?`;
          params.push(value);
        }
      });
    }

    // Handle ordering
    if (options.order) {
      const orderClauses = Object.entries(options.order).map(
        ([key, direction]) => `${key} ${direction}`
      );
      if (orderClauses.length > 0) {
        query += ` ORDER BY ${orderClauses.join(", ")}`;
      }
    }

    const rows: any[] = await this.db
      .getConnection()
      .getAllAsync(query, params);

    return rows.map((row) => Batch.fromRow(row));
  }

  async create(batch: Batch): Promise<Batch> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO batch (
        _id, companyRef, company, locationRef, location,
        vendorRef, vendor, productRef, product,
        hasMultipleVariants, variant, sku, received,
        transfer, available, expiry, createdAt, updatedAt,
        status, source
      ) VALUES (
        $id, $companyRef, $company, $locationRef, $location,
        $vendorRef, $vendor, $productRef, $product,
        $hasMultipleVariants, $variant, $sku, $received,
        $transfer, $available, $expiry, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
        $status, $source
      )
      ON CONFLICT(_id) DO UPDATE SET
        companyRef = $companyRef,
        company = $company,
        locationRef = $locationRef,
        location = $location,
        vendorRef = $vendorRef,
        vendor = $vendor,
        productRef = $productRef,
        product = $product,
        hasMultipleVariants = $hasMultipleVariants,
        variant = $variant,
        sku = $sku,
        received = $received,
        transfer = $transfer,
        available = $available,
        expiry = $expiry,
        createdAt = $createdAt,
        status = $status,
        source = $source
    `);

    const params: any = {
      $id: batch._id,
      $companyRef: batch.companyRef,
      $company: JSON.stringify(batch.company),
      $locationRef: batch.locationRef,
      $location: JSON.stringify(batch.location),
      $vendorRef: batch.vendorRef || null,
      $vendor: batch.vendor ? JSON.stringify(batch.vendor) : null,
      $productRef: batch.productRef,
      $product: JSON.stringify(batch.product),
      $hasMultipleVariants: Number(batch.hasMultipleVariants),
      $variant: JSON.stringify(batch.variant),
      $sku: batch.sku || null,
      $received: batch.received,
      $transfer: batch.transfer,
      $available: batch.available,
      $expiry: batch.expiry,
      $createdAt: batch.createdAt,
      $status: batch.status,
      $source: batch.source,
    };

    try {
      await statement.executeAsync(params);
      batch._id = batch._id;
      return batch;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(batches: Batch[]): Promise<Batch[]> {
    const columns = [
      "_id",
      "companyRef",
      "company",
      "locationRef",
      "location",
      "vendorRef",
      "vendor",
      "productRef",
      "product",
      "hasMultipleVariants",
      "variant",
      "sku",
      "received",
      "transfer",
      "available",
      "expiry",
      "status",
      "source",
    ];

    const generateParams = (batch: Batch) => {
      const toRowBatch = Batch.toRow(batch);
      return [
        toRowBatch._id,
        toRowBatch.companyRef,
        toRowBatch.company,
        toRowBatch.locationRef,
        toRowBatch.location,
        toRowBatch.vendorRef || null,
        toRowBatch.vendor ? toRowBatch.vendor : null,
        toRowBatch.productRef,
        toRowBatch.product,
        toRowBatch.hasMultipleVariants,
        toRowBatch.variant,
        toRowBatch.sku || null,
        toRowBatch.received,
        toRowBatch.transfer,
        toRowBatch.available,
        toRowBatch.expiry,
        toRowBatch.status,
        toRowBatch.source,
      ];
    };

    return this.createManyGeneric("batch", batches, columns, generateParams);
  }

  async update(id: string, batch: Batch): Promise<Batch> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE batch SET
        companyRef = $companyRef,
        company = $company,
        locationRef = $locationRef,
        location = $location,
        vendorRef = $vendorRef,
        vendor = $vendor,
        productRef = $productRef,
        product = $product,
        hasMultipleVariants = $hasMultipleVariants,
        variant = $variant,
        sku = $sku,
        received = $received,
        transfer = $transfer,
        available = $available,
        expiry = $expiry,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $companyRef: batch.companyRef,
      $company: JSON.stringify(batch.company),
      $locationRef: batch.locationRef,
      $location: JSON.stringify(batch.location),
      $vendorRef: batch.vendorRef || null,
      $vendor: batch.vendor ? JSON.stringify(batch.vendor) : null,
      $productRef: batch.productRef,
      $product: JSON.stringify(batch.product),
      $hasMultipleVariants: Number(batch.hasMultipleVariants),
      $variant: JSON.stringify(batch.variant),
      $sku: batch.sku || null,
      $received: batch.received,
      $transfer: batch.transfer,
      $available: batch.available,
      $expiry: batch.expiry as any,
      $status: batch.status,
      $source: batch.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const updatedRow = await result.getFirstAsync();
      return updatedRow ? Batch.fromRow(updatedRow) : batch;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM batch WHERE id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Batch> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Batch not found");
      }
      return Batch.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findActiveBatches(): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE status = $status
    `);

    try {
      const result = await statement.executeAsync({ $status: "active" });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByProduct(productRef: string): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE productRef = $productRef
    `);

    try {
      const result = await statement.executeAsync({ $productRef: productRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByLocation(locationRef: string): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE locationRef = $locationRef
    `);

    try {
      const result = await statement.executeAsync({
        $locationRef: locationRef,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByVendor(vendorRef: string): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE vendorRef = $vendorRef
    `);

    try {
      const result = await statement.executeAsync({ $vendorRef: vendorRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findExpiredBatches(): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE expiry < $now AND status = $status
    `);

    try {
      const result = await statement.executeAsync({
        $now: new Date().toISOString(),
        $status: "active",
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findLowStock(threshold: number): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch WHERE available <= $threshold AND status = $status
    `);

    try {
      const result = await statement.executeAsync({
        $threshold: threshold,
        $status: "active",
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findBySKU(sku: string): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch 
      WHERE json_extract(variant, '$.sku') = $sku 
      OR sku = $sku
    `);

    try {
      const result = await statement.executeAsync({ $sku: sku });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByProductType(type: string): Promise<Batch[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM batch 
      WHERE json_extract(variant, '$.type') = $type
      AND status = $status
    `);

    try {
      const result = await statement.executeAsync({
        $type: type,
        $status: "active",
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Batch.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }
}
