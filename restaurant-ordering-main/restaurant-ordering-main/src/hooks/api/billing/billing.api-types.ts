export interface BillingModifier {
  modifierRef: string;
  modifier: string;
  optionId: string;
  optionName: string;
}

export interface BillingItem {
  productRef: string;
  variant: {
    sku: string;
    type: string;
    boxSku?: string;
    crateSku?: string;
    boxRef?: string | null;
    crateRef?: string | null;
  };
  quantity: number;
  modifiers: BillingModifier[];
  categoryRef: string;
}

export interface BillingPayload {
  items: BillingItem[];
  companyRef: string;
  locationRef: string;
  discount?: string | null;

  startOfDay: string;
  endOfDay: string;
  customerRef: string;
  menuRef?: string;
}

export interface FreeItem {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  kitchenFacingName?: {
    en: string;
    ar: string;
  };
  image: string;
  description?: string;
  modifiers?: unknown[];
  company?: {
    name: string;
  };
  companyRef?: string;
  categoryRef?: string;
  category?: {
    name: string;
  };
  collectionRefs?: string[];
  kitchenRefs?: string[];
  collections?: unknown[];
  assignedToAllCategories?: boolean;
  brandRef?: string;
  brand?: {
    name: string;
  };
  taxRef?: string;
  tax?: {
    percentage: number;
  };
  isLooseItem?: boolean;
  variants: Array<{
    name: {
      en: string;
      ar: string;
    };
    sku: string;
    code?: string;
    type: string;
    image?: string;
    unitCount: number;
    unit: string;
    price: number;
    costPrice?: number | null;
    prices?: Array<{
      locationRef: string;
      location: {
        name: string;
      };
      price: number;
      priceOverridenFromMenu?: boolean;
      costPrice?: number;
      overriden?: boolean;
    }>;
    assignedToAll?: boolean;
    nonSaleable?: boolean;
    locationRefs?: string[];
    locations?: Array<{
      name: string;
    }>;
    stockConfiguration?: Array<{
      availability: boolean;
      tracking: boolean;
      count: number;
      lowStockAlert: boolean;
      lowStockCount: number;
      locationRef: string;
      location: {
        name: string;
      };
    }>;
    status: string;
    _id: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  boxes?: unknown[];
  batching?: boolean;
  status: string;
  pushed?: boolean;
  nutritionalInformation?: {
    calorieCount?: number | null;
    preference?: unknown[];
    contains?: unknown[];
    assignedToAllPreferrence?: boolean;
    assignedToAllItems?: boolean;
  };
  bestSeller?: boolean;
  contains?: string;
  channel?: string[];
  selfOrdering?: boolean;
  onlineOrdering?: boolean;
  isComposite?: boolean;
  reduceFromOriginal?: boolean;
  boxRefs?: string[];
  crateRefs?: string[];
  kitchens?: Array<{
    name: string;
    printerId?: string;
    kitchenRef: string;
    locationRef: string;
  }>;
  productBeforeUpdate?: unknown[];
  compositeProductItems?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  lastUpdatedByRef?: string;
  currency?: string;
  glbFileUrl?: string;
  priceOverridenFromMenu?: boolean;
  multiVariants?: boolean;
  type?: string;
  qty: number;
  total: number;
  isFree: boolean;
  isQtyFree?: boolean;
}

export interface AppliedCharge {
  name: {
    en: string;
    ar: string;
  };
  total: number;
  vat: number;
  type: string;
  chargeDocType: string;
  value: number;
  chargeDocId: string;
}

export interface BillingResponse {
  total: number;
  subTotal: number;
  subTotalWithoutDiscount: number;
  vatAmount: number;
  tax?: number;
  discount: number;
  discountCode: string;
  discountId?: string;
  discountPercentage?: number;
  vatWithoutDiscount?: number;
  discountedItems?: unknown[];
  appliedPromotions?: unknown[];
  appliedCharges?: AppliedCharge[];
  discountType?: string;
  freeItemsDiscount?: number;
  freeItems?: FreeItem[];
  companyRef: string;
  locationRef: string;
  menuRef: string;
  [key: string]: unknown;
}

// Enhanced response type that includes validation result
export interface BillingResponseWithValidation extends BillingResponse {
  isValidCoupon?: boolean;
  couponError?: string;
}

export interface CartItem {
  _id: string;
  selectedVariantId?: string;
  quantity: number;
  selectedModifiers?: Record<string, string>;
  modifiers?: Array<{
    _id: string;
    modifierRef?: string;
    name?: string;
    values: Array<{
      _id: string;
      name?: string;
    }>;
  }>;
  variants?: Array<{
    _id: string;
    sku: string;
  }>;
  categoryRef: string;
}

export interface BillingQueryArgs {
  cartItems: CartItem[];
  companyRef?: string;
  locationRef?: string;
  customerRef?: string;
  discount?: string;
}
