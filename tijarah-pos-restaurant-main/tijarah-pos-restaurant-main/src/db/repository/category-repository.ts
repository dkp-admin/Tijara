import { BaseRepository } from "./base-repository";
import { Category } from "../schema/category";

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
    name?: { _ilike?: string } | string;
    [key: string]: any;
  };
}

export class CategoryRepository extends BaseRepository<Category, string> {
  constructor() {
    super("category");
  }

  async create(category: Category): Promise<Category> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO category (
        _id, parent, name, company, companyRef,
        localImage, image, description, status, source, createdAt, updatedAt
      ) VALUES (
        $id, $parent, $name, $company, $companyRef,
        $localImage, $image, $description, $status, $source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        parent = $parent,
        name = $name,
        company = $company,
        companyRef = $companyRef,
        localImage = $localImage,
        image = $image,
        description = $description,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: category._id,
      $parent: category.parent || null,
      $name: JSON.stringify(category.name),
      $company: JSON.stringify(category.company),
      $companyRef: category.companyRef,
      $localImage: category.localImage || null,
      $image: category.image || null,
      $description: category.description,
      $status: category.status,
      $source: category.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? Category.fromRow(created) : category;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(categories: Category[]): Promise<Category[]> {
    const columns = [
      "_id",
      "parent",
      "name",
      "company",
      "companyRef",
      "localImage",
      "image",
      "description",
      "status",
      "source",
    ];

    const generateParams = (category: Category) => {
      const toRowCat = Category.toRow(category);
      return [
        toRowCat._id,
        toRowCat.parent || null,
        toRowCat.name,
        toRowCat.company,
        toRowCat.companyRef,
        toRowCat.localImage || null,
        toRowCat.image || null,
        toRowCat.description,
        toRowCat.status,
        toRowCat.source || "server",
      ];
    };

    return this.createManyGeneric(
      "category",
      categories,
      columns,
      generateParams
    );
  }

  async update(id: string, category: Category): Promise<Category> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE category SET
        parent = $parent,
        name = $name,
        company = $company,
        companyRef = $companyRef,
        localImage = $localImage,
        image = $image,
        description = $description,
        status = $status,
        source = $source,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $parent: category.parent || null,
      $name: JSON.stringify(category.name),
      $company: JSON.stringify(category.company),
      $companyRef: category.companyRef,
      $localImage: category.localImage || null,
      $image: category.image || null,
      $description: category.description,
      $status: category.status,
      $source: category.source,
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? Category.fromRow(updated) : category;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getPaginatedCategories(
    pageParam: number = 1,
    rowsPerPage: number = 100,
    whereClause: string = ""
  ): Promise<[Category[], number]> {
    try {
      const countStatement = await this.db
        .getConnection()
        .prepareAsync(`SELECT COUNT(*) as total FROM category ${whereClause}`);

      const statement = await this.db.getConnection().prepareAsync(`
        SELECT * FROM category ${whereClause}
        ORDER BY json_extract(name, '$.en')
        LIMIT $limit OFFSET $offset
      `);

      try {
        const countResult: any = await countStatement.executeAsync({});
        const totalCount = Number((await countResult.getFirstAsync()).total);

        const result = await statement.executeAsync({
          $limit: rowsPerPage,
          $offset: rowsPerPage * (pageParam - 1),
        });
        const rows = await result.getAllAsync();
        return [rows.map((row) => Category.fromRow(row)), totalCount];
      } finally {
        await countStatement.finalizeAsync();
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in getPaginatedCategories:", error);
      return [[], 0];
    }
  }

  async find(options: FindOptions): Promise<Category[]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};

      if (options.where) {
        Object.entries(options.where).forEach(([key, value], index) => {
          if (typeof value === "object" && value !== null) {
            if ("operator" in value && value.operator === "ILike") {
              const cleanPattern = value.value.replace(/%/g, "");
              conditions.push(`(
                LOWER(json_extract(${key}, '$.en')) LIKE LOWER($pattern${index})
                OR LOWER(json_extract(${key}, '$.ar')) LIKE LOWER($pattern${index})
              )`);
              params[`$pattern${index}`] = `%${cleanPattern}%`;
            } else if ("_ilike" in value) {
              const cleanPattern = value._ilike.replace(/%/g, "");
              conditions.push(`(
                LOWER(json_extract(${key}, '$.en')) LIKE LOWER($pattern${index})
                OR LOWER(json_extract(${key}, '$.ar')) LIKE LOWER($pattern${index})
              )`);
              params[`$pattern${index}`] = `%${cleanPattern}%`;
            }
          } else {
            conditions.push(`${key} = $value${index}`);
            params[`$value${index}`] = value;
          }
        });
      }

      const baseQuery = `
        SELECT * FROM category
        ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
        ORDER BY json_extract(name, '$.en')
        ${options.take !== undefined ? `LIMIT $limit OFFSET $offset` : ""}
      `;

      if (options.take !== undefined && options.skip !== undefined) {
        params.$limit = options.take;
        params.$offset = options.skip;
      }

      const statement = await this.db.getConnection().prepareAsync(baseQuery);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => Category.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in find:", error);
      return [];
    }
  }
  async delete(id: string): Promise<void> {
    const updateStatement = await this.db.getConnection().prepareAsync(`
      UPDATE category SET parent = NULL WHERE parent = $id
    `);

    const deleteStatement = await this.db.getConnection().prepareAsync(`
      DELETE FROM category WHERE id = $id
    `);

    try {
      await updateStatement.executeAsync({ $id: id });
      await deleteStatement.executeAsync({ $id: id });
    } finally {
      await updateStatement.finalizeAsync();
      await deleteStatement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<Category> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM category WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Category not found");
      }
      return Category.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<Category[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM category
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => Category.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<Category[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM category WHERE companyRef = $companyRef
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Category.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findChildren(parentId: string): Promise<Category[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM category WHERE parent = $parentId
    `);

    try {
      const result = await statement.executeAsync({ $parentId: parentId });
      const rows = await result.getAllAsync();
      return rows.map((row) => Category.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findRootCategories(companyRef: string): Promise<Category[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM category 
      WHERE companyRef = $companyRef 
      AND parent IS NULL
      AND status = 'active'
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Category.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async getCategoryTree(companyRef: string): Promise<Category[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      WITH RECURSIVE category_tree AS (
        SELECT *, 0 as level
        FROM category
        WHERE parent IS NULL AND companyRef = $companyRef
        
        UNION ALL
        
        SELECT c.*, ct.level + 1
        FROM category c
        INNER JOIN category_tree ct ON c.parent = ct.id
      )
      SELECT * FROM category_tree
      ORDER BY level, name
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => Category.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateImage(
    id: string,
    image: string,
    isLocal: boolean = false
  ): Promise<Category> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE category 
      SET ${isLocal ? "localImage" : "image"} = $image
      WHERE id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $image: image });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<Category> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE category SET status = $status WHERE id = $id
    `);

    try {
      await statement.executeAsync({ $id: id, $status: status });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }
}
