export class ModifierValues {
  _id?: string;
  name: string;
  kitchenName: string;
  price: number;
  taxRef: string;
  tax?: { percentage: number };
  contains: string;
  included: boolean;
  status: string;

  constructor(data: Partial<ModifierValues> = {}) {
    this._id = data._id;
    this.name = data.name || "";
    this.kitchenName = data.kitchenName || "";
    this.price = data.price || 0;
    this.taxRef = data.taxRef || "";
    this.tax = data.tax;
    this.contains = data.contains || "";
    this.included = data.included || false;
    this.status = data.status || "active";
  }
}

export class ProductModifier {
  modifierRef: string;
  name: string;
  kitchenName: string;
  noOfFreeModifier: number;
  default: string;
  excluded: string[];
  min: number;
  max: number;
  values: ModifierValues[];
  status: string;

  constructor(data: Partial<ProductModifier> = {}) {
    this.modifierRef = data.modifierRef || "";
    this.name = data.name || "";
    this.kitchenName = data.kitchenName || "";
    this.noOfFreeModifier = data.noOfFreeModifier || 0;
    this.default = data.default || "";
    this.excluded = data.excluded || [];
    this.min = data.min || 0;
    this.max = data.max || 1;
    this.values = (data.values || []).map((v) => new ModifierValues(v));
    this.status = data.status || "active";
  }
}

export class NutritionalInformation {
  calorieCount: string;
  preference: string[];
  contains: string[];

  constructor(data: Partial<NutritionalInformation> = {}) {
    this.calorieCount = data.calorieCount || "";
    this.preference = data.preference || [];
    this.contains = data.contains || [];
  }
}
