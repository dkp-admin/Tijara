enum MoleculeType {
  "pos:billing-settings" = "pos:billing-settings",
  "pos:business-detail" = "pos:business-detail",
  "pos:category" = "pos:category",
  "pos:collection" = "pos:collection",
  "pos:coupon" = "pos:coupon",
  "pos:customer" = "pos:customer",
  "pos:customer-credit" = "pos:customer-credit",
  "pos:dashboard" = "pos:dashboard",
  "pos:global-product" = "pos:global-product",
  "pos:order" = "pos:order",
  "pos:printer" = "pos:printer",
  "pos:product" = "pos:product",
  "pos:report" = "pos:report",
  "pos:user" = "pos:user",
  "pos:vendor" = "pos:vendor",
  "pos:po" = "pos:po",
  "pos:grn" = "pos:grn",
  "pos:stock-history" = "pos:stock-history",
  "pos:section-table" = "pos:section-table",
  "pos:stocktake" = "pos:stocktake",
  "pos:void-comp" = "pos:void-comp",
  "pos:kitchen" = "pos:kitchen",
  "pos:menu" = "pos:menu",
  "pos:expense" = "pos:expense",
}

type MoleculePermission = {
  read?: boolean;
  create?: boolean;
  update?: boolean;
  print?: boolean;
  delete?: boolean;
  import?: boolean;
  category?: boolean;
  order?: boolean;
  product?: boolean;
  sales?: boolean;
  shift?: boolean;
  "send-receipt"?: boolean;
  "change-pin"?: boolean;
  "activity-log"?: boolean;
  batching?: boolean;
  keypad?: boolean;
  discount?: boolean;
  allowed?: boolean;
  blocked?: boolean;
  blacklist?: boolean;
  pay?: boolean;
  promotions?: boolean;
  "custom-charges"?: boolean;
};

export type UserPermissions = Record<MoleculeType, MoleculePermission>;
