import { EventRegister } from "react-native-event-listeners";
import { DataSource, Repository } from "typeorm";
import { LogsModel } from "../database/logs/logs";

import { db } from "./createDatabaseConnection";
import { debugLog } from "./log-patch";
const LogTypes = {
  success: "log:success",
  failed: "log:failed",
};

class Logger {
  private logRepository: Repository<LogsModel>;
  private connection: DataSource;
  private static instance: Logger | null = null;
  constructor() {
    this.connection = db;
    EventRegister.addEventListener(
      LogTypes.success,
      ({ entityName, response }: { entityName: string; response: string }) => {
        this.handleSuccessLogs(entityName, response);
      }
    );

    EventRegister.addEventListener(
      LogTypes.failed,
      ({ entityName, response }: { entityName: string; response: string }) => {
        this.handleSuccessLogs(entityName, response);
      }
    );
  }

  public static initialize(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async handleSuccessLogs(entityName: string, response: string) {
    if (!this.logRepository && this.connection) {
      this.logRepository = db.getRepository(LogsModel);
    }
    const isPull = entityName?.includes("pull");
    const entity = entityName.replace("-pull", "");
    const data = {
      entityName: entity,
      success: true,
      eventType: isPull ? "pull" : "push",
      eventName: isPull ? "pull" : "push",
      response,
      createdAt: new Date(),
    };
    await this.logRepository.insert(data);
    debugLog(
      "Logs inserted to local db",
      data,
      "log-event",
      "handleSuccessLogsFunction"
    );
  }

  public async handleFailedLogs(entityName: string, response: string) {
    if (!this.logRepository && this.connection) {
      this.logRepository = db.getRepository(LogsModel);
    }
    const isPull = entityName?.includes("pull");
    const entity = entityName.replace("-pull", "");
    const data = {
      entityName: entity,
      success: false,
      eventType: isPull ? "pull" : "push",
      eventName: isPull ? "pull" : "push",
      response,
      createdAt: new Date(),
    };
    await this.logRepository.insert(data);
    debugLog(
      "Logs inserted to local db",
      data,
      "log-event",
      "handleFailedLogsFunction"
    );
  }
}

export default Logger;
