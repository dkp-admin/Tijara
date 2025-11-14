import { BaseRepository } from "./base-repository";
import { CheckRequest, CheckRequestStatus } from "../schema/check-request";

export interface FindOptions {
  where?: WhereCondition | WhereCondition[];
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

interface WhereCondition {
  entityName?: string;
  status?: string;
  deviceRef?: string;
  companyRef?: string;
  createdAt?: { operator: string; start: Date; end: Date };
  [key: string]: any;
}

export class CheckRequestRepository extends BaseRepository<
  CheckRequest,
  string
> {
  constructor() {
    super("check-request");
  }

  async create(request: CheckRequest): Promise<CheckRequest> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO "check-request" (
        _id, entityName, status, lastSync, createdAt
      ) VALUES (
        $id, $entityName, $status, $lastSync, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        entityName = $entityName,
        status = $status,
        lastSync = $lastSync,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: request._id,
      $entityName: request.entityName,
      $status: request.status,
      $lastSync: request.lastSync.toISOString(),
      $createdAt: request.createdAt,
    };

    try {
      const result = await statement.executeAsync(params);
      const created = await result.getFirstAsync();
      return created ? CheckRequest.fromRow(created) : request;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(requests: CheckRequest[]): Promise<CheckRequest[]> {
    const columns = ["_id", "entityName", "status", "lastSync"];

    const generateParams = (request: CheckRequest) => [
      request._id,
      request.entityName,
      request.status,
      request.lastSync.toISOString(),
    ];

    return this.createManyGeneric(
      "check-request",
      requests,
      columns,
      generateParams
    );
  }

  async findOne(options: FindOptions): Promise<CheckRequest | null> {
    try {
      let baseQuery = `SELECT * FROM "check-request"`;
      const params: any[] = [];
      let conditions: any[] = [];

      // Handle where conditions
      if (options.where) {
        const whereConditions = Array.isArray(options.where)
          ? options.where
          : [options.where];

        conditions = whereConditions
          .map((condition) => {
            const subConditions: string[] = [];

            Object.entries(condition).forEach(([key, value]) => {
              if (value === null || value === undefined) return;

              if (typeof value === "object") {
                // Handle Between operator for dates
                if (value.operator === "Between") {
                  subConditions.push(`${key} BETWEEN ? AND ?`);
                  params.push(value.start, value.end);
                }
                // Handle Like operator
                else if (value.operator === "Like") {
                  subConditions.push(`${key} LIKE ?`);
                  params.push(`%${value.value}%`);
                }
                // Handle JSON contains
                else if (value.operator === "JsonContains") {
                  subConditions.push(`JSON_CONTAINS(${key}, ?, '$')`);
                  params.push(JSON.stringify(value.value));
                }
              } else {
                // Handle direct equality comparison
                subConditions.push(`${key} = ?`);
                params.push(value);
              }
            });

            return subConditions.length > 0
              ? `(${subConditions.join(" AND ")})`
              : null;
          })
          .filter(Boolean);

        if (conditions.length > 0) {
          baseQuery += ` WHERE ${conditions.join(" OR ")}`;
        }
      }
      // Add ORDER BY
      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => `${key} ${direction}`
        );
        if (orderClauses.length > 0) {
          baseQuery += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      // Add LIMIT 1 since we only want one result
      baseQuery += " LIMIT 1";

      // Get result
      const row = await this.db
        .getConnection()
        .getFirstAsync(baseQuery, params);
      return row ? CheckRequest.fromRow(row) : null;
    } catch (error) {
      console.error("Error in findOne:", error);
      return null;
    }
  }

  async update(id: string, request: CheckRequest): Promise<CheckRequest> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "check-request" SET
        entityName = $entityName,
        status = $status,
        lastSync = $lastSync,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $entityName: request.entityName,
      $status: request.status,
      $lastSync: request.lastSync.toISOString(),
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? CheckRequest.fromRow(updated) : request;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatusById(
    id: string,
    request: Partial<CheckRequest>
  ): Promise<Partial<CheckRequest>> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "check-request" SET
        status = $status,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params: any = {
      $id: id,
      $status: request.status,
    };

    try {
      const result = await statement.executeAsync(params);
      const updated = await result.getFirstAsync();
      return updated ? CheckRequest.fromRow(updated) : request;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: string): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "check-request" WHERE id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findById(id: string): Promise<CheckRequest> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "check-request" WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("Check request not found");
      }
      return CheckRequest.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<CheckRequest[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "check-request"
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => CheckRequest.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByEntity(entityName: string): Promise<CheckRequest[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "check-request" 
      WHERE entityName = $entityName
      ORDER BY lastSync DESC
    `);

    try {
      const result = await statement.executeAsync({ $entityName: entityName });
      const rows = await result.getAllAsync();
      return rows.map((row) => CheckRequest.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findLatestByEntity(entityName: string): Promise<CheckRequest | null> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "check-request" 
      WHERE entityName = $entityName
      ORDER BY lastSync DESC
      LIMIT 1
    `);

    try {
      const result = await statement.executeAsync({ $entityName: entityName });
      const row = await result.getFirstAsync();
      return row ? CheckRequest.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByStatus(status: CheckRequestStatus): Promise<CheckRequest[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "check-request" 
      WHERE status = $status
      ORDER BY lastSync DESC
    `);

    try {
      const result = await statement.executeAsync({ $status: status });
      const rows = await result.getAllAsync();
      return rows.map((row) => CheckRequest.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateStatus(
    id: string,
    status: CheckRequestStatus
  ): Promise<CheckRequest> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE "check-request" SET
        status = $status,
        lastSync = $lastSync,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $status: status,
      $lastSync: new Date().toISOString(),
    };

    try {
      const result = await statement.executeAsync(params);
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findStaleRequests(
    staleThresholdMinutes: number = 5
  ): Promise<CheckRequest[]> {
    const threshold = new Date(
      Date.now() - staleThresholdMinutes * 60 * 1000
    ).toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM "check-request" 
      WHERE status = $status
      AND lastSync < $threshold
      ORDER BY lastSync ASC
    `);

    try {
      const result = await statement.executeAsync({
        $status: "pending",
        $threshold: threshold,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => CheckRequest.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async cleanupOldRequests(retentionDays: number = 30): Promise<void> {
    const threshold = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    ).toISOString();
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM "check-request" 
      WHERE status != $status
      AND createdAt < $threshold
    `);

    try {
      await statement.executeAsync({
        $status: "pending",
        $threshold: threshold,
      });
    } finally {
      await statement.finalizeAsync();
    }
  }
}
