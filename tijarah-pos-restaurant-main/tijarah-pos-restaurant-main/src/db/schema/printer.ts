export class KitchenInfo {
  constructor(public name?: string) {}
}

export class Printer {
  _id?: string;
  name: string;
  device_name: string;
  device_id: string;
  product_id: string;
  vendor_id: string;
  printerType: string;
  printerSize: string;
  ip: string;
  port: number;
  enableReceipts: boolean;
  enableKOT: boolean;
  numberOfKots: number;
  enableBarcodes: boolean;
  printerWidthMM: string;
  charsPerLine: string;
  kitchen?: KitchenInfo;
  kitchenRef?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Printer> = {}) {
    this._id = data._id;
    this.name = data.name || "";
    this.device_name = data.device_name || "";
    this.device_id = data.device_id || "";
    this.product_id = data.product_id || "";
    this.vendor_id = data.vendor_id || "";
    this.printerType = data.printerType || "usb";
    this.printerSize = data.printerSize || "3-inch";
    this.numberOfKots = data.numberOfKots || 1;
    this.ip = data.ip || "";
    this.port = data.port || 0;
    this.enableReceipts = data.enableReceipts || false;
    this.enableKOT = data.enableKOT || false;
    this.enableBarcodes = data.enableBarcodes || false;
    this.printerWidthMM = data.printerWidthMM || "72";
    this.charsPerLine = data.charsPerLine || "44";
    this.kitchen = data.kitchen
      ? new KitchenInfo(data.kitchen.name)
      : undefined;
    this.kitchenRef = data.kitchenRef;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): Printer {
    return new Printer({
      _id: row._id,
      name: row.name,
      device_name: row.device_name,
      device_id: row.device_id,
      product_id: row.product_id,
      vendor_id: row.vendor_id,
      printerType: row.printerType,
      printerSize: row.printerSize,
      ip: row.ip,
      port: Number(row.port),
      enableReceipts: Boolean(row.enableReceipts),
      enableKOT: Boolean(row.enableKOT),
      numberOfKots: row.numberOfKots || 1,
      enableBarcodes: Boolean(row.enableBarcodes),
      printerWidthMM: row.printerWidthMM,
      charsPerLine: row.charsPerLine,
      kitchen: row.kitchen ? JSON.parse(row.kitchen) : undefined,
      kitchenRef: row.kitchenRef,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(row: Printer): any {
    return {
      _id: row._id,
      name: row.name,
      device_name: row.device_name,
      device_id: row.device_id,
      product_id: row.product_id,
      vendor_id: row.vendor_id,
      printerType: row.printerType,
      printerSize: row.printerSize,
      ip: row.ip,
      port: row.port,
      enableReceipts: row.enableReceipts,
      enableKOT: row.enableKOT,
      numberOfKots: row.numberOfKots || 1,
      enableBarcodes: row.enableBarcodes,
      printerWidthMM: row.printerWidthMM,
      charsPerLine: row.charsPerLine,
      kitchen: row.kitchen ? JSON.stringify(row.kitchen) : undefined,
      kitchenRef: row.kitchenRef,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
