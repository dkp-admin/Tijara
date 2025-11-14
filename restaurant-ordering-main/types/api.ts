export interface LocalizedText {
  en: string;
  ar: string;
}

export interface Category {
  categoryRef: string;
  name: LocalizedText;
  sortOrder: number;
  image: string;
}

export interface ProductVariant {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  sku: string;
  price: number;
  status: string;
  prices: {
    locationRef: string;
    price: number;
    location: {
      name: string;
    };
    nonSaleable?: boolean;
    unit?: string;
  }[];
  unit: string;
}

interface ModifierValue {
  _id: string;
  name: string;
  price: number;
  status: string;
}

interface Modifier {
  _id: string;
  modifierRef: string;
  name: string;
  values: ModifierValue[];
  min: number;
  max: number;
  status: string;
}

export interface Product {
  _id: string;
  uniqueId?: string;
  _uniqueIndex?: number;
  name: {
    en: string;
    ar: string;
  };
  description?: string;
  image: string;
  categoryRef: string;
  currency: string;
  glbFileUrl?: string;
  variants: ProductVariant[];
  nutritionalInformation?: {
    calorieCount: number;
  };
  contains?: 'veg' | 'non-veg' | 'egg';
  bestSeller?: boolean;
  modifiers?: Modifier[];
}

export interface MenuData {
  results: {
    _id: string;
    company?: {
      name: string;
    };
    companyRef?: string;
    locationRef: string;
    categories: Category[];
    products?: Product[];
  } | null;
}

export interface ProcessedMenuData {
  companyName: string;
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  allProducts: Product[];
  locationRef: string | null;
  menuRef: string;
}

export interface CartItem extends Product {
  quantity: number;
}
