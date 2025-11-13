import Netinfo from "@react-native-community/netinfo";
import databasePull from "./database-pull";
import { InteractionManager } from "react-native";
import { logError, logInfo } from "../utils/axiom-logger";

class SyncPolling {
  private isProcessing: boolean;
  private initialized: boolean;
  private isConnected: boolean;
  private static instance: SyncPolling | null = null;
  private highPriorityInterval: any = null;
  private mediumPriorityInterval: any = null;
  private lowPriorityInterval: any = null;
  private netInfoUnsubscribe: (() => void) | null = null;

  private readonly INTERVALS = {
    HIGH: 2 * 60 * 1000, // 2 minutes
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LOW: 15 * 60 * 1000, // 15 minutes
  };

  private constructor() {
    this.isProcessing = false;
    this.initialized = false;
    this.isConnected = false;
    this.init();
  }

  public static initialize(): SyncPolling {
    if (!SyncPolling.instance) {
      SyncPolling.instance = new SyncPolling();
    }
    return SyncPolling.instance;
  }

  private init() {
    this.netInfoUnsubscribe = Netinfo.addEventListener((state: any) => {
      const previousConnection = this.isConnected;
      this.isConnected = state.isConnected;

      if (!previousConnection && this.isConnected) {
        logInfo("[SyncPolling] Network reconnected, triggering sync");
        this.triggerImmediateSync();
      }
    });

    this.initialized = true;
    this.startPolling();
  }

  private async syncEntities(priority: "HIGH" | "MEDIUM" | "LOW") {
    if (this.isProcessing || !this.isConnected) return;

    InteractionManager.runAfterInteractions(async () => {
      this.isProcessing = true;

      try {
        switch (priority) {
          case "HIGH":
            logInfo("[SyncPolling] Starting high priority sync");

            await databasePull.fetchProducts();
            await databasePull.fetchCategory();
            await databasePull.fetchOrderSequences();
            break;

          case "MEDIUM":
            logInfo("[SyncPolling] Starting medium priority sync");

            await databasePull.fetchCollection();
            await databasePull.fetchOrder();
            await databasePull.fetchCustomer();
            await databasePull.fetchQuickItems();
            await databasePull.fetchKitchenManagement();
            await databasePull.fetchMenuManagement();
            break;

          case "LOW":
            logInfo("[SyncPolling] Starting low priority sync");
            await databasePull.fetchBusinessDetail();
            await databasePull.fetchPrintTemplate();
            await databasePull.fetchBatch();
            await databasePull.fetchCustomCharge();
            await databasePull.fetchBillingSettings();
            await databasePull.fetchAdsManagement();
            await databasePull.fetchSectionTables();
            await databasePull.fetchVoidComp();
            await databasePull.fetchBoxCrates();
            await databasePull.fetchStockHistory();
            break;
        }

        logInfo(`[SyncPolling] ${priority} priority sync completed`);
      } catch (error) {
        logError(`[SyncPolling] ${priority} priority sync error`, error);
      } finally {
        this.isProcessing = false;
      }
    });
  }

  private startPolling() {
    if (
      this.highPriorityInterval ||
      this.mediumPriorityInterval ||
      this.lowPriorityInterval
    ) {
      return;
    }

    this.highPriorityInterval = setInterval(() => {
      console.log("processing high priority queue");
      this.syncEntities("HIGH");
    }, this.INTERVALS.HIGH);

    this.mediumPriorityInterval = setInterval(() => {
      console.log("processing medium priority queue");
      this.syncEntities("MEDIUM");
    }, this.INTERVALS.MEDIUM);

    this.lowPriorityInterval = setInterval(() => {
      console.log("processing low priority queue");
      this.syncEntities("LOW");
    }, this.INTERVALS.LOW);

    this.triggerImmediateSync();
  }

  private triggerImmediateSync() {
    setTimeout(() => this.syncEntities("HIGH"), 1000);
    setTimeout(() => this.syncEntities("MEDIUM"), 5000);
    setTimeout(() => this.syncEntities("LOW"), 10000);
  }

  public stopPolling() {
    if (this.highPriorityInterval) {
      clearInterval(this.highPriorityInterval);
      this.highPriorityInterval = null;
    }
    if (this.mediumPriorityInterval) {
      clearInterval(this.mediumPriorityInterval);
      this.mediumPriorityInterval = null;
    }
    if (this.lowPriorityInterval) {
      clearInterval(this.lowPriorityInterval);
      this.lowPriorityInterval = null;
    }
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
  }

  public forceSync() {
    if (!this.isConnected) {
      logInfo("[SyncPolling] Cannot force sync - no network connection");
      return;
    }
    this.triggerImmediateSync();
  }
}

export default SyncPolling;
