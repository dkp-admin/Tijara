export class OrderNumberSequence {
  _id?: number;
  key: string;
  value: number;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  deviceRef?: string;

  constructor(data: Partial<OrderNumberSequence> = {}) {
    this._id = data._id;
    this.key = data.key || "";
    this.value = data.value || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.source = data.source;
    this.deviceRef = data.deviceRef;
  }

  static fromRow(row: any): OrderNumberSequence {
    return new OrderNumberSequence({
      _id: row._id ? row._id : undefined,
      key: row.key,
      value: row.value,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
      deviceRef: row.deviceRef,
    });
  }

  static toRow(row: OrderNumberSequence): any {
    return {
      _id: row._id,
      key: row.key,
      value: row.value,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
      deviceRef: row.deviceRef,
    };
  }

  toJSON() {
    return {
      _id: this._id,
      key: this.key,
      value: this.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      source: this.source,
      deviceRef: this.deviceRef,
    };
  }
}
