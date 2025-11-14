import { SQLiteDatabase } from "expo-sqlite";

export interface IMigration {
  name: string;
  up: () => string;
  down: () => string;
}

type MigrationRunnerConfig = {
  database: SQLiteDatabase;
  migrations: IMigration[];
};

export class MigrationRunner {
  constructor(private readonly config: MigrationRunnerConfig) {}

  async run(): Promise<void> {
    await this.ensureMigrationTable();
    await this.runMigrations();
  }

  async ensureMigrationTable(): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;
    await this.config.database.execAsync(query);
  }

  async runMigrations(): Promise<void> {
    const migrations = this.config.migrations;
    const ranMigrations = await this.config.database.getAllAsync<{
      name: string;
    }>("SELECT name FROM migrations");

    const migrationsToRun = migrations.filter(
      (migration) => !ranMigrations.some((m) => m.name === migration.name)
    );

    await this.config.database.withTransactionAsync(async () => {
      for (const migration of migrationsToRun) {
        try {
          const query = migration.up();
          await this.config.database.execAsync(query);
          await this.config.database.execAsync(
            `INSERT INTO migrations (name) VALUES ('${migration.name}')`
          );
        } catch (error) {
          console.log("Migration failed", migration.name, error);
        }
      }
    });
  }
}
