import {
  CategoryInfo,
  ItemModifiers,
  Name,
  PromotionsData,
} from "./order-base";

export class OrderItem {
  itemSubTotal: number | string;
  isOpenPrice?: boolean;
  // itemSubTotal: number | string;
  image: string;
  name: Name;
  contains?: string;
  category: CategoryInfo;
  promotionsData: PromotionsData;
  productRef?: string;
  categoryRef?: string;
  variantNameEn: string;
  variantNameAr: string;
  type: string;
  sku: string;
  parentSku: string;
  boxSku: string;
  crateSku: string;
  boxRef?: string | null;
  crateRef: string | null;
  isFree: boolean;
  isQtyFree: boolean;
  discountedTotal: number;
  discountedVat: string;
  costPrice: number;
  sellingPrice: number;
  total: number;
  amountBeforeVoidComp: number;
  qty: number;
  hasMultipleVariants?: boolean;
  discount: number;
  discountPercentage: number;
  promotionPercentage: number;
  vat: number;
  vatPercentage: number;
  unit: string;
  note: string;
  refundedQty: number;
  noOfUnits: number;
  availability: boolean;
  stockCount: number;
  tracking: boolean;
  void: boolean;
  voidRef: string;
  voidReason: Name;
  comp: boolean;
  compRef: string | null;
  compReason: Name;
  kitchenName: string;
  kotId: string;
  sentToKotAt: string;
  modifiers?: ItemModifiers[];
  kitchenRef?: string;
  kitchenRefs?: string[];

  constructor(data: Partial<OrderItem> = {}) {
    this.isOpenPrice = data.isOpenPrice;
    this.kitchenRef = data.kitchenRef || "";
    this.kitchenRefs = data.kitchenRefs || [];
    this.image = data.image || "";
    this.name = new Name(data.name?.en, data.name?.ar);
    this.contains = data.contains;
    this.category = new CategoryInfo(data.category?.name);
    this.promotionsData = new PromotionsData(
      data.promotionsData?.name,
      data.promotionsData?.discount,
      data.promotionsData?.id
    );
    this.productRef = data.productRef;
    this.categoryRef = data.categoryRef;
    this.variantNameEn = data.variantNameEn || "";
    this.variantNameAr = data.variantNameAr || "";
    this.type = data.type || "";
    this.sku = data.sku || "";
    this.parentSku = data.parentSku || "";
    this.boxSku = data.boxSku || "";
    this.crateSku = data.crateSku || "";
    this.boxRef = data.boxRef || null;
    this.crateRef = data.crateRef || null;
    this.isFree = data.isFree || false;
    this.isQtyFree = data.isQtyFree || false;
    this.discountedTotal = data.discountedTotal || 0;
    this.discountedVat = data.discountedVat || "0";
    this.costPrice = data.costPrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
    this.total = data.total || 0;
    this.amountBeforeVoidComp = data.amountBeforeVoidComp || 0;
    this.qty = data.qty || 0;
    this.hasMultipleVariants = data.hasMultipleVariants;
    this.discount = data.discount || 0;
    this.discountPercentage = data.discountPercentage || 0;
    this.promotionPercentage = data.promotionPercentage || 0;
    this.vat = data.vat || 0;
    this.vatPercentage = data.vatPercentage || 0;
    this.unit = data.unit || "";
    this.note = data.note || "";
    this.refundedQty = data.refundedQty || 0;
    this.noOfUnits = data.noOfUnits || 0;
    this.availability = data.availability || false;
    this.stockCount = data.stockCount || 0;
    this.tracking = data.tracking || false;
    this.void = data.void || false;
    this.voidRef = data.voidRef || "";
    this.voidReason = new Name(data.voidReason?.en, data.voidReason?.ar);
    this.comp = data.comp || false;
    this.compRef = data.compRef || null;
    this.compReason = new Name(data.compReason?.en, data.compReason?.ar);
    this.kitchenName = data.kitchenName || "";
    this.kotId = data.kotId || "";
    this.sentToKotAt = data.sentToKotAt || "";
    this.itemSubTotal = data.itemSubTotal || 0;
    this.modifiers = data.modifiers?.map((m) => new ItemModifiers(m));
    this.itemSubTotal = data.itemSubTotal || 0;
  }
}
