import { Column, Entity } from "typeorm";
import { ProductData, ProductNameSchema } from "../stock-history/stock-history";

@Entity("batch")
export class BatchModel {
  @Column({
    primary: true, // Marks column as primary
  })
  _id: string;

  @Column()
  companyRef: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  locationRef: string;

  @Column("simple-json")
  location: { name: string };

  @Column({ nullable: true })
  vendorRef?: string;

  @Column("simple-json", { nullable: true })
  vendor?: { name: string };

  @Column()
  productRef: string;

  @Column("simple-json")
  product: { name: ProductNameSchema };

  @Column({ nullable: true, default: false })
  hasMultipleVariants?: boolean;

  @Column("simple-json")
  variant: ProductData;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true, default: 0 })
  received?: number;

  @Column({ nullable: true, default: 0 })
  transfer?: number;

  @Column({ nullable: true, default: 0 })
  available?: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  expiry?: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ nullable: true, default: "active" })
  status?: string;

  @Column({ default: "local" })
  source: "local" | "server";
}
