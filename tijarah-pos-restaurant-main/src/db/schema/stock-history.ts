export class Name {
  constructor(public en: string = "", public ar: string = "") {}
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

export class CategoryInfo {
  constructor(public name: string = "") {}
}

export class ProductInfo {
  constructor(public name: Name = new Name()) {}
}

export class ProductData {
  name: Name;
  type: string;
  qty: number;
  unit: number;
  sku: string;
  costPrice?: number;
  sellingPrice?: number;

  constructor(data: Partial<ProductData> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.type = data.type || "";
    this.qty = data.qty || 0;
    this.unit = data.unit || 0;
    this.sku = data.sku || "";
    this.costPrice = data.costPrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
  }
}

export class StockHistory {
  _id?: string;
  companyRef: string;
  company: CompanyInfo;
  locationRef: string;
  location: LocationInfo;
  vendorRef?: string;
  vendor?: VendorInfo;
  categoryRef?: string;
  category?: CategoryInfo;
  productRef: string;
  product: ProductInfo;
  hasMultipleVariants?: boolean;
  variant: ProductData;
  sku?: string;
  price?: number;
  previousStockCount?: number;
  stockCount?: number;
  stockAction?: string;
  auto?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  source: "local" | "server";

  constructor(data: Partial<StockHistory> = {}) {
    this._id = data._id;
    this.companyRef = data.companyRef || "";
    this.company = new CompanyInfo(data.company?.name);
    this.locationRef = data.locationRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.vendorRef = data.vendorRef;
    this.vendor = data.vendor ? new VendorInfo(data.vendor.name) : undefined;
    this.categoryRef = data.categoryRef;
    this.category = data.category
      ? new CategoryInfo(data.category.name)
      : undefined;
    this.productRef = data.productRef || "";
    this.product = new ProductInfo(data.product?.name);
    this.hasMultipleVariants = data.hasMultipleVariants;
    this.variant = new ProductData(data.variant);
    this.sku = data.sku;
    this.price = data.price;
    this.previousStockCount = data.previousStockCount;
    this.stockCount = data.stockCount;
    this.stockAction = data.stockAction;
    this.auto = data.auto;
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): StockHistory {
    return new StockHistory({
      _id: row._id,
      companyRef: row.companyRef,
      company: JSON.parse(row.company),
      locationRef: row.locationRef,
      location: JSON.parse(row.location),
      vendorRef: row.vendorRef,
      vendor: row.vendor ? JSON.parse(row.vendor) : undefined,
      categoryRef: row.categoryRef,
      category: row.category ? JSON.parse(row.category) : undefined,
      productRef: row.productRef,
      product: JSON.parse(row.product),
      hasMultipleVariants: Boolean(row.hasMultipleVariants),
      variant: JSON.parse(row.variant),
      sku: row.sku,
      price: Number(row.price),
      previousStockCount: Number(row.previousStockCount),
      stockCount: Number(row.stockCount),
      stockAction: row.stockAction,
      auto: Boolean(row.auto),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      source: row.source,
    });
  }

  static toRow(row: StockHistory): any {
    return {
      _id: row._id,
      companyRef: row.companyRef,
      company: JSON.stringify(row.company),
      locationRef: row.locationRef,
      location: JSON.stringify(row.location),
      vendorRef: row.vendorRef,
      vendor: row.vendor ? JSON.stringify(row.vendor) : undefined,
      categoryRef: row.categoryRef,
      category: row.category ? JSON.stringify(row.category) : undefined,
      productRef: row.productRef,
      product: JSON.stringify(row.product),
      hasMultipleVariants: row.hasMultipleVariants,
      variant: JSON.stringify(row.variant),
      sku: row.sku,
      price: row.price,
      previousStockCount: row.previousStockCount,
      stockCount: row.stockCount,
      stockAction: row.stockAction,
      auto: row.auto,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    };
  }
}
