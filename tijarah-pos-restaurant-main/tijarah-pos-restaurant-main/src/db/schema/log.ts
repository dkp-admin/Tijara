export class Logs {
  id?: number;
  entityName?: string;
  eventName: string;
  response: string;
  eventType: string;
  triggeredBy: string;
  success: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Logs> = {}) {
    this.id = data.id;
    this.entityName = data.entityName;
    this.eventName = data.eventName || "";
    this.response = data.response || "";
    this.eventType = data.eventType || "";
    this.triggeredBy = data.triggeredBy || "";
    this.success = data.success || false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): Logs {
    return new Logs({
      id: Number(row.id),
      entityName: row.entityName,
      eventName: row.eventName,
      response: row.response,
      eventType: row.eventType,
      triggeredBy: row.triggeredBy,
      success: Boolean(row.success),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(row: Logs): any {
    return {
      id: row.id,
      entityName: row.entityName,
      eventName: row.eventName,
      response: row.response,
      eventType: row.eventType,
      triggeredBy: row.triggeredBy,
      success: row.success,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
