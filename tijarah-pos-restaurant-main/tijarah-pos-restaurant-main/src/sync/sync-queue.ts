import Netinfo from "@react-native-community/netinfo";
import { EventRegister } from "react-native-event-listeners";
import { MMKV } from "react-native-mmkv";
import EntityNames from "../types/entity-name";
import databasePull from "./database-pull";
import DatabasePush from "./database-push";
import { logError, logInfo } from "../utils/axiom-logger";

const storage = new MMKV({ id: "app-persist-storage" });
const TAG = "[SyncQueue]";

interface RequestItem {
  entityName: EntityNames;
}

class SyncQueue {
  private items: RequestItem[];
  private isProcessing: boolean;
  private operations: any;
  private isConnected: boolean;
  private pushOperations: DatabasePush;
  private static instance: SyncQueue | null = null;
  private interval: any;
  private netInfoUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.items = [];
    this.isProcessing = false;
    this.isConnected = false;
    this.init();
    this.processQueue();
  }

  public static initialize(): SyncQueue {
    if (!SyncQueue.instance) {
      SyncQueue.instance = new SyncQueue();
    }
    return SyncQueue.instance;
  }

  private init() {
    this.loadItems();
    this.pushOperations = new DatabasePush();
    this.operations = this.initOps();

    // Subscribe to sync events
    EventRegister.addEventListener("sync:enqueue", ({ entityName }) => {
      this.enqueue(entityName);
    });

    // Subscribe to network state
    this.netInfoUnsubscribe = Netinfo.addEventListener((state: any) => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected;

      // If connection restored, start processing queue
      if (!wasConnected && this.isConnected) {
        logInfo(TAG + " Network restored, resuming queue processing", {});
      }
    });
  }

  private initOps() {
    return {
      "products-pull": () => databasePull.fetchProducts(),
      "category-pull": () => databasePull.fetchCategory(),
      "collection-pull": () => databasePull.fetchCollection(),
      "customer-pull": () => databasePull.fetchCustomer(),
      "business-details-pull": () => databasePull.fetchBusinessDetail(),
      "orders-pull": () => databasePull.fetchOrder(),
      "print-template-pull": () => databasePull.fetchPrintTemplate(),
      "stock-history-pull": () => databasePull.fetchStockHistory(),
      "batch-pull": () => databasePull.fetchBatch(),
      "quick-items-pull": () => databasePull.fetchQuickItems(),
      "custom-charge-pull": () => databasePull.fetchCustomCharge(),
      "billing-settings-pull": () => databasePull.fetchBillingSettings(),
      "products-push": () => this.pushOperations.pushProducts(),
      "customer-push": () => this.pushOperations.pushCustomer(),
      "business-details-push": () => this.pushOperations.pushBusinessDetail(),
      "orders-push": () => this.pushOperations.pushOrder(),
      "cash-drawer-txns-push": () => this.pushOperations.pushCashDrawerTxns(),
      "stock-history-push": () => this.pushOperations.pushStockHistory(),
      "batch-push": () => this.pushOperations.pushBatch(),
      "billing-settings-push": () => this.pushOperations.pushBillingSettings(),
      "ads-management-pull": () => databasePull.fetchAdsManagement(),
      "kitchen-management-pull": () => databasePull.fetchKitchenManagement(),
      "kitchen-management-push": () =>
        this.pushOperations.pushKitchenManagement(),
      "section-tables-pull": () => databasePull.fetchSectionTables(),
      "menu-pull": () => databasePull.fetchMenuManagement(),
      "void-comp-pull": () => databasePull.fetchVoidComp(),
      "box-crates-pull": () => databasePull.fetchBoxCrates(),
      "box-crates-push": () => this.pushOperations.pushBoxCrates(),
      "section-tables-push": () => this.pushOperations.pushSectionTables(),
      "order-number-sequence-pull": () => databasePull.fetchOrderSequences(),
      "order-number-sequence-push": () =>
        this.pushOperations.pushOrderNumberSequences(),
    };
  }

  private async loadItems() {
    try {
      const storedItems = storage.getString("syncQueue");
      this.items = storedItems ? JSON.parse(storedItems) : [];
      logInfo(TAG + " Loaded queue items: " + this.items.length, {});
    } catch (error) {
      logError(TAG + " Error loading queue items", error);
      this.items = [];
    }
  }

  private setQueueItems(items: RequestItem[]) {
    try {
      storage.set("syncQueue", JSON.stringify(items));
      this.items = items;
      logInfo(TAG + " Updated queue items: " + items.length, {});
    } catch (error) {
      logError(TAG + " Error saving queue items", error);
    }
  }

  public enqueue(entityName: EntityNames) {
    if (!entityName) {
      logInfo(TAG + " Invalid entity name provided", {});
      return;
    }

    // Prevent duplicates
    const isDuplicate = this.items.some(
      (item) => item.entityName === entityName
    );
    if (isDuplicate) {
      logInfo(TAG + " Entity already in queue: " + entityName, {});
      return;
    }

    const newItems = [...this.items, { entityName }];
    this.setQueueItems(newItems);
    logInfo(TAG + " Entity enqueued: " + entityName, {});
  }

  private dequeue(): RequestItem | undefined | null {
    if (this.items.length === 0) return null;

    const [item, ...remainingItems] = this.items;
    this.setQueueItems(remainingItems);
    return item;
  }

  private processQueue() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(async () => {
      if (!this.isConnected || this.isProcessing) {
        return;
      }

      const item = this.dequeue();
      if (!item) return;

      this.isProcessing = true;

      try {
        const { entityName } = item;

        if (!this.operations[entityName]) {
          logError(TAG + " Invalid operation", { entityName });
          return;
        }

        logInfo(TAG + " Processing: " + entityName, {});
        EventRegister.emit("sync:start", { entityName });

        await this.operations[entityName]();

        logInfo(TAG + " Completed: " + entityName, {});
        EventRegister.emit("sync:end", { entityName });
      } catch (error) {
        logError(TAG + " Sync failed", {
          entityName: item.entityName,
          error: JSON.stringify(error),
        });
        EventRegister.emit("sync:failed", { entityName: item.entityName });
      } finally {
        this.isProcessing = false;
      }
    }, 2000);
  }

  public stopQueue() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
  }

  public clearQueue() {
    this.setQueueItems([]);
    logInfo(TAG + " Queue cleared", {});
  }

  public getQueueStatus() {
    return {
      itemCount: this.items.length,
      isProcessing: this.isProcessing,
      isConnected: this.isConnected,
    };
  }
}

export default SyncQueue;
