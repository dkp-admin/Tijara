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

export class CustomerInfo {
  constructor(
    public name: string = "",
    public vat: string = "",
    public phone?: string
  ) {}
}

export class CashierInfo {
  constructor(public name?: string) {}
}

export class DeviceInfo {
  constructor(public deviceCode?: string) {}
}

export class PromotionsData {
  constructor(
    public name: string = "",
    public discount: number = 0,
    public id: string = ""
  ) {}
}

export class ItemModifiers {
  modifierRef: string;
  name: string;
  optionId: string;
  optionName: string;
  contains: string;
  discount: number;
  discountPercentage: number;
  vatAmount: number;
  vatPercentage: number;
  subTotal: number;
  total: number;

  constructor(data: Partial<ItemModifiers> = {}) {
    this.modifierRef = data.modifierRef || "";
    this.name = data.name || "";
    this.optionId = data.optionId || "";
    this.optionName = data.optionName || "";
    this.contains = data.contains || "";
    this.discount = data.discount || 0;
    this.discountPercentage = data.discountPercentage || 0;
    this.vatAmount = data.vatAmount || 0;
    this.vatPercentage = data.vatPercentage || 0;
    this.subTotal = data.subTotal || 0;
    this.total = data.total || 0;
  }
}
