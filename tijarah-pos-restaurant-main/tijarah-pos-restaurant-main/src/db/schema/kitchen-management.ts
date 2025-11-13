export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class CategoryInfo {
  constructor(public name: string = "") {}
}

export class BrandInfo {
  constructor(public name: string = "") {}
}

export class DeviceInfo {
  constructor(public deviceCode?: string) {}
}

export class ProductData {
  productRef: string;
  name: Name;
  category: CategoryInfo;
  brand: BrandInfo;
  sku: string;
  price: number;

  constructor(data: Partial<ProductData> = {}) {
    this.productRef = data.productRef || "";
    this.name = new Name(data.name?.en, data.name?.ar);
    this.category = new CategoryInfo(data.category?.name);
    this.brand = new BrandInfo(data.brand?.name);
    this.sku = data.sku || "";
    this.price = data.price || 0;
  }
}

export class CategoryData {
  categoryRef: string;
  name: string;

  constructor(data: Partial<CategoryData> = {}) {
    this.categoryRef = data.categoryRef || "";
    this.name = data.name || "";
  }
}

export class KitchenManagement {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
  locationRef: string;
  name: Name;
  description: string;
  allProducts?: boolean;
  allCategories?: boolean;
  productRefs?: string[];
  categoryRefs?: string[];
  products?: ProductData[];
  categories?: CategoryData[];
  printerName?: string;
  printerAssigned?: boolean;
  device?: DeviceInfo;
  deviceRef?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  source: "local" | "server";

  constructor(data: Partial<KitchenManagement> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.name = new Name(data.name?.en, data.name?.ar);
    this.description = data.description || "";
    this.allProducts = data.allProducts || false;
    this.allCategories = data.allCategories || false;
    this.productRefs = data.productRefs || [];
    this.categoryRefs = data.categoryRefs || [];
    this.products = data.products?.map((p) => new ProductData(p)) || [];
    this.categories = data.categories?.map((c) => new CategoryData(c)) || [];
    this.printerName = data.printerName || "";
    this.printerAssigned = data.printerAssigned || false;
    this.device = data.device
      ? new DeviceInfo(data.device.deviceCode)
      : undefined;
    this.deviceRef = data.deviceRef || "";
    this.status = data.status || "active";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.source = data.source || "server";
  }

  static fromRow(row: any): KitchenManagement {
    return new KitchenManagement({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      name: JSON.parse(row.name),
      description: row.description,
      allProducts: Boolean(row.allProducts),
      allCategories: Boolean(row.allCategories),
      productRefs: JSON.parse(row.productRefs || "[]"),
      categoryRefs: JSON.parse(row.categoryRefs || "[]"),
      products: JSON.parse(row.products || "[]"),
      categories: JSON.parse(row.categories || "[]"),
      printerName: row.printerName,
      printerAssigned: Boolean(row.printerAssigned),
      device: row.device ? JSON.parse(row.device) : undefined,
      deviceRef: row.deviceRef,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    });
  }

  static toRow(row: KitchenManagement): any {
    return {
      _id: row._id,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      location: JSON.stringify(row.location),
      locationRef: row.locationRef,
      name: JSON.stringify(row.name),
      description: row.description,
      allProducts: Boolean(row.allProducts),
      allCategories: Boolean(row.allCategories),
      productRefs: JSON.stringify(row.productRefs || "[]"),
      categoryRefs: JSON.stringify(row.categoryRefs || "[]"),
      products: JSON.stringify(row.products || "[]"),
      categories: JSON.stringify(row.categories || "[]"),
      printerName: row.printerName,
      printerAssigned: Boolean(row.printerAssigned),
      device: row.device ? JSON.stringify(row.device) : undefined,
      deviceRef: row.deviceRef,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    };
  }
}
