import { BaseRepository } from "./base-repository";
import { OpLog } from "../schema/oplog";

export interface FindOptions {
  take?: number;
  skip?: number;
  where?: {
    requestId?: string;
    tableName?: string;
    operationType?: string;
    status?: string;
    entityId?: string;
    [key: string]: any;
  };
  order?: {
    [key: string]: "ASC" | "DESC";
  };
}

export class OpLogRepository extends BaseRepository<OpLog, number> {
  constructor() {
    super("opLogs");
  }

  async create(log: OpLog): Promise<OpLog> {
    const statement = await this.db.getConnection().prepareAsync(`
      INSERT INTO opLogs (
        _id, requestId, data, tableName, action, timestamp, status, createdAt, updatedAt
      ) VALUES (
        COALESCE($id, (SELECT MAX(id) + 1 FROM opLogs)),
        $requestId, $data, $tableName, $action, $timestamp, $status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(_id) DO UPDATE SET
        requestId = $requestId,
        data = $data,
        tableName = $tableName,
        action = $action,
        timestamp = $timestamp,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const params: any = {
      $id: log._id,
      $requestId: log.requestId || null,
      $data: log.data,
      $tableName: log.tableName,
      $action: log.action,
      $timestamp: log.timestamp.toISOString(),
      $status: log.status,
    };

    try {
      const result = await statement.executeAsync(params);
      if (!log._id) {
        const lastId: any = await this.db
          .getConnection()
          .getFirstAsync("SELECT last_insert_rowid() as id");
        log._id = lastId.id;
      }
      return log;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async createMany(logs: OpLog[]): Promise<OpLog[]> {
    const columns = [
      "_id",
      "requestId",
      "data",
      "tableName",
      "action",
      "timestamp",
      "status",
    ];

    const generateParams = (log: OpLog) => {
      const toRow = OpLog.toRow(log);
      return [
        toRow._id,
        toRow.requestId || null,
        toRow.data,
        toRow.tableName,
        toRow.action,
        toRow.timestamp,
        toRow.status,
      ];
    };

    return this.createManyGeneric("opLogs", logs, columns, generateParams);
  }

  async update(id: number, log: OpLog): Promise<OpLog> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE opLogs SET
        requestId = $requestId,
        data = $data,
        tableName = $tableName,
        action = $action,
        timestamp = $timestamp,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP
      WHERE _id = $id
    `);

    const params = {
      $id: id,
      $requestId: log.requestId || null,
      $data: log.data,
      $tableName: log.tableName,
      $action: log.action,
      $timestamp: log.timestamp.toISOString(),
      $status: log.status,
    };

    try {
      await statement.executeAsync(params);
      log._id = id;
      return log;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async updateByTableAndStatus(
    status: string,
    tableName: string,
    requestId: string
  ): Promise<OpLog | null> {
    const updateStatement = await this.db.getConnection().prepareAsync(`
      UPDATE opLogs SET
        requestId = $requestId,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP
      WHERE tableName = $tableName AND status = 'pending'
    `);

    const findStatement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs WHERE requestId = $requestId
    `);

    try {
      await updateStatement.executeAsync({
        $requestId: requestId,
        $status: status,
        $tableName: tableName,
      });

      const result = await findStatement.executeAsync({
        $requestId: requestId,
      });
      const row = await result.getFirstAsync();
      return row ? OpLog.fromRow(row) : null;
    } finally {
      await updateStatement.finalizeAsync();
      await findStatement.finalizeAsync();
    }
  }

  async updateByRequestId(
    id: string,
    log: Partial<OpLog>
  ): Promise<Partial<OpLog> | null> {
    const statement: any = await this.db.getConnection().prepareAsync(`
      UPDATE opLogs SET
        requestId = $requestId,
        status = $status,
        updatedAt = CURRENT_TIMESTAMP
      WHERE requestId = $id
    `);

    try {
      console.log({
        $id: id,
        $requestId: log.requestId || null,
        $status: log.status,
      });
      const result = await statement.executeAsync({
        $id: id,
        $requestId: log.requestId || null,
        $status: log.status,
      });

      const row = await result.getFirstAsync();
      return row ? OpLog.fromRow(row) : null;
    } finally {
      await statement.finalizeAsync();
    }
  }
  async find(options: FindOptions): Promise<OpLog[]> {
    try {
      const conditions: string[] = [];
      const params: Record<string, any> = {};
      let paramIndex = 0;

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          const paramName = `$param${paramIndex++}`;

          if (typeof value === "object") {
            if ("operator" in value) {
              switch (value.operator) {
                case "Like":
                  conditions.push(`${key} LIKE ${paramName}`);
                  params[paramName] = `%${value.value}%`;
                  break;
                case "Between":
                  conditions.push(
                    `${key} BETWEEN $start${paramIndex} AND $end${paramIndex}`
                  );
                  params[`$start${paramIndex}`] = value.start;
                  params[`$end${paramIndex}`] = value.end;
                  paramIndex++;
                  break;
                case "JsonContains":
                  conditions.push(`JSON_CONTAINS(${key}, ${paramName}, '$')`);
                  params[paramName] = JSON.stringify(value.value);
                  break;
              }
            }
          } else {
            conditions.push(`${key} = ${paramName}`);
            params[paramName] = value;
          }
        });
      }

      let query = "SELECT * FROM opLogs";
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      if (options.order) {
        const orderClauses = Object.entries(options.order).map(
          ([key, direction]) => `${key} ${direction}`
        );
        if (orderClauses.length > 0) {
          query += ` ORDER BY ${orderClauses.join(", ")}`;
        }
      }

      if (options.take !== undefined && options.skip !== undefined) {
        query += ` LIMIT $limit OFFSET $offset`;
        params.$limit = options.take;
        params.$offset = options.skip;
      }

      const statement = await this.db.getConnection().prepareAsync(query);

      try {
        const result = await statement.executeAsync(params);
        const rows = await result.getAllAsync();
        return rows.map((row) => OpLog.fromRow(row));
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error("Error in find:", error);
      return [];
    }
  }

  async findById(id: number): Promise<OpLog> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs WHERE _id = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("OpLog not found");
      }
      return OpLog.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByRequestid(id: string): Promise<OpLog> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs WHERE requestId = $id
    `);

    try {
      const result = await statement.executeAsync({ $id: id });
      const row = await result.getFirstAsync();
      if (!row) {
        throw new Error("OpLog not found");
      }
      return OpLog.fromRow(row);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findAll(): Promise<OpLog[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs
    `);

    try {
      const result = await statement.executeAsync({});
      const rows = await result.getAllAsync();
      return rows.map((row) => OpLog.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findPendingLogs(): Promise<OpLog[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs 
      WHERE status = $status 
      ORDER BY timestamp ASC
    `);

    try {
      const result = await statement.executeAsync({ $status: "pending" });
      const rows = await result.getAllAsync();
      return rows.map((row) => OpLog.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findPendingLogsByTableName(tableName: string): Promise<OpLog[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs 
      WHERE status = $status 
      AND tableName = $tableName 
      ORDER BY timestamp ASC
    `);

    try {
      const result = await statement.executeAsync({
        $status: "pending",
        $tableName: tableName,
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => OpLog.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<OpLog[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs 
      WHERE timestamp BETWEEN $startDate AND $endDate 
      ORDER BY timestamp DESC
    `);

    try {
      const result = await statement.executeAsync({
        $startDate: startDate.toISOString(),
        $endDate: endDate.toISOString(),
      });
      const rows = await result.getAllAsync();
      return rows.map((row) => OpLog.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }

  async findByTableName(tableName: string): Promise<OpLog[]> {
    const statement = await this.db.getConnection().prepareAsync(`
      SELECT * FROM opLogs 
      WHERE tableName = $tableName 
      ORDER BY timestamp DESC
    `);

    try {
      const result = await statement.executeAsync({ $tableName: tableName });
      const rows = await result.getAllAsync();
      return rows.map((row) => OpLog.fromRow(row));
    } finally {
      await statement.finalizeAsync();
    }
  }
  async markAsPushed(id: number): Promise<OpLog> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE opLogs SET status = $status, updatedAt = CURRENT_TIMESTAMP WHERE _id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $status: "pushed",
      });
      return await this.findById(id);
    } finally {
      await statement.finalizeAsync();
    }
  }

  async markAllAsPushed(): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      UPDATE opLogs SET status = $newStatus, updatedAt = CURRENT_TIMESTAMP WHERE status = $oldStatus
    `);

    try {
      await statement.executeAsync({
        $newStatus: "pushed",
        $oldStatus: "pending",
      });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async deleteOlderThan(date: Date): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM opLogs WHERE timestamp < $date
    `);

    try {
      await statement.executeAsync({
        $date: date.toISOString(),
      });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async delete(id: number): Promise<void> {
    const statement = await this.db.getConnection().prepareAsync(`
      DELETE FROM opLogs WHERE _id = $id
    `);

    try {
      await statement.executeAsync({ $id: id });
    } finally {
      await statement.finalizeAsync();
    }
  }
}
