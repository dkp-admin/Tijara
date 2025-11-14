import { BaseRepository } from "./base-repository";
import { VoidComp } from "../schema/void-comp";

interface FindOptions {
  where: {
    type?: string;
    status?: string;
    companyRef?: string;
    [key: string]: any;
  };
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

export class VoidCompRepository extends BaseRepository<VoidComp, string> {
  constructor() {
    super("void-comp");
  }

  async create(voidComp: VoidComp): Promise<VoidComp> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "void-comp" (
        _id, company, companyRef, reason, type,
        status, createdAt, updatedAt, source
      ) VALUES (
        $id, $company, $companyRef, $reason, $type,
        $status, CURRENT_TIMESTAMP,CURRENT_TIMESTAMP, $source
      )
      ON CONFLICT(_id) DO UPDATE SET
        company = $company,
        companyRef = $companyRef,
        reason = $reason,
        type = $type,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP,
        source = $source
    `);

    const params: any = {
      $id: voidComp._id,
      $company: JSON.stringify(voidComp.company),
      $companyRef: voidComp.companyRef,
      $reason: JSON.stringify(voidComp.reason),
      $type: voidComp.type,
      $status: voidComp.status,
      $source: voidComp.source,
    };

    try {
      await statement.executeAsync(params);
      return voidComp;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(voidComps: VoidComp[]): Promise<VoidComp[]> {
    const columns = [
      "_id",
      "company",
      "companyRef",
      "reason",
      "type",
      "status",
      "source",
    ];

    const generateParams = (voidComp: VoidComp) => {
      const toRow = VoidComp.toRow(voidComp);
      return [
        toRow._id,
        toRow.company,
        toRow.companyRef,
        toRow.reason,
        toRow.type,
        toRow.status,
        toRow.source,
      ];
    };

    return this.createManyGeneric(
      "void-comp",
      voidComps,
      columns,
      generateParams
    );
  }

  async find(options: FindOptions): Promise<VoidComp[]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value !== undefined) {
            const paramName = `$param${paramIndex++}`;
            if (typeof value === "object" && value !== null) {
              if (value._ilike) {
                conditions.push(`${key} LIKE ${paramName}`);
                params[paramName] = `%${value._ilike}%`;
              }
            } else {
              conditions.push(`${key} = ${paramName}`);
              params[paramName] = value;
            }
          }
        });
      }

      let baseQuery = `SELECT * FROM "void-comp"`;
      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => `${key} ${direction}`
        );
        baseQuery += ` ORDER BY ${orderClauses.join(", ")}`;
      }

      const statement = await this.db.getConnection().prepareAsync(baseQuery);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => VoidComp.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in find:void", error);
      return [];
    }
  }

  async update(id: string, voidComp: VoidComp): Promise<VoidComp> {
    const now = new Date().toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "void-comp" SET
        company = $company,
        companyRef = $companyRef,
        reason = $reason,
        type = $type,
        status = $status,
        updatedAt = $updatedAt,
        source = $source
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $company: JSON.stringify(voidComp.company),
      $companyRef: voidComp.companyRef,
      $reason: JSON.stringify(voidComp.reason),
      $type: voidComp.type,
      $status: voidComp.status,
      $updatedAt: now,
      $source: voidComp.source,
    };

    try {
      await statement.executeAsync(params);
      voidComp._id = id;
      voidComp.updatedAt = now;
      return voidComp;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "void-comp" WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<VoidComp> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "void-comp" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Void comp not found");
      }
      return VoidComp.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<VoidComp[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "void-comp" ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => VoidComp.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByCompany(companyRef: string): Promise<VoidComp[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "void-comp" 
      WHERE companyRef = $companyRef
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({ $companyRef: companyRef });
      const rows = await result.getAllAsync();
      return rows.map((row) => VoidComp.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByType(type: string): Promise<VoidComp[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "void-comp" 
      WHERE type = $type
      AND status = 'active'
      ORDER BY createdAt DESC
    `);

    try {
      const result = await statement.executeAsync({ $type: type });
      const rows = await result.getAllAsync();
      return rows.map((row) => VoidComp.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(id: string, status: string): Promise<VoidComp> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "void-comp" 
      SET status = $status,
          updatedAt = $updatedAt
      WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $status: status,
        $updatedAt: new Date().toISOString(),
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }
}
