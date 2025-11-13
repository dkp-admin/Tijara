// Types and interfaces
export type Source = "local" | "server";
export type Status = "active" | "inactive";

export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class Company {
  constructor(public name: string = "") {}
}

export class Category {
  constructor(public name: string = "") {}
}

export class Brand {
  constructor(public name: string = "") {}
}

export class Tax {
  constructor(public percentage: number = 0) {}
}

export class Variant {
  constructor(public en: string = "", public ar: string = "") {}
}

export class Product {
  name: Name;
  category: Category;
  categoryRef: string;
  brand: Brand;
  brandRef: string;
  price: number;
  sku: string;
  productRef: string;
  code: string;
  tax: Tax;
  taxRef: string;
  variant: Variant;

  constructor(data: Partial<Product> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.category = new Category(data.category?.name);
    this.categoryRef = data.categoryRef || "";
    this.brand = new Brand(data.brand?.name);
    this.brandRef = data.brandRef || "";
    this.price = data.price || 0;
    this.sku = data.sku || "";
    this.productRef = data.productRef || "";
    this.code = data.code || "";
    this.tax = new Tax(data.tax?.percentage);
    this.taxRef = data.taxRef || "";
    this.variant = new Variant(data.variant?.en, data.variant?.ar);
  }
}

export class Box {
  name: Name;
  code: string;
  sku: string;
  price: number;
  boxRef: string;

  constructor(data: Partial<Box> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.code = data.code || "";
    this.sku = data.sku || "";
    this.price = data.price || 0;
    this.boxRef = data.boxRef || "";
  }
}

export class Location {
  name: string;
  locationRef: string;

  constructor(data: Partial<Location> = {}) {
    this.name = data.name || "";
    this.locationRef = data.locationRef || "";
  }
}

export class PricesSchema {
  costPrice: number;
  price: number;
  locationRef: string;
  location: { name: string };

  constructor(data: Partial<PricesSchema> = {}) {
    this.costPrice = data.costPrice || 0;
    this.price = data.price || 0;
    this.locationRef = data.locationRef || "";
    this.location = { name: data.location?.name || "" };
  }
}

export class StocksSchema {
  enabledAvailability: boolean;
  enabledTracking: boolean;
  stockCount: number;
  enabledLowStockAlert: boolean;
  lowStockCount: number;
  locationRef: string;
  location: { name: string };

  constructor(data: Partial<StocksSchema> = {}) {
    this.enabledAvailability = data.enabledAvailability ?? true;
    this.enabledTracking = data.enabledTracking ?? false;
    this.stockCount = data.stockCount || 0;
    this.enabledLowStockAlert = data.enabledLowStockAlert ?? false;
    this.lowStockCount = data.lowStockCount || 0;
    this.locationRef = data.locationRef || "";
    this.location = { name: data.location?.name || "" };
  }
}

export class BoxCrates {
  _id?: string;
  name: Name;
  company: Company;
  companyRef: string;
  type: string;
  qty: number;
  code: string;
  costPrice: number;
  price: number;
  box?: Box;
  boxName?: Name;
  boxRef?: string;
  boxSku: string;
  crateSku: string;
  productSku: string;
  description?: string;
  nonSaleable?: boolean;
  product: Product;
  locationRefs?: string[];
  locations: Location[];
  prices: PricesSchema[];
  otherPrices: PricesSchema[];
  stocks?: StocksSchema[];
  otherStocks?: StocksSchema[];
  status: Status;
  source: Source;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<BoxCrates> = {}) {
    this._id = data._id;
    this.name = new Name(data.name?.en, data.name?.ar);
    this.company = new Company(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.type = data.type || "";
    this.qty = data.qty || 0;
    this.code = data.code || "";
    this.costPrice = data.costPrice || 0;
    this.price = data.price || 0;
    this.box = data.box ? new Box(data.box) : undefined;
    this.boxName = data.boxName
      ? new Name(data.boxName.en, data.boxName.ar)
      : undefined;
    this.boxRef = data.boxRef;
    this.boxSku = data.boxSku || "";
    this.crateSku = data.crateSku || "";
    this.productSku = data.productSku || "";
    this.description = data.description;
    this.nonSaleable = data.nonSaleable;
    this.product = new Product(data.product);
    this.locationRefs = data.locationRefs || [];
    this.locations = (data.locations || []).map((loc) => new Location(loc));
    this.prices = (data.prices || []).map((price) => new PricesSchema(price));
    this.otherPrices = (data.otherPrices || []).map(
      (price) => new PricesSchema(price)
    );
    this.stocks = data.stocks?.map((stock) => new StocksSchema(stock));
    this.otherStocks = data.otherStocks?.map(
      (stock) => new StocksSchema(stock)
    );
    this.status = data.status || "active";
    this.source = data.source || "server";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): BoxCrates {
    return new BoxCrates({
      _id: row._id,
      name: JSON.parse(row.name),
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      type: row.type,
      qty: row.qty,
      code: row.code,
      costPrice: Number(row.costPrice),
      price: Number(row.price),
      box: row.box ? JSON.parse(row.box) : undefined,
      boxName: row.boxName ? JSON.parse(row.boxName) : undefined,
      boxRef: row.boxRef,
      boxSku: row.boxSku,
      crateSku: row.crateSku,
      productSku: row.productSku,
      description: row.description,
      nonSaleable: row.nonSaleable,
      product: JSON.parse(row.product),
      locationRefs: row.locationRefs,
      locations: JSON.parse(row.locations),
      prices: JSON.parse(row.prices),
      otherPrices: JSON.parse(row.otherPrices),
      stocks: row.stocks ? JSON.parse(row.stocks) : undefined,
      otherStocks: row.otherStocks ? JSON.parse(row.otherStocks) : undefined,
      status: row.status,
      source: row.source,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(boxCrate: BoxCrates): any {
    return {
      _id: boxCrate._id,
      name: JSON.stringify(boxCrate.name),
      company: JSON.stringify(boxCrate.company),
      companyRef: boxCrate.companyRef,
      type: boxCrate.type,
      qty: boxCrate.qty,
      code: boxCrate.code,
      costPrice: boxCrate.costPrice,
      price: boxCrate.price,
      box: boxCrate.box ? JSON.stringify(boxCrate.box) : null,
      boxName: boxCrate.boxName ? JSON.stringify(boxCrate.boxName) : null,
      boxRef: boxCrate.boxRef,
      boxSku: boxCrate.boxSku,
      crateSku: boxCrate.crateSku,
      productSku: boxCrate.productSku,
      description: boxCrate.description,
      nonSaleable: boxCrate.nonSaleable,
      product: JSON.stringify(boxCrate.product),
      locationRefs: boxCrate.locationRefs,
      locations: JSON.stringify(boxCrate.locations),
      prices: JSON.stringify(boxCrate.prices),
      otherPrices: JSON.stringify(boxCrate.otherPrices),
      stocks: boxCrate.stocks ? JSON.stringify(boxCrate.stocks) : null,
      otherStocks: boxCrate.otherStocks
        ? JSON.stringify(boxCrate.otherStocks)
        : null,
      status: boxCrate.status,
      source: boxCrate.source,
      createdAt: boxCrate.createdAt,
      updatedAt: boxCrate.updatedAt,
    };
  }
}
