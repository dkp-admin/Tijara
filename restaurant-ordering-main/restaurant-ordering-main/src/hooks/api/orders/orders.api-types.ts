import type { AppliedCharge } from '../billing/billing.api-types';

export interface OrderItem {
  productRef: string;
  quantity: number;
  variant: {
    name: {
      en: string;
      ar: string;
    };
  };
  name: {
    en: string;
    ar: string;
  };
  billing: {
    total: number;
    subTotal: number;
    vatAmount: number;
    vatPercentage: number;
    discountAmount: number;
    discountPercentage: number;
  };
  modifiers?: Array<{
    modifierRef: string;
    optionId: string;
    optionName: string;
    contains?: string;
    vatAmount?: number;
    vatPercentage?: number;
    total?: number;
    _id?: string;
  }>;
  hasMultipleVariants?: boolean;
  isFree?: boolean;
  isQtyFree?: boolean;
  originalPrice?: number;
}

export interface OrderFreeItem {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  image?: string;
  variants?: Array<{
    name: {
      en: string;
      ar: string;
    };
    price: number;
  }>;
  contains?: string;
  qty: number;
  total: number;
  isFree: boolean;
  isQtyFree?: boolean;
  multiVariants?: boolean;
}

export interface OrderDetails {
  _id: string;
  orderNum: string;
  tokenNumber: string;
  receivedAt: string;
  orderType: string;
  orderStatus: string;
  company?: { name: string };
  location?: { phone: string; address: string };
  customer?: {
    name: string;
    phone: string;
    address?: {
      fullAddress: string;
      houseFlatBlock?: string;
      apartmentArea?: string;
      directionToReach?: string;
      type?: string;
      otherName?: string;
      receiverName?: string;
      receiverPhone?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  payment?: {
    subTotal?: number;
    vatAmount?: number;
    total?: number;
    due?: boolean;
    paymentType?: string;
    discountCode?: string;
    discountAmount?: number;
    discountPercentage?: number;
    subTotalWithoutDiscount?: number;
    vatWithoutDiscount?: number;
    charges?: AppliedCharge[];
  };
  items?: OrderItem[];
  freeItems?: OrderFreeItem[];
  rating?: {
    foodQualityRating?: number;
    packagingRating?: number;
    comments?: string;
    ratedAt?: string;
  };
  currency?: string;
  updatedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  driver?: { name: string; phone: string };
}

export interface OrderListQueryParams {
  customerRef: string;
  page: number;
  limit: number;
}

export interface OrderListResponse {
  results: OrderDetails[];
  total: number;
  page: number;
  limit: number;
}

export interface CancelResponse {
  message: string;
  success: boolean;
  order: OrderDetails;
}

export interface RatingResponse {
  message: string;
  success: boolean;
  order: OrderDetails;
}

export interface CancelOrderPayload {
  createdAt: string;
  orderStatus: 'cancelled';
  cancelledBy: 'customer';
}

export interface RatingPayload {
  packagingRating: number;
  foodQualityRating: number;
  comments: string;
}

export interface PlaceOrderPayload {
  qrOrdering: boolean;
  onlineOrdering: boolean;
  companyRef: string;
  locationRef: string;
  menuRef: string;
  orderType: string;
  specialInstructions: string;
  items: unknown[];
  addressRef?: string;
  discount?: string;
  billing?: {
    subTotal: number;
    total: number;
    deliveryFee: number;
    discount: number;
    vat: number;
  };
  customerRef?: string;
}

export interface PlaceOrderResponse {
  _id: string;
}

export interface OrderListResponse {
  results: OrderDetails[];
  total: number;
}
