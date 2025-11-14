export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class LocationSchema {
  name: Name;
  vat: string;
  address: string;

  constructor(data: Partial<LocationSchema> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.vat = data.vat || "";
    this.address = data.address || "";
  }

  static fromRow(row: any): LocationSchema {
    return new LocationSchema({
      name: JSON.parse(row.name),
      vat: row.vat,
      address: row.address,
    });
  }
}

export class PrintTemplate {
  _id?: string;
  name: string;
  locationRef: string;
  location: LocationSchema;
  footer: string;
  returnPolicy?: string;
  customText?: string;
  printBarcode: boolean;
  showToken: boolean;
  resetCounterDaily: boolean;
  showOrderType: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  source: "local" | "server";

  constructor(data: Partial<PrintTemplate> = {}) {
    this._id = data._id;
    this.name = data.name || "";
    this.locationRef = data.locationRef || "";
    this.location = new LocationSchema(data.location);
    this.footer = data.footer || "";
    this.returnPolicy = data.returnPolicy;
    this.customText = data.customText;
    this.printBarcode = data.printBarcode || false;
    this.showToken = data.showToken || false;
    this.resetCounterDaily = data.resetCounterDaily || false;
    this.showOrderType = data.showOrderType || false;
    this.status = data.status || "active";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.source = data.source || "server";
  }

  static fromRow(row: any): PrintTemplate {
    return new PrintTemplate({
      _id: row._id,
      name: row.name,
      locationRef: row.locationRef,
      location: JSON.parse(row.location),
      footer: row.footer,
      returnPolicy: row.returnPolicy,
      customText: row.customText,
      printBarcode: Boolean(row.printBarcode),
      showToken: Boolean(row.showToken),
      resetCounterDaily: Boolean(row.resetCounterDaily),
      showOrderType: Boolean(row.showOrderType),
      status: row.status,
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(row: PrintTemplate): any {
    return {
      _id: row._id,
      name: row.name,
      locationRef: row.locationRef,
      location: JSON.stringify(row.location),
      footer: row.footer,
      returnPolicy: row.returnPolicy,
      customText: row.customText,
      printBarcode: row.printBarcode,
      showToken: row.showToken,
      resetCounterDaily: row.resetCounterDaily,
      showOrderType: row.showOrderType,
      status: row.status,
      source: row.source,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  isActive(): boolean {
    return this.status === "active";
  }
}
