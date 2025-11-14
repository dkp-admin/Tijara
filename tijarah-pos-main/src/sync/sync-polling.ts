import Netinfo from "@react-native-community/netinfo";
import { debugLog, errorLog, infoLog } from "../utils/log-patch";
import DatabasePull from "./database-pull";
import { EventRegister } from "react-native-event-listeners";

class SyncPolling {
  private isProcessing: boolean;
  private initialized: boolean;
  private isConnected: boolean;
  private pullOperations: DatabasePull;
  private static instance: SyncPolling | null = null;
  private interval: any;

  private constructor() {
    this.isProcessing = false;
    this.initialized = false;
    this.isConnected = false;
    this.init();
    this.processPolling();
  }

  public static initialize(): SyncPolling {
    console.log("INITIALIZED");
    if (!SyncPolling.instance) {
      SyncPolling.instance = new SyncPolling();
    }
    return SyncPolling.instance;
  }

  private init() {
    debugLog("Initialization In Progress", {}, "sync-polling", "initFunction");
    this.pullOperations = new DatabasePull();

    Netinfo.addEventListener((state: any) => {
      this.isConnected = state.isConnected;
    });
    this.initialized = true;
    debugLog("Initialization Completed", {}, "sync-polling", "initFunction");
  }

  private processPolling() {
    if (this.interval) {
      debugLog(
        "Polling already started",
        { interval: this.interval },
        "sync-polling",
        "processPollingFunction"
      );
      return;
    }

    this.interval = setInterval(async () => {
      if (!this.isConnected) {
        infoLog(
          "Internet not connected",
          { isConnected: this.isConnected },
          "sync-polling",
          "processPollingFunction"
        );
        return;
      }

      if (!this.isProcessing) {
        debugLog(
          "Polling started",
          { processing: this.isProcessing },
          "sync-polling",
          "processPollingFunction"
        );

        this.isProcessing = true;

        try {
          const response = await this.pullOperations.fetchAllEntities();

          debugLog(
            "Polling completed",
            response,
            "sync-polling",
            "processPollingFunction"
          );
        } catch (error: any) {
          errorLog(
            error?.code,
            { data: `Polling failed` },
            "sync-polling",
            "processPollingFunction",
            error
          );
        }
        this.isProcessing = false;
      }
    }, 1200000);
  }
}

export default SyncPolling;
