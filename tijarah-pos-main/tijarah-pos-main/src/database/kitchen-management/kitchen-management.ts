import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("kitchen-management")
export class KitchenManagementModel {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  companyRef: string;

  @Column("simple-json")
  location: { name: string };

  @Column()
  locationRef: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  description: string;

  @Column({ default: false, nullable: true })
  allProducts?: boolean;

  @Column({ default: false, nullable: true })
  allCategories?: boolean;

  @Column("simple-array", { default: [], array: true, nullable: true })
  productRefs?: string[];

  @Column("simple-array", { default: [], array: true, nullable: true })
  categoryRefs?: string[];

  @Column("simple-json", { array: true, nullable: true })
  products?: ProductData[];

  @Column("simple-json", { array: true, nullable: true })
  categories?: CategoryData[];

  @Column({ nullable: true, default: "" })
  printerName?: string;

  @Column({ nullable: true, default: false })
  printerAssigned?: boolean;

  @Column("simple-json", { nullable: true })
  device?: { deviceCode?: string };

  @Column({ nullable: true, default: "" })
  deviceRef?: string;

  @Column()
  status: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column({ default: "server" })
  source: "local" | "server";
}

@Entity()
class ProductData {
  @Column()
  productRef: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column("simple-json")
  category: { name: string };

  @Column("simple-json")
  brand: { name: string };

  @Column()
  sku: string;

  @Column()
  price: number;
}

@Entity()
class CategoryData {
  @Column()
  categoryRef: string;

  @Column()
  name: string;
}
