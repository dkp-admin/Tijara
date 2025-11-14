import { AxiomConfig } from "../../config";

let globalAxiomLogger: AxiomLogger | null = null;
let globalMetadata: object = {};

class AxiomLogger {
  private readonly axiomToken: string;
  private readonly dataset: string;
  private batchedLogs: any[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_INTERVAL = 5000;

  constructor() {
    this.axiomToken = AxiomConfig.token;
    this.dataset = AxiomConfig.dataset;
  }

  private async sendLogs(logs: any[]): Promise<void> {
    try {
      const response = await fetch(
        `https://api.axiom.co/v1/datasets/${this.dataset}/ingest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.axiomToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(logs),
        }
      );
      if (!response.ok) {
        console.error("Failed to send logs to Axiom:", await response.text());
      }
    } catch (error) {
      console.error("Error sending logs to Axiom:", error);
    }
  }

  private scheduleBatch(): void {
    try {
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.flush().catch((error) => {
            console.error("Error in scheduled flush:", error);
          });
        }, this.BATCH_INTERVAL);
      }
    } catch (error) {
      console.error("Error in scheduleBatch:", error);
    }
  }

  private async flush(): Promise<void> {
    try {
      if (this.batchedLogs.length > 0) {
        const logsToSend = [...this.batchedLogs];
        this.batchedLogs = [];
        await this.sendLogs(logsToSend);
      }
    } catch (error) {
      console.error("Error in flush:", error);
    } finally {
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;
      }
    }
  }

  private async log(
    message: string,
    level: string = "info",
    payload?: any
  ): Promise<void> {
    try {
      const logEntry = {
        _time: new Date().toISOString(),
        level,
        message,
        metadata: { ...globalMetadata },
        data: { ...(payload ? { data: payload } : {}) },
      };

      this.batchedLogs.push(logEntry);

      if (this.batchedLogs.length >= this.BATCH_SIZE) {
        await this.flush();
      } else {
        this.scheduleBatch();
      }
    } catch (error) {
      console.error("Error in log:", error);
    }
  }

  async debug(message: string, payload?: any): Promise<void> {
    try {
      await this.log(message, "debug", payload);
    } catch (error) {
      console.error("Error in debug:", error);
    }
  }

  async info(message: string, payload?: any): Promise<void> {
    try {
      await this.log(message, "info", payload);
    } catch (error) {
      console.error("Error in info:", error);
    }
  }

  async warn(message: string, payload?: any): Promise<void> {
    try {
      await this.log(message, "warn", payload);
    } catch (error) {
      console.error("Error in warn:", error);
    }
  }

  async error(message: string, payload?: any): Promise<void> {
    try {
      await this.log(message, "error", payload);
    } catch (error) {
      console.error("Error in error:", error);
    }
  }
}

export function setupLogger(metadata: object = {}): void {
  try {
    globalAxiomLogger = new AxiomLogger();
    globalMetadata = metadata;
  } catch (error) {
    console.error("Error in setupLogger:", error);
  }
}

export function updateMetadata(newMetadata: object): void {
  try {
    globalMetadata = { ...globalMetadata, ...newMetadata };
  } catch (error) {
    console.error("Error in updateMetadata:", error);
  }
}

export async function logDebug(message: string, payload?: any): Promise<void> {
  try {
    if (!globalAxiomLogger) {
      return;
    }
    await globalAxiomLogger.debug(message, payload);
  } catch (error) {
    console.error("Error in logDebug:", error);
  }
}

export async function logInfo(message: string, payload?: any): Promise<void> {
  try {
    if (!globalAxiomLogger) {
      return;
    }
    await globalAxiomLogger.info(message, payload);
  } catch (error) {
    console.error("Error in logInfo:", error);
  }
}

export async function logWarn(message: string, payload?: any): Promise<void> {
  try {
    if (!globalAxiomLogger) {
      return;
    }
    await globalAxiomLogger.warn(message, payload);
  } catch (error) {
    console.error("Error in logWarn:", error);
  }
}

export async function logError(message: string, payload?: any): Promise<void> {
  try {
    if (!globalAxiomLogger) {
      return;
    }
    await globalAxiomLogger.error(message, payload);
  } catch (error) {
    console.error("Error in logError:", error);
  }
}

export async function sendDirectLog(
  message: string,
  level: string = "info",
  payload?: any
): Promise<void> {
  try {
    const logEntry = [
      {
        _time: new Date().toISOString(),
        level,
        message,
        ...(payload ? { data: payload } : {}),
      },
    ];

    const response = await fetch(
      `https://api.axiom.co/v1/datasets/${AxiomConfig.dataset}/ingest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AxiomConfig.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      }
    );

    if (!response.ok) {
      console.error(
        "Failed to send direct log to Axiom:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error in sendDirectLog:", error);
  }
}
