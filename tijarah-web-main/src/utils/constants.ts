import i18n from "src/i18n";
import { DropdownOptions } from "src/types/dropdown";
import { ReportSortOption, SortOption } from "src/types/sortoption";

export const IMPORT_PRODUCTS =
  "https://docs.google.com/spreadsheets/d/1lsrp8Ex7J7hYjmWxmhPEhdyaiixnDcieRmdDE_Dx0no/edit?usp=sharing";
export const IMPORT_GLOBAL_PRODUCTS =
  "https://docs.google.com/spreadsheets/d/1gSBMD-JwKPsSX1k_m0sMoE9WD4ZixZdXYrAqUgRyeP8/edit?usp=sharing";
export const IMPORT_GLOBAL_BRANDS =
  "https://docs.google.com/spreadsheets/d/1axpMTTfMsMeCTkTy6FKmLspfIfBQwX8WJ62CgmebFtA/edit?usp=sharing";

export const TERMS_CONDITIONS_URL =
  "https://tijarahapp.co/terms-and-conditions/";

export interface Option {
  label: string;
  value: string;
}

export const statusOptions: Option[] = [
  {
    label: i18n.t("Active"),
    value: "active",
  },
  {
    label: i18n.t("Deactivated"),
    value: "inactive",
  },
];
export const updateOptions: Option[] = [
  {
    label: i18n.t("Pushed"),
    value: "pushed",
  },
  {
    label: i18n.t("Newly Added"),
    value: "newlyAdded",
  },
  {
    label: i18n.t("Updated"),
    value: "updated",
  },
];
export const vendorOptions: Option[] = [
  {
    label: i18n.t("Vendor 1"),
    value: "vendor1",
  },
  {
    label: i18n.t("Vendor 2"),
    value: "vendor2",
  },
];

export const poOrderTypeOptions: Option[] = [
  {
    label: i18n.t("PO GRN"),
    value: "po",
  },
  {
    label: i18n.t("Quick GRN"),
    value: "grn",
  },
  {
    label: i18n.t("Return"),
    value: "return",
  },
];
export const transferTypeOptions: Option[] = [
  {
    label: i18n.t("Transfer"),
    value: "transfer",
  },
  {
    label: i18n.t("Request"),
    value: "request",
  },
];
export const paymentStatusList: Option[] = [
  {
    label: i18n.t("Paid"),
    value: "paid",
  },
  {
    label: i18n.t("Unpaid"),
    value: "unpaid",
  },
  {
    label: i18n.t("Partially Paid"),
    value: "partiallyPaid",
  },
];

export const cashDrawerStatusOptions: Option[] = [
  {
    label: i18n.t("Open"),
    value: "open",
  },
  {
    label: i18n.t("Ended"),
    value: "ended",
  },
  {
    label: i18n.t("Closed"),
    value: "close",
  },
];

export const differenceOptions: Option[] = [
  {
    label: i18n.t("Positive"),
    value: "positive",
  },
  {
    label: i18n.t("Negative"),
    value: "negative",
  },
];

export const adjustmentTypeOptions = [
  { label: i18n.t("Stock Received"), value: "received" },
  { label: i18n.t("Inventory Re-count"), value: "inventory-re-count" },
  { label: i18n.t("Damaged"), value: "damaged" },
  { label: i18n.t("Theft"), value: "theft" },
  { label: i18n.t("Loss"), value: "loss" },
  { label: i18n.t("Restock Return"), value: "restock-return" },
  { label: i18n.t("Batch Shift"), value: "transfer" },
  { label: i18n.t("Internal Transfer"), value: "internal-transfer" },
  { label: i18n.t("Billing"), value: "billing" },
  { label: i18n.t("PO Return"), value: "return-po" },
];
export const batchOptions = [
  { label: i18n.t("All"), value: "" },
  { label: i18n.t("Available Stocks"), value: "available" },
  { label: i18n.t("Zero Stocks"), value: "zero" },
  { label: i18n.t("Negative Stocks"), value: "negative" },
];

export const expiryOptions: Option[] = [
  {
    label: i18n.t("Expired"),
    value: "expired",
  },
  {
    label: i18n.t("Expiring Soon"),
    value: "expiring-soon",
  },
];

export const nielsenOptions: Option[] = [
  {
    label: i18n.t("Active"),
    value: "true",
  },
  {
    label: i18n.t("Inactive"),
    value: "false",
  },
];

export const zatcaOptions: Option[] = [
  {
    label: i18n.t("Enabled"),
    value: "true",
  },
  {
    label: i18n.t("Disabled"),
    value: "false",
  },
];

export const deviceZatcaOptions: Option[] = [
  {
    label: i18n.t("Enabled"),
    value: "active",
  },
  {
    label: i18n.t("Disabled"),
    value: "inactive",
  },
  // {
  //   label: i18n.t("Revoked"),
  //   value: "revoked",
  // },
  {
    label: i18n.t("Expired"),
    value: "expired",
  },
];

export const Constants = {
  PHONENUMBER_LIMIT: 12,
};

export const USER_TYPES = {
  SUPERADMIN: "app:super-admin",
  ADMIN: "app:admin",
  CASHIER: "app:cashier",
};

export const OPERATORS = {
  equals: "eq",
  not_equals: "ne",
};

export const vatOptions: DropdownOptions[] = [
  {
    label: "0%",
    value: "0",
  },
  {
    label: "15%",
    value: "15",
  },
];

export const sortOptions: SortOption[] = [
  {
    label: i18n.t("Newest"),
    value: "desc",
  },
  {
    label: i18n.t("Oldest"),
    value: "asc",
  },
];

export const reportsSortOptions: ReportSortOption[] = [
  {
    label: i18n.t("Newest"),
    value: "desc",
  },
  {
    label: i18n.t("Oldest"),
    value: "asc",
  },
  // {
  //   label: i18n.t("Order Count"),
  //   value: "orderCount",
  // },
  // {
  //   label: i18n.t("Total Sales"),
  //   value: "totalSales",
  // },
  // {
  //   label: i18n.t("Discount"),
  //   value: "discount",
  // },
  // {
  //   label: i18n.t("Refunded Amount"),
  //   value: "refundedAmount",
  // },
];

export const unitOptions = [
  {
    label: i18n.t("Per Item"),
    value: "perItem",
  },
  {
    label: i18n.t("Per Gram"),
    value: "perGram",
  },
  {
    label: i18n.t("Per Kilogram"),
    value: "perKilogram",
  },
  {
    label: i18n.t("Per Meter"),
    value: "perMeter",
  },
  {
    label: i18n.t("Per Centimeter"),
    value: "perCentimeter",
  },
  {
    label: i18n.t("Per Foot"),
    value: "perFoot",
  },
  {
    label: i18n.t("Per Litre"),
    value: "perLitre",
  },
  {
    label: i18n.t("Per Ounce"),
    value: "perOunce",
  },
];

export const unitOptionsRestaurant = [
  {
    label: i18n.t("Per Item"),
    value: "perItem",
  },
  // {
  //   label: i18n.t("Per Gram"),
  //   value: "perGram",
  // },
  // {
  //   label: i18n.t("Per Kilogram"),
  //   value: "perKilogram",
  // },

  // {
  //   label: i18n.t("Per Litre"),
  //   value: "perLitre",
  // },
  // {
  //   label: i18n.t("Per Ounce"),
  //   value: "perOunce",
  // },
];

export const UNIT_VALUES: any = {
  perItem: "PER ITEM",
  perLitre: `PER LITRE`,
  perGram: `PER GRAM`,
  perKilogram: `PER KG`,
  perMeter: `PER METER`,
  perCentimeter: `PER CENTIMETER`,
  perFoot: `PER FOOT`,
  perOunce: `PER OUNCE`,
};

export const companyOptions: Option[] = [
  {
    label: i18n.t("All"),
    value: "all",
  },
  {
    label: i18n.t("Lulu Hypermarket"),
    value: "luluHypermarket",
  },
  {
    label: i18n.t("Al Sadhan Supermarket"),
    value: "alSadhanSupermarket",
  },
];

export const industryOptions: Option[] = [
  {
    label: i18n.t("Retail"),
    value: "retail",
  },
  {
    label: i18n.t("Restaurant"),
    value: "restaurant",
  },
];

export const kitchenFacingCategoryOptions: Option[] = [
  {
    label: i18n.t("Veg"),
    value: "veg",
  },
  {
    label: i18n.t("Non-veg"),
    value: "non-veg",
  },
];

export enum PO_GRN_STATUS {
  OPEN = "open",
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  OVERDUE = "overdue",
  PARTIALLY_RECEIVED = "partiallyReceived",
  RETURN = "return",
}

export enum API_ERRORS {
  BADREQUEST = "Bad Request",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOTFOUND = "Not Found",
  INTERNALSERVERERROR = "Internal Server Error",
  // Add more as needed
}

export const getCartItemUnit: any = {
  perItem: "",
  perLitre: ` L`,
  perGram: ` G`,
  perKilogram: ` KG`,
  perOunce: ` OUNCE`,
  perMeter: ` M`,
  perCentimeter: ` CM`,
  perFoot: ` FT`,
};

export const getUnitName: any = {
  perItem: "",
  perLitre: ` / L`,
  perGram: ` / G`,
  perKilogram: ` / KG`,
  perOunce: ` / OUNCE`,
  perMeter: ` / M`,
  perCentimeter: ` / CM`,
  perFoot: ` / FT`,
};
export const ORDER_TYPES_OPTIONS = [
  { value: i18n.t("Walk-in"), key: "walk-in" },
  // { value: "Delivery", key: "delivery" },
];

export const NO_OF_RECEIPT_PRINT_OPTIONS = [
  { value: "1", key: "1" },
  { value: "2", key: "2" },
  // { value: "3", key: "3" },
  // { value: "4", key: "4" },
  // { value: "5", key: "5" },
];

export const OTHER_ORDER_TYPE_LIST = ["Walk-in", "Delivery"];
export const PRINT_TYPE_LIST = [
  { value: i18n.t("Complete With print"), key: "with-print" },
  { value: i18n.t("Complete without print"), key: "without-print" },
];

export const PAYMENT_TYPE_LIST = ["Card", "Cash", "Wallet"];

export const DEFAULT_PAYMENT_TYPES = [
  { _id: 0, name: "Cash", status: true },
  { _id: 1, name: "Card", status: true },
  { _id: 2, name: "Wallet", status: false },
  { _id: 3, name: "Credit", status: false },
  { _id: 4, name: "HungerStation", status: false },
  { _id: 5, name: "Jahez", status: false },
  { _id: 6, name: "ToYou", status: false },
  { _id: 7, name: "Barakah", status: false },
  { _id: 8, name: "Careem", status: false },
  { _id: 9, name: "Ninja", status: false },
  { _id: 10, name: "The Chef", status: false },
  { _id: 11, name: "Tamara", status: false },
  { _id: 12, name: "Bank Transfer", status: false },
  { _id: 13, name: "Tabby", status: false },
  { _id: 14, name: "Neoleap External", status: false },
];

export const CARD_OPTIONS_LIST = [
  { value: i18n.t("NeoLeap"), key: "inbuilt-nfc" },
  { value: i18n.t("Manual"), key: "manual" },
];

export const CompanyRestaurantChannels = [
  { name: "dine-in", status: true },
  { name: "takeaway", status: true },
  { name: "pickup", status: true },
  { name: "delivery", status: true },
];

export const CompanyOtherChannels = [
  { name: "walk-in", status: true },
  { name: "pickup", status: true },
  { name: "delivery", status: true },
];

export const RestaurantChannels = [
  { _id: 0, name: "dine-in", status: true },
  { _id: 1, name: "takeaway", status: true },
  { _id: 2, name: "pickup", status: true },
  { _id: 3, name: "delivery", status: true },
];

export const OtherChannels = [
  { _id: 0, name: "walk-in", status: true },
  { _id: 1, name: "pickup", status: true },
  { _id: 2, name: "delivery", status: true },
];

export const ChannelsName: any = {
  "dine-in": "Dine-in",
  takeaway: "Takeaway",
  "walk-in": "Walk-in",
  pickup: "Pickup",
  delivery: "Delivery",
  "Dine-in": "Dine-in",
  Takeaway: "Takeaway",
  "Walk-in": "Walk-in",
  Pickup: "Pickup",
  Delivery: "Delivery",
};

export const ChannelsForRestaurant = [
  {
    label: i18n.t("Dine-in"),
    value: "dine-in",
  },
  {
    label: i18n.t("Takeaway"),
    value: "takeaway",
  },
  {
    label: i18n.t("Pickup"),
    value: "pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "delivery",
  },
];

export const ChannelsOptions = [
  {
    label: i18n.t("Dine-in"),
    value: "dine-in",
  },
  {
    label: i18n.t("Takeaway"),
    value: "takeaway",
  },
  {
    label: i18n.t("Pickup"),
    value: "pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "delivery",
  },
];

export const ChannelsForOthers = [
  {
    label: i18n.t("Walk-in"),
    value: "walk-in",
  },
  {
    label: i18n.t("Pickup"),
    value: "pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "delivery",
  },
];

export const SuperAdminOrderTypeOptions = [
  {
    label: i18n.t("Walk-in"),
    value: "Walk-in",
  },
  {
    label: i18n.t("Dine-in"),
    value: "Dine-in",
  },
  {
    label: i18n.t("Takeaway"),
    value: "Takeaway",
  },
  {
    label: i18n.t("Pickup"),
    value: "Pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "Delivery",
  },
];

export const RestaurantOrderTypeOptions = [
  {
    label: i18n.t("Walk-in"),
    value: "Walk-in",
  },
  {
    label: i18n.t("Dine-in"),
    value: "Dine-in",
  },
  {
    label: i18n.t("Takeaway"),
    value: "Takeaway",
  },
  {
    label: i18n.t("Pickup"),
    value: "Pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "Delivery",
  },
];

export const OtherOrderTypeOptions = [
  {
    label: i18n.t("Walk-in"),
    value: "Walk-in",
  },
  {
    label: i18n.t("Pickup"),
    value: "Pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "Delivery",
  },
];

export const OtherChannelsOptions = [
  {
    label: i18n.t("Walk-in"),
    value: "walk-in",
  },
  {
    label: i18n.t("Pickup"),
    value: "pickup",
  },
  {
    label: i18n.t("Delivery"),
    value: "delivery",
  },
];

export const Preferrence = [
  { _id: "1", label: i18n.t("Dairy-free"), value: "dairy-free" },
  { _id: "2", label: i18n.t("Gluten-free"), value: "gluten-free" },
  { _id: "3", label: i18n.t("Halal"), value: "halal" },
  {
    _id: "4",
    label: i18n.t("Kosher"),
    value: "kosher",
  },
  {
    _id: "5",
    label: i18n.t("Nut-free"),
    value: "nut-free",
  },
  {
    _id: "6",
    label: i18n.t("Vegan"),
    value: "vegan",
  },
  {
    _id: "7",
    label: i18n.t("Vegetarian"),
    value: "vegetarian",
  },
];

export const Items = [
  {
    label: i18n.t("Celery"),
    value: "celery",
  },
  {
    label: i18n.t("Crustaceans"),
    value: "crustaceans",
  },
  {
    label: i18n.t("Eggs"),
    value: "eggs",
  },
  {
    label: i18n.t("Fish"),
    value: "fish",
  },
  {
    label: i18n.t("Lupin"),
    value: "lupin",
  },
  {
    label: i18n.t("Milk"),
    value: "milk",
  },
  {
    label: i18n.t("Molluscs"),
    value: "molluscs",
  },
  {
    label: i18n.t("Mustard"),
    value: "mustard",
  },
  {
    label: i18n.t("Peanuts"),
    value: "peanuts",
  },
  {
    label: i18n.t("Sesame"),
    value: "sesame",
  },
  {
    label: i18n.t("Soy"),
    value: "soy",
  },
  {
    label: i18n.t("Sulphites"),
    value: "sulphites",
  },
  {
    label: i18n.t("Tree-nuts"),
    value: "tree nuts",
  },
];

export const VoidAndCompType: Option[] = [
  {
    label: i18n.t("Void"),
    value: "void",
  },
  {
    label: i18n.t("Comp"),
    value: "comp",
  },
];

export const printerFilterOption: Option[] = [
  {
    label: i18n.t("Assigned"),
    value: "assigned",
  },
  {
    label: i18n.t("Not Assigned"),
    value: "notAssigned",
  },
];

export const floorTypeOptions: Option[] = [
  {
    label: i18n.t("Level 0"),
    value: "floor0",
  },
  {
    label: i18n.t("Level 1"),
    value: "floor1",
  },
  {
    label: i18n.t("Level 2"),
    value: "floor2",
  },
  {
    label: i18n.t("Level 3"),
    value: "floor3",
  },
  {
    label: i18n.t("Level 4"),
    value: "floor4",
  },
];
