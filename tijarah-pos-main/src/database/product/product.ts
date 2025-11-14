import { Column, Entity } from "typeorm";

@Entity("products")
export class ProductModel {
  @Column({
    primary: true, // Marks column as primary
  })
  _id: string;

  @Column({ nullable: true })
  parent?: string;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column("simple-json", { nullable: true })
  kitchenFacingName?: { en: string; ar: string };

  @Column({ default: "", nullable: true })
  contains?: string;

  @Column()
  image: string;

  @Column({ nullable: true })
  localImage?: string;

  @Column()
  companyRef: string;

  @Column("simple-json")
  company: { name: string };

  @Column()
  categoryRef: string;

  @Column("simple-json")
  category: { name: string };

  @Column("simple-array", { array: true, nullable: true })
  restaurantCategoryRefs?: string[];

  @Column("simple-json", { array: true, nullable: true })
  restaurantCategories?: NameSchema[];

  @Column("simple-array", { array: true, nullable: true })
  kitchenRefs?: string[];

  @Column("simple-json", { array: true, nullable: true })
  kitchens?: NameSchema[];

  @Column("simple-array", { array: true, nullable: true })
  collectionsRefs?: string[];

  @Column("simple-json", { array: true, nullable: true })
  collections: NameSchema[];

  @Column()
  description: string;

  @Column()
  brandRef: string;

  @Column("simple-json")
  brand: { name: string };

  @Column()
  taxRef: string;

  @Column("simple-json")
  tax: { percentage: string };

  @Column({ default: "active" })
  status: string;

  @Column({ default: "local" })
  source: "local" | "server";

  @Column({ default: false })
  enabledBatching: boolean;

  @Column({ default: false, nullable: true })
  bestSeller?: boolean;

  @Column("simple-array", { array: true, nullable: true })
  channels?: string[];

  @Column({ default: true, nullable: true })
  selfOrdering?: boolean;

  @Column({ default: true, nullable: true })
  onlineOrdering?: boolean;

  @Column("simple-json", { array: true })
  variants: VariantModal[];

  @Column("simple-json", { nullable: true, array: true })
  otherVariants?: VariantModal[];

  @Column("simple-json", { array: true })
  boxes?: BoxModal[];

  @Column("simple-json", { nullable: true, array: true })
  otherBoxes?: BoxModal[];

  @Column("simple-json", { nullable: true })
  nutritionalInformation?: NutritionalInformation;

  @Column("simple-json", { nullable: true, array: true })
  modifiers?: ProductModifier[];

  @Column({ default: 0, nullable: true })
  sortOrder?: number;

  @Column("simple-array")
  sku: string[];

  @Column("simple-array", { nullable: true, array: true, default: [] })
  code?: string[];

  @Column("simple-array", { nullable: true, array: true, default: [] })
  boxRefs?: string[];

  @Column("simple-array", { nullable: true, array: true, default: [] })
  crateRefs?: string[];
}

@Entity()
class NameSchema {
  @Column({ default: "" })
  name: string;
}

@Entity()
export class VariantModal {
  @Column("string")
  _id: string;

  @Column({ nullable: true })
  parentSku?: string;

  @Column("simple-json", { nullable: true })
  parentName?: { en: string; ar: string };

  @Column({ default: "item" })
  type: "item" | "box";

  @Column()
  assignedToAll: boolean;

  @Column("simple-json")
  name: { en: string; ar: string };

  @Column()
  image?: string;

  @Column()
  localImage?: string;

  @Column()
  sku: string;

  @Column({ default: "", nullable: true })
  code?: string;

  @Column()
  unit: string;

  @Column({ default: 0 })
  noOfUnits?: number;

  @Column()
  costPrice: string;

  @Column()
  sellingPrice: string;

  @Column()
  originalPrice: string;

  @Column()
  nonSaleable: boolean;

  @Column("simple-array")
  locationRefs: string[];

  @Column("simple-array", { array: true })
  locations: Object[];

  @Column("simple-json", { array: true })
  prices: PricesSchema[];

  @Column("simple-json", { array: true })
  otherPrices?: PricesSchema[];

  @Column("simple-json", { array: true })
  stocks: StocksSchema[];

  @Column("simple-json", { array: true })
  otherStocks?: StocksSchema[];

  @Column()
  status: string;
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

@Entity()
export class BoxModal {
  @Column("string")
  _id: string;

  @Column()
  parentSku: string;

  @Column("simple-json", { nullable: true })
  parentName?: { en: string; ar: string };

  @Column({ default: "box" })
  type: "item" | "box";

  @Column()
  assignedToAll: boolean;

  @Column("simple-json", { nullable: true })
  name?: { en: string; ar: string };

  @Column()
  image?: string;

  @Column()
  localImage?: string;

  @Column()
  sku: string;

  @Column({ default: "", nullable: true })
  code?: string;

  @Column()
  unit: string;

  @Column()
  noOfUnits: number;

  @Column()
  costPrice: string;

  @Column()
  sellingPrice: string;

  @Column()
  nonSaleable: boolean;

  @Column("simple-array")
  locationRefs: string[];

  @Column("simple-array", { array: true })
  locations: Object[];

  @Column("simple-json", { array: true })
  prices: PricesSchema[];

  @Column("simple-json", { array: true })
  otherPrices?: PricesSchema[];

  @Column("simple-json", { nullable: true, array: true })
  stocks?: StocksSchema[];

  @Column("simple-json", { nullable: true, array: true })
  otherStocks?: StocksSchema[];

  @Column()
  status: string;
}

@Entity()
export class PricesSchema {
  @Column()
  costPrice: string;

  @Column()
  price: string;

  @Column()
  locationRef: string;

  @Column("simple-json")
  location: { name: string };
}

@Entity()
class NutritionalInformation {
  @Column({ default: "", nullable: true })
  calorieCount: string;

  @Column({ array: true, nullable: true })
  preference: string[];

  @Column({ array: true, nullable: true })
  contains: string[];
}

@Entity()
class ProductModifier {
  @Column({ default: "", nullable: true })
  modifierRef: string;

  @Column({ default: "", nullable: true })
  name: string;

  @Column({ default: "", nullable: true })
  kitchenName: string;

  @Column({ default: 0, nullable: true })
  noOfFreeModifier: number;

  @Column({ default: "", nullable: true })
  default: string;

  @Column({ array: true, nullable: true })
  excluded: string[];

  @Column({ default: 1, nullable: true })
  min: number;

  @Column({ default: 1, nullable: true })
  max: number;

  @Column("simple-json", { default: [], nullable: true, array: true })
  values: ModifierValues[];

  @Column({ default: "active", nullable: true })
  status: string;
}

@Entity()
class ModifierValues {
  @Column({ default: "", nullable: true })
  _id: string;

  @Column({ default: "", nullable: true })
  name: string;

  @Column({ default: "", nullable: true })
  kitchenName: string;

  @Column({ default: 0, nullable: true })
  price: number;

  @Column({ default: "", nullable: true })
  taxRef: string;

  @Column("simple-json", { nullable: true })
  tax: { percentage: number };

  @Column({ default: "", nullable: true })
  contains: string;

  @Column({ default: false, nullable: true })
  included: boolean;

  @Column({ default: "active", nullable: true })
  status: string;
}
