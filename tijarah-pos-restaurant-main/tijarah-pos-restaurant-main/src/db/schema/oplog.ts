export class OpLog {
  _id?: number;
  requestId?: string;
  data: string;
  tableName: string;
  action: string;
  timestamp: Date;
  status: "pushed" | "pending";
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<OpLog> = {}) {
    this._id = data._id;
    this.requestId = data.requestId;
    this.data = data.data || "";
    this.tableName = data.tableName || "";
    this.action = data.action || "";
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    this.status = data.status || "pending";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): OpLog {
    return new OpLog({
      _id: row._id ? Number(row._id) : undefined,
      requestId: row.requestId,
      data: row.data,
      tableName: row.tableName,
      action: row.action,
      timestamp: new Date(row.timestamp),
      status: row.status as "pushed" | "pending",
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(row: OpLog): any {
    return {
      _id: row._id,
      requestId: row.requestId,
      data: row.data,
      tableName: row.tableName,
      action: row.action,
      timestamp: row.timestamp,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  toJSON() {
    return {
      _id: this._id,
      requestId: this.requestId,
      data: this.data,
      tableName: this.tableName,
      action: this.action,
      timestamp: this.timestamp.toISOString(),
      status: this.status,
    };
  }
}
