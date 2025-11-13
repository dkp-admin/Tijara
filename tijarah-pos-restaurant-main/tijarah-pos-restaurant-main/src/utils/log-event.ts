import { EventRegister } from "react-native-event-listeners";

const LogTypes = {
  success: "log:success",
  failed: "log:failed",
};

class Logger {
  private logRepository: any;
  private connection: any;
  private static instance: Logger | null = null;
  constructor() {}

  public static initialize(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async handleSuccessLogs(entityName: string, response: string) {
    if (!this.logRepository && this.connection) {
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
  }

  public async handleFailedLogs(entityName: string, response: string) {
    if (!this.logRepository && this.connection) {
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
  }
}

export default Logger;
