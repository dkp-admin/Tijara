import { Name, PricesSchema, StocksSchema } from "./base";

export class VariantModal {
  parentSku?: string;
  skuToUpdate?: string;
  parentName?: Name;
  type: "item" | "box";
  assignedToAll: boolean;
  name: Name;
  image?: string;
  localImage?: string;
  sku: string;
  code?: string;
  unit: string;
  noOfUnits: number;
  costPrice: string;
  sellingPrice: string;
  originalPrice: string;
  nonSaleable: boolean;
  locationRefs: string[];
  locations: any[];
  prices: PricesSchema[];
  otherPrices?: PricesSchema[];
  stocks: StocksSchema[];
  otherStocks?: StocksSchema[];
  status: string;

  constructor(data: Partial<VariantModal> = {}) {
    this.parentSku = data.parentSku;
    this.skuToUpdate = data.skuToUpdate;
    this.parentName = data.parentName
      ? new Name(data.parentName.en, data.parentName.ar)
      : undefined;
    this.type = data.type || "item";
    this.assignedToAll = data.assignedToAll || false;
    this.name = new Name(data.name?.en, data.name?.ar);
    this.image = data.image;
    this.localImage = data.localImage;
    this.sku = data.sku || "";
    this.code = data.code;
    this.unit = data.unit || "";
    this.noOfUnits = data.noOfUnits || 0;
    this.costPrice = data.costPrice || "0";
    this.sellingPrice = data.sellingPrice || "0";
    this.originalPrice = data.originalPrice || "0";
    this.nonSaleable = data.nonSaleable || false;
    this.locationRefs = data.locationRefs || [];
    this.locations = data.locations || [];
    this.prices = (data.prices || []).map((p) => new PricesSchema(p));
    this.otherPrices = data.otherPrices?.map((p) => new PricesSchema(p));
    this.stocks = (data.stocks || []).map((s) => new StocksSchema(s));
    this.otherStocks = data.otherStocks?.map((s) => new StocksSchema(s));
    this.status = data.status || "active";
  }
}

export class BoxModal {
  id: string;
  parentSku: string;
  parentName?: Name;
  type: "item" | "box";
  assignedToAll: boolean;
  name?: Name;
  image?: string;
  localImage?: string;
  sku: string;
  code?: string;
  unit: string;
  noOfUnits: number;
  costPrice: string;
  sellingPrice: string;
  nonSaleable: boolean;
  locationRefs: string[];
  locations: any[];
  prices: PricesSchema[];
  otherPrices?: PricesSchema[];
  stocks?: StocksSchema[];
  otherStocks?: StocksSchema[];
  status: string;

  constructor(data: Partial<BoxModal> = {}) {
    this.id = data.id || "";
    this.parentSku = data.parentSku || "";
    this.parentName = data.parentName
      ? new Name(data.parentName.en, data.parentName.ar)
      : undefined;
    this.type = data.type || "box";
    this.assignedToAll = data.assignedToAll || false;
    this.name = data.name ? new Name(data.name.en, data.name.ar) : undefined;
    this.image = data.image;
    this.localImage = data.localImage;
    this.sku = data.sku || "";
    this.code = data.code;
    this.unit = data.unit || "";
    this.noOfUnits = data.noOfUnits || 0;
    this.costPrice = data.costPrice || "0";
    this.sellingPrice = data.sellingPrice || "0";
    this.nonSaleable = data.nonSaleable || false;
    this.locationRefs = data.locationRefs || [];
    this.locations = data.locations || [];
    this.prices = (data.prices || []).map((p) => new PricesSchema(p));
    this.otherPrices = data.otherPrices?.map((p) => new PricesSchema(p));
    this.stocks = data.stocks?.map((s) => new StocksSchema(s));
    this.otherStocks = data.otherStocks?.map((s) => new StocksSchema(s));
    this.status = data.status || "active";
  }
}
