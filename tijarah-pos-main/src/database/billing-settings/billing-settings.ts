import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("billing-settings")
export abstract class BillingSettingsModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column()
  quickAmounts: boolean;

  @Column()
  catalogueManagement: boolean;

  @Column("simple-json", { array: true })
  paymentTypes: PaymentTypesSchema[];

  @Column("simple-json", { array: true, default: [] })
  orderTypesList: PaymentTypesSchema[];

  @Column({ default: "manual" })
  cardPaymentOption: string;

  @Column()
  defaultCompleteBtn: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  defaultCash: number;

  @Column()
  noOfReceiptPrint: string;

  @Column()
  cashManagement: boolean;

  @Column()
  orderTypes: string;

  @Column()
  keypad: boolean;

  @Column()
  discounts: boolean;

  @Column({ default: true })
  promotions: boolean;

  @Column({ default: true })
  customCharges: boolean;
}

@Entity("payment-types")
class PaymentTypesSchema {
  @Column()
  name: string;

  @Column()
  status: boolean;
}
