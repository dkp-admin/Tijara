import { backupSqlite } from "../utils/background-backup";
import { syncLogWithBackend } from "../utils/sync-logs";
import Netinfo from "@react-native-community/netinfo";

const TAG = "[SyncQueue]";

class SqliteBackup {
  private interval: any;
  private logInterval: any;
  private isConnected: boolean;

  public constructor() {
    this.processBackup();
    this.processLogs();
    Netinfo.addEventListener((state: any) => {
      this.isConnected = state.isConnected;
    });
  }

  private processBackup() {
    if (this.interval) {
      console.log(TAG + "Backup already started.");
      return;
    }
    this.interval = setInterval(async () => {
      await backupSqlite(this.isConnected);
    }, 6 * 60 * 60 * 1000);
  }

  private processLogs() {
    if (this.logInterval) {
      console.log(TAG + "Log sync already started.");
      return;
    }
    this.interval = setInterval(async () => {
      if (!this.isConnected) return;
      await syncLogWithBackend();
    }, 6 * 60 * 60 * 1000);
  }
}

export default SqliteBackup;
