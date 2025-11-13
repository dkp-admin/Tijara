import { Column, Entity } from "typeorm";
import { BsonObjectIdTransformer } from "../../utils/bsonObjectIdTransformer";

@Entity()
export class OrderItem {
  @Column()
  isOpenPrice?: boolean;

  @Column()
  image: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  contains?: string;

  @Column("simple-json")
  category: { name: string };

  @Column("simple-json")
  promotionsData: { name: string; discount: number; id: string };

  @Column()
  productRef?: string;

  @Column()
  categoryRef?: string;

  @Column()
  variantNameEn: string;

  @Column()
  variantNameAr: string;

  @Column()
  type: string;

  @Column()
  sku: string;

  @Column()
  parentSku: string;

  @Column()
  boxSku: string;

  @Column()
  crateSku: string;

  @Column()
  boxRef: string;

  @Column()
  crateRef: string;

  @Column()
  isFree: boolean;

  @Column()
  isQtyFree: boolean;

  @Column()
  discountedTotal: number;

  @Column()
  discountedVat: string;

  @Column()
  costPrice: number;

  @Column()
  sellingPrice: number;

  @Column()
  total: number;

  @Column()
  amountBeforeVoidComp: number;

  @Column()
  qty: number;

  @Column()
  hasMultipleVariants?: boolean;

  @Column()
  discount: number;

  @Column()
  discountPercentage: number;

  @Column()
  promotionPercentage: number;

  @Column()
  vat: number;

  @Column()
  vatPercentage: number;

  @Column()
  unit: string;

  @Column()
  note: string;

  @Column()
  refundedQty: number;

  @Column()
  noOfUnits: number;

  @Column()
  availability: boolean;

  @Column()
  stockCount: number;

  @Column()
  tracking: boolean;

  @Column()
  void: boolean;

  @Column()
  voidRef: string;

  @Column("simple-json")
  voidReason: { en: string; ar: string };

  @Column()
  comp: boolean;

  @Column()
  compRef: string;

  @Column("simple-json")
  compReason: { en: string; ar: string };

  @Column()
  kitchenName: string;

  @Column()
  kotId: string;

  @Column()
  sentToKotAt: string;

  @Column()
  modifiers?: ItemModifiers[];
}

@Entity()
class ItemModifiers {
  @Column()
  modifierRef: string;

  @Column()
  name: string;

  @Column()
  optionId: string;

  @Column()
  optionName: string;

  @Column()
  contains: string;

  @Column()
  discount: number;

  @Column()
  discountPercentage: number;

  @Column()
  vatAmount: number;

  @Column()
  vatPercentage: number;

  @Column()
  subTotal: number;

  @Column()
  total: number;
}

@Entity()
class RefundPaymentSchema {
  @Column()
  amount: number;

  @Column()
  refundTo: string;
}

@Entity()
class ItemSchema {
  @Column()
  qty: number;

  @Column()
  unit: string;

  @Column()
  vat: number;

  @Column()
  amount: number;

  @Column()
  discountAmount: number;

  @Column()
  discountPercentage: number;

  @Column()
  nameEn: string;

  @Column()
  nameAr: string;

  @Column("simple-json")
  category: { name: string };

  @Column()
  _id: string;

  @Column()
  categoryRef: string;

  @Column()
  hasMultipleVariants?: boolean;

  @Column()
  sku: string;

  @Column()
  parentSku: string;

  @Column()
  boxSku: string;

  @Column()
  crateSku: string;

  @Column()
  boxRef: string;

  @Column()
  crateRef: string;

  @Column("date")
  sentToKotAt: string;

  @Column()
  kitchenName: string;

  @Column()
  kotId: string;

  @Column()
  modifiers?: ItemModifiers[];
}

@Entity()
class BillingSchema {
  @Column()
  total: number;

  @Column()
  subTotal: number;

  @Column()
  discount: number;

  @Column()
  discountPercentage: number;

  @Column()
  discountCode: string;

  @Column()
  vat: number;

  @Column()
  vatPercentage: number;

  @Column()
  subTotalWithoutDiscount: number;

  @Column()
  vatWithoutDiscount: number;

  @Column()
  discountedVatAmount: number;

  @Column()
  promotionPercentage: number;

  @Column()
  totalDiscountPromotion: number;

  @Column("simple-array", { array: true, default: () => [] })
  promotionRefs: string[];
}

@Entity()
class PaymentBreakup {
  @Column()
  name: string;

  @Column()
  total: number;

  @Column()
  paid: number;

  @Column({ type: "number", default: 0 })
  change: number;

  @Column()
  refId: string;

  @Column()
  providerName: string;

  @Column("date")
  createdAt?: string;
}

@Entity()
class RefundCharges {
  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  chargeId: string;

  @Column()
  totalCharge: number;

  @Column()
  totalVatOnCharge: number;
}

@Entity()
class RefundSchema {
  @Column()
  reason: string;

  @Column()
  amount: number;

  @Column()
  referenceNumber: string;

  @Column()
  vat: number;

  @Column()
  discountAmount: number;

  @Column()
  discountPercentage: number;

  @Column()
  vatWithoutDiscount: number;

  @Column()
  hasMultipleVariants?: boolean;

  @Column("simple-json", { array: true })
  charges: RefundCharges[];

  @Column("simple-json", { array: true })
  items: ItemSchema[];

  @Column("simple-json", { array: true })
  refundedTo: RefundPaymentSchema[];

  @Column("simple-json")
  cashier?: {
    name: string;
  };

  @Column()
  cashierRef?: string;

  @Column("datetime")
  date?: string;

  @Column("simple-json")
  device: {
    deviceCode: string;
  };

  @Column()
  deviceRef: string;
}

@Entity()
class Charges {
  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  total: number;

  @Column()
  vat?: number;

  @Column()
  type: string;

  @Column()
  chargeType: string;

  @Column()
  value: number;

  @Column()
  chargeId: string;
}

@Entity()
class PaymentSchema extends BillingSchema {
  @Column("simple-json", { array: true, default: [] })
  breakup: PaymentBreakup[];

  @Column("simple-json", { array: true })
  charges: Charges[];
}

@Entity()
class DineinData {
  @Column()
  noOfGuests: number;

  @Column()
  tableRef: string;

  @Column()
  table: string;

  @Column()
  sectionRef: string;
}

@Entity("orders")
export class OrderModel {
  @Column({
    primary: true, // Marks column as primary
    transformer: new BsonObjectIdTransformer(),
    /* Other options... */
  })
  _id?: string;

  @Column("simple-json")
  company: {
    name: string;
  };

  @Column()
  companyRef: string;

  @Column("simple-json")
  location: {
    name: string;
  };

  @Column()
  locationRef: string;

  @Column("simple-json")
  customer?: {
    name: string;
    vat: string;
    phone?: string;
  };

  @Column()
  customerRef?: string;

  @Column("simple-json", { nullable: true })
  cashier?: {
    name?: string;
  };

  @Column({ nullable: true, default: "" })
  cashierRef?: string;

  @Column("simple-json", { nullable: true })
  device?: {
    deviceCode?: string;
  };

  @Column({ nullable: true, default: "" })
  deviceRef?: string;

  @Column()
  orderNum: string;

  @Column({ nullable: true, default: "" })
  tokenNum?: string;

  @Column({ nullable: true, default: "" })
  orderType?: string;

  @Column({ nullable: true, default: "completed" })
  orderStatus?: string;

  @Column({ nullable: true, default: false })
  qrOrdering?: boolean;

  @Column({ nullable: true, default: false })
  onlineOrdering?: boolean;

  @Column({ nullable: true, default: "" })
  specialInstructions?: string;

  @Column("simple-json", { array: true })
  items: OrderItem[];

  @Column("simple-json")
  payment: PaymentSchema;

  @Column("simple-json")
  dineInData: DineinData;

  @Column("simple-json", { array: true, default: () => [] })
  refunds?: RefundSchema[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "datetime", default: () => null })
  acceptedAt: Date;

  @Column({ type: "datetime", default: () => null })
  receivedAt: Date;

  @Column({ default: () => "local" })
  source: "local" | "server";

  @Column({ default: false })
  appliedDiscount: boolean;

  @Column("simple-array", { array: true, default: () => [] })
  paymentMethod: string[];

  @Column({ default: false })
  refundAvailable: boolean;
}
