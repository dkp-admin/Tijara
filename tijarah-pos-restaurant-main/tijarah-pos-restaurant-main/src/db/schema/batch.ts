export class ProductNameSchema {
  constructor(public en: string = "", public ar: string = "") {}
}

export class ProductData {
  name: ProductNameSchema;
  type: string;
  qty: number;
  unit: number;
  sku: string;
  costPrice?: number;
  sellingPrice?: number;

  constructor(data: Partial<ProductData> = {}) {
    this.name = new ProductNameSchema(data.name?.en, data.name?.ar);
    this.type = data.type || "";
    this.qty = data.qty || 0;
    this.unit = data.unit || 0;
    this.sku = data.sku || "";
    this.costPrice = data.costPrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
  }
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class VendorInfo {
  constructor(public name: string = "") {}
}

export class ProductInfo {
  constructor(public name: ProductNameSchema = new ProductNameSchema()) {}
}

export class Batch {
  _id?: string;
  companyRef: string;
  company: CompanyInfo;
  locationRef: string;
  location: LocationInfo;
  vendorRef?: string;
  vendor?: VendorInfo;
  productRef: string;
  product: ProductInfo;
  hasMultipleVariants: boolean;
  variant: ProductData;
  sku?: string;
  received: number;
  transfer: number;
  available: number;
  expiry: Date;
  createdAt?: Date;
  updatedAt?: Date;
  status: string;
  source: "local" | "server";

  constructor(data: Partial<Batch> = {}) {
    this._id = data._id;
    this.companyRef = data.companyRef || "";
    this.company = new CompanyInfo(data.company?.name);
    this.locationRef = data.locationRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.vendorRef = data.vendorRef;
    this.vendor = data.vendor ? new VendorInfo(data.vendor.name) : undefined;
    this.productRef = data.productRef || "";
    this.product = new ProductInfo(data.product?.name);
    this.hasMultipleVariants = data.hasMultipleVariants || false;
    this.variant = new ProductData(data.variant);
    this.sku = data.sku;
    this.received = data.received || 0;
    this.transfer = data.transfer || 0;
    this.available = data.available || 0;
    this.expiry = data.expiry ? new Date(data.expiry) : new Date();
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.status = data.status || "active";
    this.source = data.source || "local";
  }

  static fromRow(row: any): Batch {
    return new Batch({
      _id: row._id,
      companyRef: row.companyRef,
      company: JSON.parse(row.company),
      locationRef: row.locationRef,
      location: JSON.parse(row.location),
      vendorRef: row.vendorRef,
      vendor: row.vendor ? JSON.parse(row.vendor) : undefined,
      productRef: row.productRef,
      product: JSON.parse(row.product),
      hasMultipleVariants: Boolean(row.hasMultipleVariants),
      variant: new ProductData(JSON.parse(row.variant)),
      sku: row.sku,
      received: Number(row.received),
      transfer: Number(row.transfer),
      available: Number(row.available),
      expiry: new Date(row.expiry),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      status: row.status,
      source: row.source,
    });
  }

  static toRow(batch: Batch): any {
    return {
      _id: batch._id,
      companyRef: batch.companyRef,
      company: JSON.stringify(batch.company),
      locationRef: batch.locationRef,
      location: JSON.stringify(batch.location),
      vendorRef: batch.vendorRef,
      vendor: batch.vendor ? JSON.stringify(batch.vendor) : null,
      productRef: batch.productRef,
      product: JSON.stringify(batch.product),
      hasMultipleVariants: Number(batch.hasMultipleVariants),
      variant: JSON.stringify(batch.variant),
      sku: batch.sku,
      received: batch.received,
      transfer: batch.transfer,
      available: batch.available,
      expiry: batch.expiry,
      status: batch.status,
      source: batch.source,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    };
  }
}
