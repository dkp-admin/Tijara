import { SQLiteDatabase } from "expo-sqlite";
import { Database } from "../index";

export abstract class BaseRepository<T, IdType = string> {
  protected db: Database;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = Database.getInstance();
    this.tableName = tableName;
  }

  protected async runInTransaction<R>(
    operation: (db: SQLiteDatabase) => Promise<R>
  ): Promise<R> {
    let retries = 3;

    while (retries > 0) {
      try {
        await this.db.getConnection().execAsync("BEGIN EXCLUSIVE TRANSACTION");
        const result = await operation(this.db.getConnection());
        await this.db.getConnection().execAsync("COMMIT");
        return result;
      } catch (error: any) {
        await this.db.getConnection().execAsync("ROLLBACK");
        if (error.message?.includes("database is locked") && retries > 1) {
          retries--;
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }

        throw error;
      }
    }

    throw new Error("Failed to execute transaction after multiple retries");
  }

  escapeString = (str: string): string => {
    return str.replace(/'/g, "''"); // SQLite uses two single quotes to escape single quotes
  };

  async createManyGeneric<T>(
    tableName: string,
    records: T[],
    columns: string[],
    generateParams: (record: T) => any[]
  ): Promise<T[]> {
    try {
      const conflictColumns = ["_id"];
      const NUM_COLUMNS = columns.length;
      const MAX_CHUNK_SIZE = 20;
      const chunks: any = [];

      for (let i = 0; i < records.length; i += MAX_CHUNK_SIZE) {
        chunks.push(records.slice(i, i + MAX_CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        const placeholders = chunk
          .map(
            () =>
              `(${new Array(NUM_COLUMNS)
                .fill("?")
                .join(",")}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
          )
          .join(",");

        let query = `
            INSERT INTO "${tableName}" (
              ${columns.join(", ")}, createdAt, updatedAt
            ) VALUES ${placeholders}
          `;

        if (conflictColumns?.length) {
          const updateColumns = columns.filter(
            (col) => !conflictColumns.includes(col)
          );
          const setClause = updateColumns
            .map((col) => `${col} = excluded.${col}`)
            .join(", ");

          query += `
              ON CONFLICT (${conflictColumns.join(", ")}) 
              DO UPDATE SET
                ${setClause},
                updatedAt = CURRENT_TIMESTAMP,
                ${columns
                  .filter((col) => conflictColumns.includes(col))
                  .map((col) => `${col} = ${col}`)
                  .join(", ")}
            `;
        }

        const params = chunk.flatMap((record: any) => generateParams(record));
        await this.db.getConnection().runAsync(query, params);
      }
    } catch (error) {
      console.log(error);
    }

    return records;
  }
  abstract create(item: T): Promise<T>;
  abstract update(id: IdType, item: T): Promise<T>;
  abstract delete(id: IdType): Promise<void>;
  abstract findById(id: IdType): Promise<T>;
  abstract findAll(): Promise<T[]>;
}
