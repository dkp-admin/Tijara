import * as SQLite from "expo-sqlite";
import { EventRegister } from "react-native-event-listeners";
import EntityNames from "../types/entity-name";
import MMKVDB from "../utils/DB-MMKV";
import { AdsManagement } from "./schema/ad-management";
import { AdsReport } from "./schema/ad-report";
import { Batch } from "./schema/batch";
import { BillingSettings } from "./schema/billing-settings";
import { BoxCrates } from "./schema/box-crates";
import { BusinessDetails } from "./schema/business-details";
import { CashDrawerTransaction } from "./schema/cashdrawer-txn";
import { Customer } from "./schema/customer";
import { KitchenManagement } from "./schema/kitchen-management";
import { Order } from "./schema/order";
import { Printer } from "./schema/printer";
import { Product } from "./schema/product/product";
import { SectionTables } from "./schema/section-table";
import { StockHistory } from "./schema/stock-history";
import { OrderNumberSequence } from "./schema/order-number-sequence";

const pushEntities = {
  products: EntityNames.ProductsPush,
  customer: EntityNames.CustomerPush,
  orders: EntityNames.OrdersPush,
  "business-details": EntityNames.BusinessDetailsPush,
  "cash-drawer-txns": EntityNames.CashDrawerTxnsPush,
  "stock-history": EntityNames.StockHistoryPush,
  batch: EntityNames.BatchPush,
  "billing-settings": EntityNames.BillingSettingsPush,
  "ads-report": EntityNames.AdsReportPush,
  "kitchen-management": EntityNames.KitchenManagementPush,
  "section-tables": EntityNames.SectionTablesPush,
  "box-crates": EntityNames.BoxCratesPush,
  "order-number-sequence": EntityNames.OrderNumberSequencePush,
};

const fromRows = {
  products: Product.fromRow,
  customer: Customer.fromRow,
  orders: Order.fromRow,
  "business-details": BusinessDetails.fromRow,
  "cash-drawer-txns": CashDrawerTransaction.fromRow,
  "stock-history": StockHistory.fromRow,
  batch: Batch.fromRow,
  "billing-settings": BillingSettings.fromRow,
  "ads-report": AdsReport.fromRow,
  "kitchen-management": KitchenManagement.fromRow,
  "section-tables": SectionTables.fromRow,
  "box-crates": BoxCrates.fromRow,
  printer: Printer.fromRow,
  "ads-management": AdsManagement.fromRow,
  "order-number-sequence": OrderNumberSequence.fromRow,
};

interface OpLogEntry {
  data: string;
  tableName: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  status: "pending";
  timestamp: string;
}

export class EventSubscription {
  private static instance: EventSubscription | null = null;
  private db: SQLite.SQLiteDatabase;
  private changeListener: any = null;

  private constructor(database: SQLite.SQLiteDatabase) {
    this.db = database;
  }

  public static getInstance(
    database: SQLite.SQLiteDatabase
  ): EventSubscription {
    if (!EventSubscription.instance) {
      EventSubscription.instance = new EventSubscription(database);
    }
    return EventSubscription.instance;
  }

  async setupChangeListeners(): Promise<any> {
    if (this.changeListener) {
      this.changeListener.remove();
    }

    this.changeListener = await SQLite.addDatabaseChangeListener(
      async (event: SQLite.DatabaseChangeEvent) => {
        const { tableName, rowId, databaseName }: any = event;
        console.log("Change event", tableName);

        if (!tableName || !rowId) return;

        if (
          tableName === "migrations" ||
          tableName === "opLogs" ||
          tableName === "check-request" ||
          tableName === "device-user" ||
          tableName === "db_version" ||
          tableName === "quick-items"
        )
          return;

        try {
          // Fetch the current state of the row
          const entity: any = await this.db.getFirstAsync(
            `SELECT * FROM "${tableName}" WHERE rowid = ${rowId}`
          );

          if (entity) {
            if (!entity?.createdAt) return;
            const isNewRow = await this.isNewRow(tableName, rowId);
            if (entity.source === "server") return;
            if (tableName === "opLogs" && isNewRow) {
              return;
            }

            if (
              tableName === "cash-drawer-txns" &&
              entity.transactionType === "open"
            ) {
              return;
            }

            if (tableName === "billing-settings" && !isNewRow) {
              entity._id = MMKVDB.get("device").deviceRef;
            }

            if (isNewRow) {
              console.log("new created", tableName);
              await this.afterInsert(tableName, entity);
            } else {
              console.log("updated", tableName);
              if (tableName === "opLogs") return;
              await this.afterUpdate(tableName, entity);
            }
          }
        } catch (error) {
          console.error(
            "Error handling database change:",
            error,
            `Table: ${tableName}, RowId: ${rowId}, DB: ${databaseName}`
          );
        }
      }
    );

    return this.changeListener;
  }

  private async isNewRow(tableName: string, rowId: number): Promise<boolean> {
    const row: any = await this.db.getFirstAsync(
      `SELECT createdAt, updatedAt FROM "${tableName}" WHERE rowid = ${rowId}`
    );

    if (row) {
      if (!row?.createdAt || !row?.updatedAt) return false;

      const createdAt = new Date(row.createdAt);
      const updatedAt = new Date(row.updatedAt);

      createdAt.setSeconds(0, 0);
      updatedAt.setSeconds(0, 0);

      return updatedAt.getTime() === createdAt.getTime();
    }

    return false;
  }

  private async afterInsert(
    tableName: keyof typeof fromRows,
    entity: any
  ): Promise<void> {
    console.log("after insert called", tableName);
    const doc = fromRows[tableName](entity);

    const obj: OpLogEntry = {
      data: JSON.stringify({
        insertOne: {
          document: { ...doc },
        },
      }),
      tableName,
      action: "INSERT",
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    try {
      await this.saveToOpLog(obj);

      if (Object.keys(pushEntities).includes(tableName)) {
        EventRegister.emit("sync:enqueue", {
          entityName: pushEntities[tableName as keyof typeof pushEntities],
        });
      }
    } catch (error) {
      console.log("oplog error", error);
    }
  }

  private async afterUpdate(
    tableName: keyof typeof fromRows,
    entity: any
  ): Promise<void> {
    console.log("after update called", tableName);
    const doc = fromRows[tableName](entity);
    const obj: OpLogEntry = {
      data: JSON.stringify({
        updateOne: {
          filter: { _id: entity._id },
          update: doc,
        },
      }),
      tableName,
      action: "UPDATE",
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    try {
      await this.saveToOpLog(obj);

      if (Object.keys(pushEntities).includes(tableName)) {
        EventRegister.emit("sync:enqueue", {
          entityName: pushEntities[tableName as keyof typeof pushEntities],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async saveToOpLog(opLogEntry: OpLogEntry): Promise<any> {
    try {
      const escapedData = opLogEntry.data.replace(/'/g, "''");
      const query = `INSERT INTO opLogs (data, tableName, action, status, timestamp) 
        VALUES (
          '${escapedData}',
          '${opLogEntry.tableName}',
          '${opLogEntry.action}',
          '${opLogEntry.status}',
          '${opLogEntry.timestamp}'
        )`;

      const result = await this.db.execAsync(query);
      return result;
    } catch (error) {
      console.error("Error saving to oplog:", error);
      throw error;
    }
  }
}
