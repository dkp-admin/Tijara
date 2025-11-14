import {
  CashierInfo,
  CompanyInfo,
  CustomerInfo,
  DeviceInfo,
  LocationInfo,
} from "./order-base";
import { DineinData } from "./order-dine-in";
import { OrderItem } from "./order-items";
import { PaymentSchema, RefundPaymentSchema } from "./order-payment";
import { RefundSchema } from "./order-refund";

export class Order {
  _id?: string;
  company: CompanyInfo;
  companyRef: string;
  location: LocationInfo;
  locationRef: string;
  customer?: CustomerInfo;
  customerRef?: string;
  cashier?: CashierInfo;
  cashierRef?: string;
  device?: DeviceInfo;
  deviceRef?: string;
  orderNum: string;
  tokenNum?: string;
  orderType?: string;
  orderStatus?: string;
  qrOrdering?: boolean;
  onlineOrdering?: boolean;
  specialInstructions?: string;
  items: OrderItem[];
  payment: PaymentSchema;
  dineInData: DineinData;
  refunds?: RefundSchema[];
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date;
  receivedAt: Date;
  source: "local" | "server";
  appliedDiscount: boolean;
  paymentMethod: string[];
  refundAvailable: boolean;
  currency?: string;

  constructor(data: Partial<Order> = {}) {
    this._id = data._id;
    this.company = new CompanyInfo(data.company?.name);
    this.companyRef = data.companyRef || "";
    this.location = new LocationInfo(data.location?.name);
    this.locationRef = data.locationRef || "";
    this.customer = data.customer
      ? new CustomerInfo(
          data.customer.name,
          data.customer.vat,
          data.customer.phone
        )
      : undefined;
    this.customerRef = data.customerRef;
    this.cashier = data.cashier
      ? new CashierInfo(data.cashier.name)
      : undefined;
    this.cashierRef = data.cashierRef;
    this.device = data.device
      ? new DeviceInfo(data.device.deviceCode)
      : undefined;
    this.deviceRef = data.deviceRef;
    this.orderNum = data.orderNum || "";
    this.tokenNum = data.tokenNum;
    this.orderType = data.orderType;
    this.orderStatus = data.orderStatus || "completed";
    this.qrOrdering = data.qrOrdering || false;
    this.onlineOrdering = data.onlineOrdering || false;
    this.specialInstructions = data.specialInstructions;
    this.items = (data.items || []).map((item) => new OrderItem(item));
    this.payment = new PaymentSchema(data.payment);
    this.dineInData = new DineinData(data.dineInData);
    this.refunds = (data.refunds || []).map(
      (refund) => new RefundSchema(refund)
    );
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.acceptedAt = data.acceptedAt ? new Date(data.acceptedAt) : new Date();
    this.receivedAt = data.receivedAt ? new Date(data.receivedAt) : new Date();
    this.source = data.source || "local";
    this.appliedDiscount = data.appliedDiscount || false;
    this.paymentMethod = data.paymentMethod || [];
    this.refundAvailable = data.refundAvailable || false;
    this.currency = data.currency || "SAR";
  }

  static fromRow(row: any): Order {
    return new Order({
      _id: row._id,
      company: JSON.parse(row.company),
      companyRef: row.companyRef,
      location: JSON.parse(row.location),
      locationRef: row.locationRef,
      customer: row.customer ? JSON.parse(row.customer || {}) : undefined,
      customerRef: row.customerRef,
      cashier: row.cashier ? JSON.parse(row.cashier || {}) : undefined,
      cashierRef: row.cashierRef,
      device: row.device ? JSON.parse(row.device || {}) : undefined,
      deviceRef: row.deviceRef,
      orderNum: row.orderNum,
      tokenNum: row.tokenNum,
      orderType: row.orderType,
      orderStatus: row.orderStatus,
      qrOrdering: Boolean(row.qrOrdering),
      onlineOrdering: Boolean(row.onlineOrdering),
      specialInstructions: row.specialInstructions,
      items: JSON.parse(row.items || []),
      payment: JSON.parse(row.payment || {}),
      dineInData: row.dineInData ? JSON.parse(row.dineInData || {}) : {},
      refunds: JSON.parse(row.refunds || []),
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      acceptedAt: row.acceptedAt ? new Date(row.acceptedAt) : undefined,
      receivedAt: row.receivedAt ? new Date(row.receivedAt) : undefined,
      source: row.source,
      appliedDiscount: Boolean(row.appliedDiscount),
      paymentMethod: JSON.parse(row.paymentMethod || []),
      refundAvailable: Boolean(row.refundAvailable),
      currency: row.currency || "SAR",
    });
  }

  static toRow(row: Order): any {
    return {
      _id: row._id,
      company: JSON.stringify(row.company),
      companyRef: row.companyRef,
      location: JSON.stringify(row.location),
      locationRef: row.locationRef,
      customer: row.customer ? JSON.stringify(row.customer || {}) : undefined,
      customerRef: row.customerRef,
      cashier: row.cashier ? JSON.stringify(row.cashier || {}) : undefined,
      cashierRef: row.cashierRef,
      device: row.device ? JSON.stringify(row.device || {}) : undefined,
      deviceRef: row.deviceRef,
      orderNum: row.orderNum,
      tokenNum: row.tokenNum,
      orderType: row.orderType,
      orderStatus: row.orderStatus,
      qrOrdering: row.qrOrdering,
      onlineOrdering: row.onlineOrdering,
      specialInstructions: row.specialInstructions,
      items: JSON.stringify(row.items || []),
      payment: JSON.stringify(row.payment || {}),
      dineInData: row.dineInData ? JSON.stringify(row.dineInData || {}) : {},
      refunds: JSON.stringify(row.refunds || []),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      acceptedAt: row.acceptedAt,
      receivedAt: row.receivedAt,
      source: row.source,
      appliedDiscount: row.appliedDiscount,
      paymentMethod: JSON.stringify(row.paymentMethod || []),
      refundAvailable: row.refundAvailable,
      currency: row.currency || "SAR",
    };
  }

  calculateTotal(): number {
    return this.payment.total;
  }

  isRefundable(): boolean {
    return this.refundAvailable && this.orderStatus === "completed";
  }

  getTotalRefunded(): number {
    return (
      this.refunds?.reduce((total, refund) => total + refund.amount, 0) || 0
    );
  }

  getRefundableAmount(): number {
    const total = this.calculateTotal();
    const refunded = this.getTotalRefunded();
    return Math.max(0, total - refunded);
  }
}
