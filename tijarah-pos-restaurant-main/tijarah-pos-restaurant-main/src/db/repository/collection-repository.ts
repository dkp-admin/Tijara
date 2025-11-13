import { Collection } from "../schema/collection";
import { BaseRepository } from "./base-repository";

export interface FindAndCountOptions {
  take?: number;
  skip?: number;
  where?: {
    name?: { _ilike?: string } | string;
    [key: string]: any;
  };
}

export interface FindOptions {
  take?: number;
  skip?: number;
  where?: {
    name?: { operator?: string; value?: string } | string;
    [key: string]: any;
  };
}

export class CollectionsRepository extends BaseRepository<Collection, string> {
  constructor() {
    super("collections");
  }

  async create(collection: Collection): Promise<Collection> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO collections (
        _id, name, company, companyRef,
        localImage, image, status, source, createdAt, updatedAt
      ) VALUES (
        $id, $name, $company, $companyRef,
        $localImage, $image, $status, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        localImage = $localImage,
        image = $image,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: collection._id,
      $name: JSON.stringify(collection.name),
      $company: JSON.stringify(collection.company),
      $companyRef: collection.companyRef,
      $localImage: collection.localImage || null,
      $image: collection.image || null,
      $status: collection.status,
      $source: collection.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? Collection.fromRow(created) : collection;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(collections: Collection[]): Promise<Collection[]> {
    const columns = [
      "_id",
      "name",
      "company",
      "companyRef",
      "localImage",
      "image",
      "status",
      "source",
    ];

    const generateParams = (collection: Collection) => {
      const toRow = Collection.toRow(collection);
      return [
        toRow._id,
        toRow.name,
        toRow.company,
        toRow.companyRef,
        toRow.localImage || null,
        toRow.image || null,
        toRow.status,
        toRow.source,
      ];
    };

    return this.createManyGeneric(
      "collections",
      collections,
      columns,
      generateParams
    );
  }

  async find(options: FindOptions): Promise<Collection[]> {
    try {
      let baseQuery = "SELECT * FROM collection";
      const params: any[] = [];
      const conditions: string[] = [];

      // Handle where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle ILike operator for name
            if ("operator" in value && value.operator === "ILike") {
              // Remove existing % symbols and sanitize the pattern
              const cleanPattern = value.value?.replace(/%/g, "") || "";
              // Use json_extract with LOWER for case-insensitive search
              conditions.push(`(
                LOWER(json_extract(${key}, '$.en')) LIKE LOWER(?)
                OR LOWER(json_extract(${key}, '$.ar')) LIKE LOWER(?)
              )`);
              params.push(`%${cleanPattern}%`, `%${cleanPattern}%`);
            }
          } else {
            // Handle exact match conditions
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        });
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      // Add ordering
      baseQuery += ` ORDER BY json_extract(name, '$.en')`;

      // Add pagination
      if (options.take !== undefined && options.skip !== undefined) {
        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(options.take, options.skip);
      }

      // Get results
      const rows = await this.db.getConnection().getAllAsync(baseQuery, params);
      return rows.map((row) => Collection.fromRow(row));
    } catch (error) {
      console.error("Error in find:", error);
      return [];
    }
  }

  async findAndCount(
    options: FindAndCountOptions
  ): Promise<[Collection[], number]> {
    try {
      let baseQuery = "SELECT * FROM collections";
      let countQuery = "SELECT COUNT(*) as total FROM collections";
      const conditions: string[] = [];

      // Handle where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            // Handle case-insensitive LIKE
            if (value._ilike) {
              // Remove existing % symbols and sanitize the pattern
              const cleanPattern = value._ilike.replace(/%/g, "");
              // Use json_extract with LOWER for case-insensitive search
              conditions.push(`(
                LOWER(json_extract(${key}, '$.en')) LIKE LOWER('%${cleanPattern}%')
                OR LOWER(json_extract(${key}, '$.ar')) LIKE LOWER('%${cleanPattern}%')
              )`);
            }
          } else {
            // Handle exact match conditions
            conditions.push(`${key} = '${value}'`);
          }
        });
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(" AND ")}`;
        baseQuery += whereClause;
        countQuery += whereClause;
      }

      // Get total count first
      const countResult: any = await this.db
        .getConnection()
        .getFirstAsync(countQuery);
      const totalCount = Number(countResult.total);

      // Add pagination to base query
      baseQuery += ` ORDER BY json_extract(name, '$.en')`;
      if (options.take !== undefined && options.skip !== undefined) {
        baseQuery += ` LIMIT ${options.take} OFFSET ${options.skip}`;
      }

      // Get paginated results
      const rows = await this.db.getConnection().getAllAsync(baseQuery);
      const collections = rows.map((row) => Collection.fromRow(row));

      return [collections, totalCount];
    } catch (error) {
      console.error("Error in findAndCount:", error);
      throw error;
    }
  }

  async update(id: string, collection: Collection): Promise<Collection> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE collections SET
        name = $name,
        company = $company,
        companyRef = $companyRef,
        localImage = $localImage,
        image = $image,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $name: JSON.stringify(collection.name),
      $company: JSON.stringify(collection.company),
      $companyRef: collection.companyRef,
      $localImage: collection.localImage || null,
      $image: collection.image || null,
      $status: collection.status,
      $source: collection.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? Collection.fromRow(updated) : collection;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM collections WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Collection> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM collections WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Collection not found");
      }
      return Collection.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }
  async findAll(): Promise<Collection[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM collections
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Collection.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<Collection[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM collections 
      WHERE companyRef = $companyRef
      ORDER BY name
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Collection.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findActiveByCompany(companyRef: string): Promise<Collection[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM collections 
      WHERE companyRef = $companyRef
      AND status = $status
      ORDER BY name
    `);

    try {
      const result = await statement.executeAsync({
        $companyRef: companyRef,
        $status: "active",
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => Collection.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<Collection> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE collections SET status = $status, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $status: status });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateImage(
    id: string,
    image: string,
    isLocal: boolean = false
  ): Promise<Collection> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE collections 
      SET ${
        isLocal ? "localImage" : "image"
      } = $image, updatedAt = CURRENT_TIMESTAMP 
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $image: image });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async search(query: string, companyRef?: string): Promise<Collection[]> {
    const conditions = [
      "(LOWER(json_extract(name, '$.en')) LIKE $pattern OR LOWER(json_extract(name, '$.ar')) LIKE $pattern)",
    ];
    const params: Record<string, any> = {
      $pattern: `%${query.toLowerCase()}%`,
    };

    if (companyRef) {
      conditions.push("companyRef = $companyRef");
      params.$companyRef = companyRef;
    }

    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM collections 
      WHERE ${conditions.join(" AND ")}
      ORDER BY name
    `);

    try {
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      return rows.map((row) => Collection.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async syncCollections(collections: Collection[]): Promise<void> {
    const transaction = await this.db
      .getConnection()
      .execAsync("BEGIN TRANSACTION");
    try {
      for (const collection of collections) {
        const existing = await this.findById(collection._id!).catch(() => null);
        if (existing) {
          await this.update(collection._id!, collection);
        } else {
          await this.create(collection);
        }
      }
      await this.db.getConnection().execAsync("COMMIT");
    } catch (error) {
      await this.db.getConnection().execAsync("ROLLBACK");
      throw error;
    }
  }
}
