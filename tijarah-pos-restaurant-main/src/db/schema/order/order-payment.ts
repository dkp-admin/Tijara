import { CategoryInfo, ItemModifiers, Name } from "./order-base";

export class RefundPaymentSchema {
  constructor(public amount: number = 0, public refundTo: string = "") {}
}

export class ItemSchema {
  qty: number;
  unit: string;
  vat: number;
  amount: number;
  discountAmount: number;
  discountPercentage: number;
  nameEn: string;
  nameAr: string;
  category: CategoryInfo;
  id: string;
  categoryRef: string;
  hasMultipleVariants?: boolean;
  sku: string;
  parentSku: string;
  boxSku: string;
  crateSku: string;
  boxRef: string;
  crateRef: string;
  sentToKotAt: string;
  kitchenName: string;
  kotId: string;
  modifiers?: ItemModifiers[];

  constructor(data: Partial<ItemSchema> = {}) {
    this.qty = data.qty || 0;
    this.unit = data.unit || "";
    this.vat = data.vat || 0;
    this.amount = data.amount || 0;
    this.discountAmount = data.discountAmount || 0;
    this.discountPercentage = data.discountPercentage || 0;
    this.nameEn = data.nameEn || "";
    this.nameAr = data.nameAr || "";
    this.category = new CategoryInfo(data.category?.name);
    this.id = data.id || "";
    this.categoryRef = data.categoryRef || "";
    this.hasMultipleVariants = data.hasMultipleVariants;
    this.sku = data.sku || "";
    this.parentSku = data.parentSku || "";
    this.boxSku = data.boxSku || "";
    this.crateSku = data.crateSku || "";
    this.boxRef = data.boxRef || "";
    this.crateRef = data.crateRef || "";
    this.sentToKotAt = data.sentToKotAt || "";
    this.kitchenName = data.kitchenName || "";
    this.kotId = data.kotId || "";
    this.modifiers = data.modifiers?.map((m) => new ItemModifiers(m));
  }
}

export class BillingSchema {
  total: number;
  subTotal: number;
  discount: number;
  discountPercentage: number;
  discountCode: string;
  vat: number;
  vatPercentage: number;
  subTotalWithoutDiscount: number;
  vatWithoutDiscount: number;
  discountedVatAmount: number;
  promotionPercentage: number;
  totalDiscountPromotion: number;
  promotionRefs: string[];

  constructor(data: Partial<BillingSchema> = {}) {
    this.total = data.total || 0;
    this.subTotal = data.subTotal || 0;
    this.discount = data.discount || 0;
    this.discountPercentage = data.discountPercentage || 0;
    this.discountCode = data.discountCode || "";
    this.vat = data.vat || 0;
    this.vatPercentage = data.vatPercentage || 0;
    this.subTotalWithoutDiscount = data.subTotalWithoutDiscount || 0;
    this.vatWithoutDiscount = data.vatWithoutDiscount || 0;
    this.discountedVatAmount = data.discountedVatAmount || 0;
    this.promotionPercentage = data.promotionPercentage || 0;
    this.totalDiscountPromotion = data.totalDiscountPromotion || 0;
    this.promotionRefs = data.promotionRefs || [];
  }
}

export class PaymentBreakup {
  name: string;
  total: number;
  paid: number;
  change: number;
  refId: string;
  providerName: string;
  createdAt?: string;

  constructor(data: Partial<PaymentBreakup> = {}) {
    this.name = data.name || "";
    this.total = data.total || 0;
    this.paid = data.paid || 0;
    this.change = data.change || 0;
    this.refId = data.refId || "";
    this.providerName = data.providerName || "";
    this.createdAt = data.createdAt;
  }
}

export class Charges {
  name: Name;
  total: number;
  vat?: number;
  type: string;
  chargeType: string;
  value: number;
  chargeId: string;

  constructor(data: Partial<Charges> = {}) {
    this.name = new Name(data.name?.en, data.name?.ar);
    this.total = data.total || 0;
    this.vat = data.vat;
    this.type = data.type || "";
    this.chargeType = data.chargeType || "";
    this.value = data.value || 0;
    this.chargeId = data.chargeId || "";
  }
}

export class PaymentSchema extends BillingSchema {
  breakup: PaymentBreakup[];
  charges: Charges[];

  constructor(data: Partial<PaymentSchema> = {}) {
    super(data);
    this.breakup = (data.breakup || []).map((b) => new PaymentBreakup(b));
    this.charges = (data.charges || []).map((c) => new Charges(c));
  }
}
