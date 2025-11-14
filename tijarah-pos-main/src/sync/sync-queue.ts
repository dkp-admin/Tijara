import Netinfo from "@react-native-community/netinfo";
import { EventRegister } from "react-native-event-listeners";
import { MMKV } from "react-native-mmkv";
import { serializeError } from "serialize-error";
import { Connection } from "typeorm";
import EntityNames from "../types/entity-name";
import { db } from "../utils/createDatabaseConnection";
import Logger from "../utils/log-event";
import { debugLog, errorLog, infoLog } from "../utils/log-patch";
import DatabasePull from "./database-pull";
import DatabasePush from "./database-push";
const storage = new MMKV({ id: "app-persist-storage" });

interface RequestItem {
  entityName: EntityNames;
}

const TAG = "[SyncQueue]";

class SyncQueue {
  private items: RequestItem[];
  private isProcessing: boolean;
  private operations: any;
  private initialized: boolean;
  private isConnected: boolean;
  private pullOperations: DatabasePull;
  private pushOperations: DatabasePush;
  private connection: Connection | null;
  private static instance: SyncQueue | null = null;
  private interval: any;
  private logger: Logger;

  private constructor() {
    this.items = [];
    this.isProcessing = false;
    this.initialized = false;
    this.connection = null;
    this.isConnected = false;
    this.init();
    this.processQueue();
    this.logger = Logger.initialize();
  }

  public static initialize(): SyncQueue {
    console.log("INITIALIZED");
    if (!SyncQueue.instance) {
      SyncQueue.instance = new SyncQueue();
    }
    return SyncQueue.instance;
  }

  private init() {
    debugLog("Initialization In Progress", {}, "sync-queue", "initFunction");
    this.loadItems();
    this.pullOperations = new DatabasePull();
    this.connection = db;
    this.pushOperations = new DatabasePush();
    this.operations = this.initOps();
    EventRegister.addEventListener("sync:enqueue", ({ entityName }) => {
      this.enqueue(entityName);
    });

    Netinfo.addEventListener((state: any) => {
      this.isConnected = state.isConnected;
    });
    this.initialized = true;
    debugLog("Initialization Completed", {}, "sync-queue", "initFunction");
  }

  private initOps() {
    debugLog("Operations inititalized", {}, "sync-queue", "initOpsFunction");
    const opsObject = {
      "products-pull": () => this.pullOperations.fetchProducts(),
      "category-pull": () => this.pullOperations.fetchCategory(),
      "collection-pull": () => this.pullOperations.fetchCollection(),
      "customer-pull": () => this.pullOperations.fetchCustomer(),
      "business-details-pull": () => this.pullOperations.fetchBusinessDetail(),
      "orders-pull": () => this.pullOperations.fetchOrder(),
      "print-template-pull": () => this.pullOperations.fetchPrintTemplate(),
      "stock-history-pull": () => this.pullOperations.fetchStockHistory(),
      "batch-pull": () => this.pullOperations.fetchBatch(),
      "quick-items-pull": () => this.pullOperations.fetchQuickItems(),
      "custom-charge-pull": () => this.pullOperations.fetchCustomCharge(),
      "billing-settings-pull": () => this.pullOperations.fetchBillingSettings(),
      "products-push": () => this.pushOperations.pushProducts(),
      "customer-push": () => this.pushOperations.pushCustomer(),
      "business-details-push": () => this.pushOperations.pushBusinessDetail(),
      "orders-push": () => this.pushOperations.pushOrder(),
      "cash-drawer-txns-push": () => this.pushOperations.pushCashDrawerTxns(),
      "stock-history-push": () => this.pushOperations.pushStockHistory(),
      "batch-push": () => this.pushOperations.pushBatch(),
      "quick-items-push": () => this.pushOperations.pushQuickItems(),
      "billing-settings-push": () => this.pushOperations.pushBillingSettings(),
      "ads-management-pull": () => this.pullOperations.fetchAdsManagement(),
      "ads-report-push": () => this.pushOperations.pushAdsReport(),
      "kitchen-management-pull": () =>
        this.pullOperations.fetchKitchenManagement(),
      "kitchen-management-push": () =>
        this.pushOperations.pushKitchenManagement(),
      "section-tables-pull": () => this.pullOperations.fetchSectionTables(),
      "menu-pull": () => this.pullOperations.fetchMenuManagement(),
      "void-comp-pull": () => this.pullOperations.fetchVoidComp(),
      "box-crates-pull": () => this.pullOperations.fetchBoxCrates(),
      "box-crates-push": () => this.pushOperations.pushBoxCrates(),
      "section-tables-push": () => this.pushOperations.pushSectionTables(),
    };
    debugLog("Operations completed", {}, "sync-queue", "initOpsFunction");
    return opsObject;
  }

  private async loadItems() {
    try {
      const items = storage.getString("syncQueue");
      this.items = items ? JSON.parse(items) : [];
      debugLog(
        "Enqueued entity loaded from local storage",
        items,
        "sync-queue",
        "loadItemsFunction"
      );
    } catch (error: any) {
      console.log("Error loading queue items:", error);
      errorLog(error?.code, error, "sync-queue", "loadItemsFunction", error);
    }
  }

  private async saveItems() {
    try {
      debugLog(
        "Enqueued entity saved to local storage",
        this.items,
        "sync-queue",
        "saveItemsFunction"
      );
      storage.set("syncQueue", JSON.stringify(this.items));
    } catch (error: any) {
      console.log("Error saving queue items:", error);
      errorLog(error?.code, error, "sync-queue", "saveItemsFunction", error);
    }
  }

  enqueue(entityName: EntityNames) {
    debugLog(
      "Queue status",
      {
        interval: this.interval,
        processing: this.isProcessing,
        items: this.items,
        connection: this.connection,
      },
      "sync-queue-status",
      "processQueueFunction"
    );
    const item: RequestItem = { entityName };
    if (entityName === undefined || !entityName) return;
    this.items.push(item);
    console.log(TAG + "Enitiy enqueue for push " + entityName);
    this.saveItems();
  }

  dequeue(): RequestItem | undefined | null {
    if (this.connection) {
      const item = this.items.shift();
      return item;
    }
    return null;
  }

  private processQueue() {
    debugLog(
      "Queue status",
      { interval: this.interval, processing: this.isProcessing },
      "sync-queue-status",
      "processQueueFunction"
    );
    if (this.interval) {
      debugLog(
        "Queue already started",
        { interval: this.interval },
        "sync-queue",
        "processQueueFunction"
      );
      return;
    }
    this.interval = setInterval(async () => {
      if (!this.isConnected) {
        infoLog(
          "Internet not connected",
          { isConnected: this.isConnected },
          "sync-queue",
          "processQueueFunction"
        );
        return;
      }

      if (!this.isProcessing) {
        const item = this.dequeue();
        if (!item) return;
        debugLog("Dequeued item", item, "sync-queue", "processQueueFunction");
        this.isProcessing = true;
        try {
          const { entityName } = item;
          EventRegister.emit(`sync:start`, { entityName });
          debugLog(
            "performing ops operations after sync start",
            { entityName: entityName },
            "sync-queue",
            "processQueueFunction"
          );
          const response = await this.operations[entityName]();
          debugLog(
            "Ops Response: " + entityName,
            {},
            "sync-queue",
            "processQueueFunction"
          );
          EventRegister.emit(`sync:end`, { entityName });
          await this.logger.handleSuccessLogs(
            item.entityName,
            JSON.stringify({ success: true })
          );
        } catch (error: any) {
          errorLog(
            error?.code,
            { data: TAG + ` processQueue error: ${item.entityName}` },
            "sync-queue",
            "processQueueFunction",
            error
          );
          EventRegister.emit(`sync:failed`, { entityName: item.entityName });
          if (this.isConnected) {
            await this.logger.handleFailedLogs(
              item.entityName,
              JSON.stringify(serializeError(error))
            );
          }
        }
        this.isProcessing = false;
      }
    }, 2000);
  }
}

export default SyncQueue;
