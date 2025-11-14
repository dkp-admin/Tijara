import { Column, Entity } from "typeorm";
import { ProductNameSchema } from "../stock-history/stock-history";

@Entity("quick-items")
export class QuickItemsModel {
  @Column({
    primary: true, // Marks column as primary
  })
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
  product: { name: ProductNameSchema; image?: string };

  @Column()
  productRef: string;

  @Column({ default: "product" })
  type: string;

  @Column({ default: "local" })
  source: "local" | "server";
}
