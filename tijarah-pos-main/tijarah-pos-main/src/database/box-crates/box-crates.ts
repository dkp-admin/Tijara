import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("box-crates")
export class BoxCratesModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column()
  type: string;

  @Column()
  qty: number;

  @Column({ default: "" })
  code: string;

  @Column({ default: 0, type: "decimal", precision: 10, scale: 2 })
  costPrice: number;

  @Column({ default: 0, type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column("simple-json", { nullable: true })
  box?: Box;

  @Column("simple-json", { nullable: true })
  boxName?: { en: string; ar: string };

  @Column({ default: "", nullable: true })
  boxRef?: string;

  @Column({ default: "" })
  boxSku: string;

  @Column({ default: "" })
  crateSku: string;

  @Column({ default: "" })
  productSku: string;

  @Column({ default: "", nullable: true })
  description?: string;

  @Column({ default: false, nullable: true })
  nonSaleable?: boolean;

  @Column("simple-json")
  product: Product;

  @Column("simple-array", { default: [], nullable: true })
  locationRefs?: string[];

  @Column("simple-json", { array: true, nullable: true })
  locations: Locations[];

  @Column("simple-json", { array: true })
  prices: PricesSchema[];

  @Column("simple-json", { array: true })
  otherPrices: PricesSchema[];

  @Column("simple-json", { nullable: true, array: true })
  stocks?: StocksSchema[];

  @Column("simple-json", { nullable: true, array: true })
  otherStocks?: StocksSchema[];

  @Column({ default: "active" })
  status: string;

  @Column({ default: "server" })
  source: "local" | "server";
}

@Entity()
class Product {
  @Column("simple-json")
  name: { en: string; ar: string };

  @Column("simple-json")
  category: { name: string };

  @Column({ default: "" })
  categoryRef: string;

  @Column("simple-json")
  brand: { name: string };

  @Column({ default: "" })
  brandRef: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: "" })
  sku: string;

  @Column({ default: "" })
  productRef: string;

  @Column({ default: "" })
  code: string;

  @Column("simple-json")
  tax: { percentage: number };

  @Column({ default: "" })
  taxRef: string;

  @Column("simple-json")
  variant: { en: string; ar: string };
}

@Entity()
class Box {
  @Column("simple-json")
  name: { en: string; ar: string };

  @Column({ default: "" })
  code: string;

  @Column({ default: "" })
  sku: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: "" })
  boxRef: string;
}

@Entity()
class Locations {
  @Column({ default: "" })
  name: string;

  @Column({ default: "" })
  locationRef: string;
}

@Entity()
export class PricesSchema {
  @Column()
  costPrice: number;

  @Column()
  price: number;

  @Column()
  locationRef: string;

  @Column("simple-json")
  location: { name: string };
}

@Entity()
export class StocksSchema {
  @Column({ default: true })
  enabledAvailability: boolean;

  @Column({ default: false })
  enabledTracking: boolean;

  @Column()
  stockCount: number;

  @Column({ default: false })
  enabledLowStockAlert: boolean;

  @Column()
  lowStockCount: number;

  @Column()
  locationRef: string;

  @Column("simple-json")
  location: { name: string };
}
