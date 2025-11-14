import {
  BrandInfo,
  CategoryInfo,
  CompanyInfo,
  Name,
  NameSchema,
  TaxInfo,
} from "./base";
import { NutritionalInformation, ProductModifier } from "./modifier";
import { BoxModal, VariantModal } from "./variant-box";

export class Product {
  _id?: string;
  parent?: string;
  name: Name;
  kitchenFacingName?: Name;
  contains?: string;
  image: string;
  localImage?: string;
  companyRef: string;
  company: CompanyInfo;
  categoryRef: string;
  category: CategoryInfo;
  restaurantCategoryRefs?: string[];
  restaurantCategories?: NameSchema[];
  kitchenRefs?: string[];
  kitchens?: NameSchema[];
  collectionsRefs?: string[];
  collections: NameSchema[];
  description: string;
  brandRef: string;
  brand: BrandInfo;
  taxRef: string;
  tax: TaxInfo;
  status: string;
  source: "local" | "server";
  enabledBatching: boolean;
  bestSeller?: boolean;
  channels?: string[];
  selfOrdering?: boolean;
  onlineOrdering?: boolean;
  variants: VariantModal[];
  otherVariants?: VariantModal[];
  boxes?: BoxModal[];
  otherBoxes?: BoxModal[];
  createdAt?: Date;
  updatedAt?: Date;
  nutritionalInformation?: NutritionalInformation;
  modifiers?: ProductModifier[];
  sortOrder?: number;
  sku: string[];
  code?: string[];
  boxRefs?: string[];
  crateRefs?: string[];

  constructor(data: Partial<Product> = {}) {
    this._id = data._id;
    this.parent = data.parent;
    this.name = new Name(data.name?.en, data.name?.ar);
    this.kitchenFacingName = data.kitchenFacingName
      ? new Name(data.kitchenFacingName.en, data.kitchenFacingName.ar)
      : undefined;
    this.contains = data.contains;
    this.image = data.image || "";
    this.localImage = data.localImage;
    this.companyRef = data.companyRef || "";
    this.company = new CompanyInfo(data.company?.name);
    this.categoryRef = data.categoryRef || "";
    this.category = new CategoryInfo(data.category?.name);
    this.restaurantCategoryRefs = data.restaurantCategoryRefs;
    this.restaurantCategories = data.restaurantCategories?.map(
      (c) => new NameSchema(c.name)
    );
    this.kitchenRefs = data.kitchenRefs;
    this.kitchens = data.kitchens?.map((k) => new NameSchema(k.name));
    this.collectionsRefs = data.collectionsRefs;
    this.collections = (data.collections || []).map(
      (c) => new NameSchema(c.name)
    );
    this.description = data.description || "";
    this.brandRef = data.brandRef || "";
    this.brand = new BrandInfo(data.brand?.name);
    this.taxRef = data.taxRef || "";
    this.tax = new TaxInfo(data.tax?.percentage);
    this.status = data.status || "active";
    this.source = data.source || "local";
    this.enabledBatching = data.enabledBatching || false;
    this.bestSeller = data.bestSeller;
    this.channels = data.channels;
    this.selfOrdering = data.selfOrdering ?? true;
    this.onlineOrdering = data.onlineOrdering ?? true;
    this.variants = (data.variants || []).map((v) => new VariantModal(v));
    this.otherVariants = data.otherVariants?.map((v) => new VariantModal(v));
    this.boxes = data.boxes?.map((b) => new BoxModal(b));
    this.otherBoxes = data.otherBoxes?.map((b) => new BoxModal(b));
    this.nutritionalInformation = data.nutritionalInformation
      ? new NutritionalInformation(data.nutritionalInformation)
      : undefined;
    this.modifiers = data.modifiers?.map((m) => new ProductModifier(m));
    this.sortOrder = data.sortOrder;
    this.sku = data.sku || [];
    this.code = data.code;
    this.boxRefs = data.boxRefs;
    this.crateRefs = data.crateRefs;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  static fromRow(row: any): Product {
    return new Product({
      _id: row._id,
      parent: row.parent,
      name: JSON.parse(row.name),
      kitchenFacingName: row.kitchenFacingName
        ? JSON.parse(row.kitchenFacingName)
        : undefined,
      contains: row.contains,
      image: row.image,
      localImage: row.localImage,
      companyRef: row.companyRef,
      company: JSON.parse(row.company),
      categoryRef: row.categoryRef,
      category: JSON.parse(row.category),
      restaurantCategoryRefs: JSON.parse(row.restaurantCategoryRefs || "[]"),
      restaurantCategories: JSON.parse(row.restaurantCategories || "[]"),
      kitchenRefs: JSON.parse(row.kitchenRefs || "[]"),
      kitchens: JSON.parse(row.kitchens || "[]"),
      collectionsRefs: JSON.parse(row.collectionsRefs || "[]"),
      collections: JSON.parse(row.collections || "[]"),
      description: row.description,
      brandRef: row.brandRef,
      brand: JSON.parse(row.brand),
      taxRef: row.taxRef,
      tax: JSON.parse(row.tax),
      status: row.status,
      source: row.source,
      enabledBatching: Boolean(row.enabledBatching),
      bestSeller: Boolean(row.bestSeller),
      channels: JSON.parse(row.channels || "[]"),
      selfOrdering:
        row.selfOrdering === null ? true : Boolean(row.selfOrdering),
      onlineOrdering:
        row.onlineOrdering === null ? true : Boolean(row.onlineOrdering),
      variants: JSON.parse(row.variants || "[]"),
      otherVariants: JSON.parse(row.otherVariants || "[]"),
      boxes: JSON.parse(row.boxes || "[]"),
      otherBoxes: JSON.parse(row.otherBoxes || "[]"),
      nutritionalInformation: row.nutritionalInformation
        ? JSON.parse(row.nutritionalInformation)
        : undefined,
      modifiers: JSON.parse(row.modifiers || "[]"),
      sortOrder: Number(row.sortOrder),
      sku: JSON.parse(row.sku || "[]"),
      code: JSON.parse(row.code || "[]"),
      boxRefs: JSON.parse(row.boxRefs || "[]"),
      crateRefs: JSON.parse(row.crateRefs || "[]"),
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }

  static toRow(product: Product): any {
    return {
      _id: product._id,
      parent: product.parent,
      name: JSON.stringify(product.name),
      kitchenFacingName: product.kitchenFacingName
        ? JSON.stringify(product.kitchenFacingName)
        : null,
      contains: product.contains,
      image: product.image,
      localImage: product.localImage,
      companyRef: product.companyRef,
      company: JSON.stringify(product.company),
      categoryRef: product.categoryRef,
      category: JSON.stringify(product.category),
      restaurantCategoryRefs: JSON.stringify(product.restaurantCategoryRefs),
      restaurantCategories: JSON.stringify(product.restaurantCategories),
      kitchenRefs: JSON.stringify(product.kitchenRefs),
      kitchens: JSON.stringify(product.kitchens),
      collectionsRefs: JSON.stringify(product.collectionsRefs),
      collections: JSON.stringify(product.collections),
      description: product.description,
      brandRef: product.brandRef,
      brand: JSON.stringify(product.brand),
      taxRef: product.taxRef,
      tax: JSON.stringify(product.tax),
      status: product.status,
      source: product.source,
      enabledBatching: Number(product.enabledBatching),
      bestSeller: Number(product.bestSeller),
      channels: JSON.stringify(product.channels),
      selfOrdering: Number(product.selfOrdering),
      onlineOrdering: Number(product.onlineOrdering),
      variants: JSON.stringify(product.variants),
      otherVariants: JSON.stringify(product.otherVariants),
      boxes: JSON.stringify(product.boxes),
      otherBoxes: JSON.stringify(product.otherBoxes),
      nutritionalInformation: product.nutritionalInformation
        ? JSON.stringify(product.nutritionalInformation)
        : null,
      modifiers: JSON.stringify(product.modifiers),
      sortOrder: product.sortOrder,
      sku: JSON.stringify(product.sku),
      code: JSON.stringify(product.code),
      boxRefs: JSON.stringify(product.boxRefs),
      crateRefs: JSON.stringify(product.crateRefs),
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    };
  }
}
