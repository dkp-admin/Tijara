export class PaymentType {
  constructor(public name: string, public status: boolean) {}
}

export class OrderType {
  constructor(public name: string, public status: boolean) {}
}

export class BillingSettings {
  _id?: string;
  quickAmounts: boolean;
  catalogueManagement: boolean;
  paymentTypes: PaymentType[];
  orderTypesList: OrderType[];
  cardPaymentOption: "manual" | "automatic";
  defaultCompleteBtn: string;
  defaultCash: number;
  noOfReceiptPrint: number;
  cashManagement: boolean;
  orderTypes: string;
  terminalId: string;
  source: string;
  keypad: boolean;
  discounts: boolean;
  promotions: boolean;
  customCharges: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<BillingSettings> = {}) {
    this._id = data._id;
    this.quickAmounts = data.quickAmounts ?? false;
    this.catalogueManagement = data.catalogueManagement ?? false;
    this.paymentTypes = data.paymentTypes ?? [];
    this.orderTypesList = data.orderTypesList ?? [];
    this.cardPaymentOption = data.cardPaymentOption ?? "manual";
    this.defaultCompleteBtn = data.defaultCompleteBtn ?? "";
    this.defaultCash = data.defaultCash ?? 0;
    this.noOfReceiptPrint = data.noOfReceiptPrint ?? 0;
    this.cashManagement = data.cashManagement ?? false;
    this.orderTypes = data.orderTypes ?? "";
    this.terminalId = data.terminalId ?? "";
    this.source = data.source ?? "server";
    this.keypad = data.keypad ?? false;
    this.discounts = data.discounts ?? false;
    this.promotions = data.promotions ?? true;
    this.customCharges = data.customCharges ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Optional method to create from raw database row
  static fromRow(row: any): BillingSettings {
    return new BillingSettings({
      _id: row._id,
      quickAmounts: Boolean(row.quickAmounts),
      catalogueManagement: Boolean(row.catalogueManagement),
      paymentTypes: JSON.parse(row.paymentTypes),
      orderTypesList: JSON.parse(row.orderTypesList),
      cardPaymentOption: row.cardPaymentOption,
      defaultCompleteBtn: row.defaultCompleteBtn,
      defaultCash: row.defaultCash,
      noOfReceiptPrint: row.noOfReceiptPrint,
      cashManagement: Boolean(row.cashManagement),
      orderTypes: row.orderTypes,
      terminalId: row.terminalId,
      keypad: Boolean(row.keypad),
      discounts: Boolean(row.discounts),
      promotions: Boolean(row.promotions),
      customCharges: Boolean(row.customCharges),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      source: row.source || "server",
    });
  }

  static toRow(settings: BillingSettings): any {
    return {
      _id: settings._id,
      quickAmounts: Number(settings.quickAmounts),
      catalogueManagement: Number(settings.catalogueManagement),
      paymentTypes: JSON.stringify(settings.paymentTypes),
      orderTypesList: JSON.stringify(settings.orderTypesList),
      cardPaymentOption: settings.cardPaymentOption,
      defaultCompleteBtn: settings.defaultCompleteBtn,
      defaultCash: settings.defaultCash,
      noOfReceiptPrint: settings.noOfReceiptPrint,
      cashManagement: Number(settings.cashManagement),
      orderTypes: settings.orderTypes,
      terminalId: settings.terminalId,
      keypad: Number(settings.keypad),
      discounts: Number(settings.discounts),
      promotions: Number(settings.promotions),
      customCharges: Number(settings.customCharges),
      source: settings.source || "server",
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
