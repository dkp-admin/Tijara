import { Product } from "./product/product";

export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class CategoryMenu {
  categoryRef: string;
  image: string;
  name: Name;
  sortOrder: number;

  constructor(data: Partial<CategoryMenu> = {}) {
    this.categoryRef = data.categoryRef || "";
    this.image = data.image || "";
    this.name = new Name(data.name?.en, data.name?.ar);
    this.sortOrder = data.sortOrder || 0;
  }
}

export class Menu {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
  locationRef: string;
  categories: CategoryMenu[];
  products: Product[];
  orderType: string;
  createdAt: string;
  updatedAt: string;
  source: "local" | "server";

  constructor(data: Partial<Menu> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.categories = (data.categories || []).map((c) => new CategoryMenu(c));
    this.products = (data.products || []).map((p) => new Product(p));
    this.orderType = data.orderType || "";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.source = data.source || "server";
  }

  static fromRow(row: any): Menu {
    return new Menu({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      categories: JSON.parse(row.categories || "[]"),
      products: JSON.parse(row.products || "[]"),
      orderType: row.orderType,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    });
  }

  static toRow(row: Menu): any {
    return {
      _id: row._id,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      location: JSON.stringify(row.location),
      locationRef: row.locationRef,
      categories: JSON.stringify(row.categories || "[]"),
      products: JSON.stringify(row.products || "[]"),
      orderType: row.orderType,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      source: row.source,
    };
  }

  getCategory(categoryRef: string): CategoryMenu | undefined {
    return this.categories.find((cat) => cat.categoryRef === categoryRef);
  }

  getProductsByCategory(categoryRef: string): Product[] {
    // This is a placeholder implementation
    // Adjust according to your actual product-category relationship
    return this.products.filter(
      (product) => (product as any).categoryRef === categoryRef
    );
  }

  getCategoriesSorted(): CategoryMenu[] {
    return [...this.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
