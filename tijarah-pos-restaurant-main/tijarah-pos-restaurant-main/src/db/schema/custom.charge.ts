export class Name {
  constructor(public en: string = "", public ar: string = "") {}
}

export class CompanyInfo {
  name: Name;

  constructor(
    data: { name: { en: string; ar: string } } = { name: { en: "", ar: "" } }
  ) {
    this.name = new Name(data.name.en, data.name.ar);
  }
}

export class TaxInfo {
  constructor(public percentage: number = 0) {}
}

export class CustomCharge {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  locationRefs?: string[];
  name: Name;
  image?: string;
  value: number;
  type: string;
  chargeType: string;
  status: string;
  source: "local" | "server";
  taxRef?: string;
  tax?: TaxInfo;
  channel?: string;
  applyAutoChargeOnOrders?: boolean;
  skipIfOrderValueIsAbove?: boolean;
  orderValue?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<CustomCharge> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company);
    this.companyRef = data.companyRef || "";
    this.locationRefs = data.locationRefs || [];
    this.name = new Name(data.name?.en, data.name?.ar);
    this.image = data.image;
    this.value = data.value || 0;
    this.type = data.type || "";
    this.chargeType = data.chargeType || "";
    this.status = data.status || "active";
    this.source = data.source || "server";
    this.taxRef = data.taxRef;
    this.tax = data.tax ? new TaxInfo(data.tax.percentage) : undefined;
    this.channel = data.channel;
    this.applyAutoChargeOnOrders = data.applyAutoChargeOnOrders || false;
    this.skipIfOrderValueIsAbove = data.skipIfOrderValueIsAbove || false;
    this.orderValue = data.orderValue || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): CustomCharge {
    return new CustomCharge({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      locationRefs: JSON.parse(row.locationRefs || "[]"),
      name: JSON.parse(row.name),
      image: row.image,
      value: Number(row.value),
      type: row.type,
      chargeType: row.chargeType,
      status: row.status,
      source: row.source,
      taxRef: row.taxRef,
      tax: row.tax ? JSON.parse(row.tax) : undefined,
      channel: row.channel,
      applyAutoChargeOnOrders: Boolean(row.applyAutoChargeOnOrders),
      skipIfOrderValueIsAbove: Boolean(row.skipIfOrderValueIsAbove),
      orderValue: Number(row.orderValue),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  static toRow(charge: CustomCharge): any {
    return {
      _id: charge._id,
      company: JSON.stringify(charge.company),
      companyRef: charge.companyRef,
      locationRefs: JSON.stringify(charge.locationRefs),
      name: JSON.stringify(charge.name),
      image: charge.image,
      value: charge.value,
      type: charge.type,
      chargeType: charge.chargeType,
      status: charge.status,
      source: charge.source,
      taxRef: charge.taxRef,
      tax: charge.tax ? JSON.stringify(charge.tax) : null,
      channel: charge.channel,
      applyAutoChargeOnOrders: Number(charge.applyAutoChargeOnOrders),
      skipIfOrderValueIsAbove: Number(charge.skipIfOrderValueIsAbove),
      orderValue: charge.orderValue,
      createdAt: charge.createdAt,
      updatedAt: charge.updatedAt,
    };
  }

  shouldApplyCharge(orderValue: number): boolean {
    if (!this.applyAutoChargeOnOrders) return false;
    if (this.skipIfOrderValueIsAbove && orderValue > (this.orderValue || 0))
      return false;
    return true;
  }

  calculateCharge(orderValue: number): number {
    if (this.type === "percentage") {
      return (orderValue * this.value) / 100;
    }
    return this.value;
  }
}
