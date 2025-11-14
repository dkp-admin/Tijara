export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class ProductInfo {
  name: Name;
  image?: string;

  constructor(data: Partial<ProductInfo> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.image = data.image;
  }
}

export class QuickItem {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
  locationRef: string;
  menuRef?: string;
  menu: string;
  product: ProductInfo;
  productRef: string;
  type: string;
  source: "local" | "server";
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<QuickItem> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.menuRef = data.menuRef || "";
    this.menu = data.menu || "";
    this.product = new ProductInfo(data.product);
    this.productRef = data.productRef || "";
    this.type = data.type || "product";
    this.source = data.source || "local";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): QuickItem {
    return new QuickItem({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      menuRef: row.menuRef,
      menu: row.menu,
      product: JSON.parse(row.product),
      productRef: row.productRef,
      type: row.type,
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(row: QuickItem): any {
    return {
      _id: row._id,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      location: JSON.stringify(row.location),
      locationRef: row.locationRef,
      menuRef: row.menuRef,
      menu: row.menu,
      product: JSON.stringify(row.product),
      productRef: row.productRef,
      type: row.type,
      source: row.source,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
