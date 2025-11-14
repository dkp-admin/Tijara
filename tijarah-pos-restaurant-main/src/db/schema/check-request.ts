export type CheckRequestStatus = "success" | "failed" | "pending";

export class CheckRequest {
  _id?: string;
  entityName: string;
  status: CheckRequestStatus;
  lastSync: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<CheckRequest> = {}) {
    this._id = data._id;
    this.entityName = data.entityName || "";
    this.status = data.status || "pending";
    this.lastSync = data.lastSync ? new Date(data.lastSync) : new Date();
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): CheckRequest {
    return new CheckRequest({
      _id: row._id,
      entityName: row.entityName,
      status: row.status as CheckRequestStatus,
      lastSync: new Date(row.lastSync),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
