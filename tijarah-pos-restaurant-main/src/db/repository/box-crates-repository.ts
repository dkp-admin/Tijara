import { BoxCrates } from "../schema/box-crates";
import { BaseRepository } from "./base-repository";

interface FindWithQueryOptions {
  where: {
    type?: string;
    status?: string;
    nonSaleable?: boolean;
    productSku?: string | string[];
  };
}

export interface FindOptions {
  where?: {
    product?: { operator?: string; value?: string } | string;
    [key: string]: any;
  };
  take?: number;
  skip?: number;
}

export class BoxCratesRepository extends BaseRepository<BoxCrates, string> {
  constructor() {
    super('"box-crates"');
  }

  async create(boxCrate: BoxCrates): Promise<BoxCrates> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "box-crates" (
        _id, createdAt, updatedAt, name, company, companyRef, type, qty, code, 
        costPrice, price, box, boxName, boxRef, boxSku, crateSku, productSku, 
        description, nonSaleable, product, locationRefs, locations, prices, 
        otherPrices, stocks, otherStocks, status, source, createdAt, updatedAt
      ) VALUES (
        $id, CURRENT_TIMESTAMP, NULL, $name, $company, $companyRef, $type, $qty, 
        $code, $costPrice, $price, $box, $boxName, $boxRef, $boxSku, $crateSku, 
        $productSku, $description, $nonSaleable, $product, $locationRefs, 
        $locations, $prices, $otherPrices, $stocks, $otherStocks, $status, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        type = $type,
        qty = $qty,
        code = $code,
        costPrice = $costPrice,
        price = $price,
        box = $box,
        boxName = $boxName,
        boxRef = $boxRef,
        boxSku = $boxSku,
        crateSku = $crateSku,
        productSku = $productSku,
        description = $description,
        nonSaleable = $nonSaleable,
        product = $product,
        locationRefs = $locationRefs,
        locations = $locations,
        prices = $prices,
        otherPrices = $otherPrices,
        stocks = $stocks,
        otherStocks = $otherStocks,
        status = $status,
        source = $source,
        updatedAt= CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: boxCrate._id,
      $name: JSON.stringify(boxCrate.name),
      $company: JSON.stringify(boxCrate.company),
      $companyRef: boxCrate.companyRef,
      $type: boxCrate.type,
      $qty: boxCrate.qty,
      $code: boxCrate.code,
      $costPrice: boxCrate.costPrice,
      $price: boxCrate.price,
      $box: boxCrate.box ? JSON.stringify(boxCrate.box) : null,
      $boxName: boxCrate.boxName ? JSON.stringify(boxCrate.boxName) : null,
      $boxRef: boxCrate.boxRef || null,
      $boxSku: boxCrate.boxSku,
      $crateSku: boxCrate.crateSku,
      $productSku: boxCrate.productSku,
      $description: boxCrate.description || null,
      $nonSaleable: Number(boxCrate.nonSaleable),
      $product: JSON.stringify(boxCrate.product),
      $locationRefs: boxCrate.locationRefs
        ? JSON.stringify(boxCrate.locationRefs)
        : null,
      $locations: JSON.stringify(boxCrate.locations),
      $prices: JSON.stringify(boxCrate.prices),
      $otherPrices: JSON.stringify(boxCrate.otherPrices),
      $stocks: boxCrate.stocks ? JSON.stringify(boxCrate.stocks) : null,
      $otherStocks: boxCrate.otherStocks
        ? JSON.stringify(boxCrate.otherStocks)
        : null,
      $status: boxCrate.status,
      $source: boxCrate.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? BoxCrates.fromRow(created) : boxCrate;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(boxCrates: BoxCrates[]): Promise<BoxCrates[]> {
    const columns = [
      "_id",
      "name",
      "company",
      "companyRef",
      "type",
      "qty",
      "code",
      "costPrice",
      "price",
      "box",
      "boxName",
      "boxRef",
      "boxSku",
      "crateSku",
      "productSku",
      "description",
      "nonSaleable",
      "product",
      "locationRefs",
      "locations",
      "prices",
      "otherPrices",
      "stocks",
      "otherStocks",
      "status",
    ];

    const generateParams = (boxCrate: BoxCrates) => {
      const toRowBox = BoxCrates.toRow(boxCrate);
      return [
        toRowBox._id,
        toRowBox.name,
        toRowBox.company,
        toRowBox.companyRef,
        toRowBox.type,
        toRowBox.qty,
        toRowBox.code,
        toRowBox.costPrice,
        toRowBox.price,
        toRowBox.box ? toRowBox.box : null,
        toRowBox.boxName ? toRowBox.boxName : null,
        toRowBox.boxRef || null,
        toRowBox.boxSku,
        toRowBox.crateSku,
        toRowBox.productSku,
        toRowBox.description || null,
        toRowBox.nonSaleable,
        toRowBox.product,
        toRowBox.locationRefs ? toRowBox.locationRefs : null,
        toRowBox.locations,
        toRowBox.prices,
        toRowBox.otherPrices,
        toRowBox.stocks ? toRowBox.stocks : null,
        toRowBox.otherStocks ? toRowBox.otherStocks : null,
        toRowBox.status,
      ];
    };

    return this.createManyGeneric(
      "box-crates",
      boxCrates,
      columns,
      generateParams
    );
  }

  async update(id: string, boxCrate: BoxCrates): Promise<BoxCrates> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "box-crates" SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        type = $type,
        qty = $qty,
        code = $code,
        costPrice = $costPrice,
        price = $price,
        box = $box,
        boxName = $boxName,
        boxRef = $boxRef,
        boxSku = $boxSku,
        crateSku = $crateSku,
        productSku = $productSku,
        description = $description,
        nonSaleable = $nonSaleable,
        product = $product,
        locationRefs = $locationRefs,
        locations = $locations,
        prices = $prices,
        otherPrices = $otherPrices,
        stocks = $stocks,
        otherStocks = $otherStocks,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $name: JSON.stringify(boxCrate.name),
      $company: JSON.stringify(boxCrate.company),
      $companyRef: boxCrate.companyRef,
      $type: boxCrate.type,
      $qty: boxCrate.qty,
      $code: boxCrate.code,
      $costPrice: boxCrate.costPrice,
      $price: boxCrate.price,
      $box: boxCrate.box ? JSON.stringify(boxCrate.box) : null,
      $boxName: boxCrate.boxName ? JSON.stringify(boxCrate.boxName) : null,
      $boxRef: boxCrate.boxRef || null,
      $boxSku: boxCrate.boxSku,
      $crateSku: boxCrate.crateSku,
      $productSku: boxCrate.productSku,
      $description: boxCrate.description || null,
      $nonSaleable: Number(boxCrate.nonSaleable),
      $product: JSON.stringify(boxCrate.product),
      $locationRefs: boxCrate.locationRefs
        ? JSON.stringify(boxCrate.locationRefs)
        : null,
      $locations: JSON.stringify(boxCrate.locations),
      $prices: JSON.stringify(boxCrate.prices),
      $otherPrices: JSON.stringify(boxCrate.otherPrices),
      $stocks: boxCrate.stocks ? JSON.stringify(boxCrate.stocks) : null,
      $otherStocks: boxCrate.otherStocks
        ? JSON.stringify(boxCrate.otherStocks)
        : null,
      $status: boxCrate.status,
      $source: boxCrate.source,
    };

    try {
      const result = await statement.executeAsync(params);
      return boxCrate;
    } finally {
      await statement.finalizeAsync();
    }
  }
  async find(options: FindOptions): Promise<BoxCrates[]> {
    try {
      let conditions: string[] = ["1=1"];
      const params: Record<string, any> = {};

      if (options.where) {
        Object.entries(options.where).forEach(([key, value], index) => {
          if (typeof value === "object" && value !== null) {
            if ("operator" in value && value.operator === "Like") {
              conditions.push(
                `json_extract(${key}, '$.productRef') LIKE $param${index}`
              );
              params[`$param${index}`] = `%${value.value}%`;
            }
          } else {
            conditions.push(`${key} = $param${index}`);
            params[`$param${index}`] = value;
          }
        });
      }

      let query = `SELECT * FROM box_crates WHERE ${conditions.join(" AND ")}`;

      if (options.take !== undefined && options.skip !== undefined) {
        query += ` LIMIT $limit OFFSET $offset`;
        params.$limit = options.take;
        params.$offset = options.skip;
      }

      const statement = await this.db.getConnection().prepareAsync(query);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => BoxCrates.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in find:", error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "box-crates" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<BoxCrates> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "box-crates" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Box crate not found");
      }
      return BoxCrates.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByProduct(id: string): Promise<BoxCrates[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "box-crates" 
      WHERE json_extract(product, '$.productRef') = $productRef
    `);

    try {
      const result = await statement.executeAsync({ $productRef: id });
      const rows = await result.getAllAsync();
      if (!rows) {
        throw new Error("Box crate not found");
      }
      return rows.map((row) => BoxCrates.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findBySku(sku: string): Promise<BoxCrates | null> {
    const statement = await this.db.getConnection().prepareAsync(`
     SELECT * FROM "box-crates" 
WHERE boxSku LIKE '%' || $sku || '%'
OR 
 crateSku LIKE '%' || $sku || '%'
    `);

    try {
      const result = await statement.executeAsync({ $sku: sku });
      const row = await result.getFirstAsync();
      if (!row) {
        return null;
      }
      return BoxCrates.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<BoxCrates[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "box-crates"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => BoxCrates.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findWithQuery(options: FindWithQueryOptions): Promise<BoxCrates[]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};

      const { where } = options;

      if (where.type) {
        conditions.push("type = $type");
        params.$type = where.type;
      }

      if (where.status) {
        conditions.push("status = $status");
        params.$status = where.status;
      }

      if (where.nonSaleable !== undefined) {
        conditions.push("nonSaleable = $nonSaleable");
        params.$nonSaleable = Number(where.nonSaleable);
      }

      if (where.productSku) {
        if (Array.isArray(where.productSku) && where.productSku.length > 0) {
          conditions.push(
            `productSku IN (${where.productSku
              .map((_, index) => `$productSku${index}`)
              .join(", ")})`
          );
          where.productSku.forEach((sku, index) => {
            params[`$productSku${index}`] = sku;
          });
        } else if (
          typeof where.productSku === "string" ||
          typeof where.productSku === "number"
        ) {
          conditions.push("productSku = $productSku");
          params.$productSku = where.productSku;
        }
      }

      const query = `SELECT * FROM "box-crates" WHERE ${
        conditions.length ? conditions.join(" AND ") : "1=1"
      }`;
      const statement = await this.db.getConnection().prepareAsync(query);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => BoxCrates.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in findWithQuery:", error);
      return [];
    }
  }
}
