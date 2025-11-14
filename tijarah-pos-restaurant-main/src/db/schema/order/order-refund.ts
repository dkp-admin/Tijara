import { ItemSchema, RefundPaymentSchema } from "./order-payment";
import { RefundCharges } from "./refund-charges";

export class RefundSchema {
  reason: string;
  amount: number;
  referenceNumber: string;
  vat: number;
  discountAmount: number;
  discountPercentage: number;
  vatWithoutDiscount: number;
  hasMultipleVariants?: boolean;
  charges: RefundCharges[];
  items: ItemSchema[];
  refundedTo: RefundPaymentSchema[]; // Here's where RefundPaymentSchema is used
  cashier?: { name: string };
  cashierRef?: string;
  date?: string;
  device: { deviceCode: string };
  deviceRef: string;

  constructor(data: Partial<RefundSchema> = {}) {
    this.reason = data.reason || "";
    this.amount = data.amount || 0;
    this.referenceNumber = data.referenceNumber || "";
    this.vat = data.vat || 0;
    this.discountAmount = data.discountAmount || 0;
    this.discountPercentage = data.discountPercentage || 0;
    this.vatWithoutDiscount = data.vatWithoutDiscount || 0;
    this.hasMultipleVariants = data.hasMultipleVariants;
    this.charges = (data.charges || []).map((c) => new RefundCharges(c));
    this.items = (data.items || []).map((i) => new ItemSchema(i));
    this.refundedTo = (data.refundedTo || []).map(
      (r) => new RefundPaymentSchema(r.amount, r.refundTo)
    );
    this.cashier = data.cashier;
    this.cashierRef = data.cashierRef;
    this.date = data.date;
    this.device = data.device || { deviceCode: "" };
    this.deviceRef = data.deviceRef || "";
  }
}
