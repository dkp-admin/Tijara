import * as SQLite from "expo-sqlite";
import { DATABASE_NAME } from "./config";
import { MigrationRunner } from "./migration-runner";
import { migrations } from "./migrations";
import { EventSubscription } from "./event-subscription";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import { DBKeysName } from "../sync/database-pull";

export class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase;
  private eventSubscription: EventSubscription;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  public async init() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        enableChangeListener: true,
      });
      await this.db.execAsync("PRAGMA journal_mode = WAL;");

      Database.instance = new Database();
    }

    await this.migrateIfRequired(this.db);
  }

  public getConnection() {
    return this.db;
  }

  private async migrateIfRequired(db: SQLite.SQLiteDatabase) {
    const runner = new MigrationRunner({
      database: db,
      migrations,
    });
    await runner.run();
  }

  private async triggerLogout(): Promise<boolean> {
    try {
      await MMKVDB.set(DBKeys.FIRST_TIME_SYNC_ALL, "failed");
      const allEntities = Object.keys(DBKeysName || {});
      allEntities.map((entity) => {
        MMKVDB.set(DBKeysName[entity], null);
      });
      const excludedTables = [
        "migrations",
        "db_version",
        "sqlite_sequence",
        "printer",
      ];
      const tableQuery =
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";

      const tables: any[] = await this.db.getAllAsync(tableQuery);

      for (const table of tables) {
        if (!excludedTables.includes(table.name)) {
          await this.db.execAsync(`DELETE FROM '${table.name}'`);
        }
      }

      return true;
    } catch (error) {
      console.error("Error in triggerLogout:", error);
      return false;
    }
  }

  public async checkVersionAndMigrate(
    requiredVersion: string
  ): Promise<boolean> {
    try {
      if (!this.db) {
        this.db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
          enableChangeListener: true,
        });

        Database.instance = new Database();

        // Initialize EventSubscription when database is opened here
        this.eventSubscription = EventSubscription.getInstance(this.db);
        await this.eventSubscription.setupChangeListeners();
      }

      const tableCheck = await this.db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='db_version'"
      );

      if (!tableCheck) {
        await this.db.execAsync(
          "CREATE TABLE IF NOT EXISTS db_version (id INTEGER PRIMARY KEY AUTOINCREMENT, version TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
        );
        await this.db.execAsync(
          `INSERT INTO db_version (version) VALUES ('${requiredVersion}')`
        );
        return await this.triggerLogout();
      }

      const versionResult: any = await this.db.getFirstAsync(
        "SELECT version FROM db_version ORDER BY id DESC LIMIT 1"
      );

      if (!versionResult) {
        await this.db.execAsync(
          `INSERT INTO db_version (version) VALUES ('${requiredVersion}')`
        );
        return await this.triggerLogout();
      }

      if (versionResult.version !== requiredVersion) {
        await this.db.execAsync(
          `INSERT INTO db_version (version) VALUES ('${requiredVersion}')`
        );
        return await this.triggerLogout();
      }

      return false;
    } catch (error) {
      console.error("Error checking version and migrating:", error);
      return false;
    }
  }
}
