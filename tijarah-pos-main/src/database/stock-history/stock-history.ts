import { Column, Entity } from "typeorm";

@Entity("stock-history")
export class StockHistoryModel {
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

  @Column({ nullable: true })
  categoryRef?: string;

  @Column("simple-json", { nullable: true })
  category?: { name: string };

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

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  price?: number;

  @Column({ default: 0, type: "decimal", precision: 10, scale: 3 })
  previousStockCount?: number;

  @Column({ default: 0, type: "decimal", precision: 10, scale: 3 })
  stockCount?: number;

  @Column()
  stockAction?: string;

  @Column({ nullable: true, default: false })
  auto?: boolean;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: "local" })
  source: "local" | "server";
}

@Entity()
export class ProductData {
  @Column()
  name: ProductNameSchema;

  @Column()
  type: string;

  @Column()
  qty: number;

  @Column()
  unit: number;

  @Column()
  sku: string;

  @Column({ nullable: true, default: 0 })
  costPrice?: number;

  @Column({ nullable: true, default: 0 })
  sellingPrice?: number;
}

@Entity()
export class ProductNameSchema {
  @Column()
  en: string;

  @Column()
  ar: string;
}
