export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  constructor(public name: string = "") {}
}

export class CategoryInfo {
  constructor(public name: string = "") {}
}

export class BrandInfo {
  constructor(public name: string = "") {}
}

export class TaxInfo {
  constructor(public percentage: string = "") {}
}

export class NameSchema {
  constructor(public name: string = "") {}
}

export class LocationInfo {
  constructor(public name: string = "") {}
}

export class PricesSchema {
  costPrice: string;
  price: string;
  locationRef: string;
  location: LocationInfo;

  constructor(data: Partial<PricesSchema> = {}) {
    this.costPrice = data.costPrice || "0";
    this.price = data.price || "0";
    this.locationRef = data.locationRef || "";
    this.location = new LocationInfo(data.location?.name);
  }
}

export class StocksSchema {
  enabledAvailability: boolean;
  enabledTracking: boolean;
  stockCount: number;
  enabledLowStockAlert: boolean;
  lowStockCount: number;
  locationRef: string;
  location: LocationInfo;

  constructor(data: Partial<StocksSchema> = {}) {
    this.enabledAvailability = data.enabledAvailability ?? true;
    this.enabledTracking = data.enabledTracking ?? false;
    this.stockCount = data.stockCount || 0;
    this.enabledLowStockAlert = data.enabledLowStockAlert ?? false;
    this.lowStockCount = data.lowStockCount || 0;
    this.locationRef = data.locationRef || "";
    this.location = new LocationInfo(data.location?.name);
  }
}
