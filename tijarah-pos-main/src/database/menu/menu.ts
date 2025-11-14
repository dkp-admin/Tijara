import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ProductModel } from "../product/product";

@Entity("menu")
export class MenuModel {
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

  @Column("simple-json", { array: true })
  categories: CategoryModal[];

  @Column("simple-json", { array: true })
  products: ProductModel[];

  @Column()
  orderType: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column({ default: "server" })
  source: "local" | "server";
}

@Entity()
class CategoryModal {
  @Column()
  categoryRef: string;

  @Column()
  image: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  sortOrder: number;
}
