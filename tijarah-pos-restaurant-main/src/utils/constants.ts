import { StatusBar } from "react-native";
import { LanguageCodes } from "../types/language-types";

export const DEFAULT_PADDING = 16;
export const STATUSBAR_HEIGHT = StatusBar.currentHeight;
export const ROW_SPACING = 5;
export const ROW_RADIUS = 8;
export const SALT_ROUNDS = 5;

export const MMKV_ENCRYPTION_KEY = "oHEs9rvCDTjKdfyRJ0DPQ5jz3EFIpVdU";
export const APPLICATION_ID = "com.tijarah360.pos";
export const SUNMI_APPLICATION_ID = "com.tijarah360.pos";
export const APP_STORE_LINK = `https://play.google.com/store/apps/details?id=${APPLICATION_ID}`;
export const SUNMI_APP_STORE_LINK = `market://woyou.market/appDetail?packageName=${SUNMI_APPLICATION_ID}&isUpdate=${true}`;
export const TIJARAH_LOGO = require("../components/assets/tijarah-logo.png");
export const LANG_FLAGS_EN = require("../components/assets/flag-en.png");
export const LANG_FLAGS_AR = require("../components/assets/flag-ar.png");
export const LANG_FLAGS_UR = require("../components/assets/flag-ur.png");
export const PROFILE_PLACEHOLDER = require("../components/assets/Profile.png");
export const PRODUCT_PLACEHOLDER = require("../components/assets/product-placeholder.png");
export const DINEIN_PRODUCT_PLACEHOLDER = require("../components/assets/dinein-product-placeholder.png");
export const COMPANY_PLACEHOLDER = require("../components/assets/company-placeholder.png");
export const QUICK_ITEMS_PLACEHOLDER = require("../components/assets/quick-items-placeholder.png");
export const RETAIL_CART_IMAGE = require("../components/assets/retail.jpg");
export const RESTAURANT_CART_IMAGE = require("../components/assets/restaurant.jpg");
export const PLACEHOLDER_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/800px-No-Image-Placeholder.svg.png";

export const SYNC_DB = {
  PULL: "pull",
  PUSH: "push",
};

export const PROVIDER_NAME = {
  CASH: "cash",
  CARD: "card",
  WALLET: "wallet",
  CREDIT: "credit",
  STC: "stcpay",
  Nearpay: "nearpay",
};

export const SPECIAL_EVENT_NAME = {
  DOB: "dateOfBirth",
  ANNIVERSARY: "anniversary",
  OTHER: "other",
};

export const USER_TYPES = {
  SUPERADMIN: "app:super-admin",
  ADMIN: "app:admin",
  CASHIER: "app:cashier",
  DRIVER: "app:driver",
  WAITER: "app:waiter",
};

export const langs = [
  {
    code: "en" as LanguageCodes,
    name: "English",
    flag: "ABC",
  },
  {
    code: "ar" as LanguageCodes,
    name: "عربي",
    flag: "ABC",
  },
  {
    code: "ur" as LanguageCodes,
    name: "اردو",
    flag: "ABC",
  },
];

export const ORDER_TYPES_OPTIONS = [
  { value: "Walk-in", key: "walk-in" },
  // { value: "Delivery", key: "delivery" },
];

export const NO_OF_RECEIPT_PRINT_OPTIONS = [
  { value: "1", key: "1" },
  { value: "2", key: "2" },
  // { value: "3", key: "3" },
  // { value: "4", key: "4" },
  // { value: "5", key: "5" },
];

export const COMPLETE_BTN_OPTIONS = [
  { value: "Complete with print", key: "with-print" },
  { value: "Complete without print", key: "without-print" },
];

export const UNIT_OPTIONS = [
  { value: "Per Item", key: "perItem" },
  { value: "Per Gram", key: "perGram" },
  { value: "Per Kilogram", key: "perKilogram" },
  { value: "Per Litre", key: "perLitre" },
  { value: "Per Ounce", key: "perOunce" },
];

export const getUnitTitle: any = {
  perItem: "",
  perLitre: `PER LITRE`,
  perGram: `PER GRAM`,
  perKilogram: `PER KG`,
  perOunce: `PER OUNCE`,
};

export const getUnitTitleValue: any = {
  perItem: "QUANTITY",
  perLitre: `VOLUME IN LITRE`,
  perGram: `WEIGHT IN GRAM`,
  perKilogram: `WEIGHT IN KG`,
  perOunce: `WEIGHT IN OUNCE`,
};

export const getUnitName: any = {
  perItem: "",
  perLitre: ` / L`,
  perGram: ` / G`,
  perKilogram: ` / KG`,
  perOunce: ` / OUNCE`,
};

export const getUnitFullName: any = {
  perItem: "",
  perLitre: ` / Litre`,
  perGram: ` / Gram`,
  perKilogram: ` / Kg`,
  perOunce: ` / Ounce`,
};

export const getCartItemUnit: any = {
  perItem: "",
  perLitre: ` Litre`,
  perGram: ` Gram`,
  perKilogram: ` Kg`,
  perOunce: ` Ounce`,
};

export const PAYMENT_TYPES_LIST = [
  { name: "Cash" },
  { name: "Card" },
  { name: "Wallet" },
  { name: "Credit" },
];

export const RESTAURANT_ORDER_TYPE_LIST = [
  "Dine-in",
  "Takeaway",
  "Pickup",
  "Delivery",
];

export const OTHER_ORDER_TYPE_LIST = ["Walk-in", "Pickup", "Delivery"];

export const CARD_OPTIONS_LIST = [
  { value: "NeoLeap", key: "inbuilt-nfc" },
  { value: "Manual", key: "manual" },
];

export const rowsPerPage = 20;
export const orderRowsPerPage = 10;

export const BARCODE_PAPER_SIZES = [
  {
    key: "50 mm,38 mm",
    value: `2" x 1.5" (50mm x 38mm)`,
  },
  {
    key: "50 mm,25 mm",
    value: `2" x 1" (50mm x 25mm)`,
  },
  {
    key: "50 mm,50 mm",
    value: `2" x 2" (50mm x 50mm)`,
  },
  {
    key: "75 mm,38 mm",
    value: `3" x 1.5" (75mm x 38mm)`,
  },
  {
    key: "75 mm,25 mm",
    value: `3" x 1" (75mm x 25mm)`,
  },
  {
    key: "75 mm,50 mm",
    value: `3" x 2" (75mm x 50mm)`,
  },
];

export const BARCODE_TEMPLATE_FORMAT_SIZES = [
  {
    key: "first",
    value: "First",
  },
  // {
  //   key: "second",
  //   value: "Second",
  // },
];

export const BARCODE_TEMPLATE_LANGUAGE = [
  {
    key: "en",
    value: "English",
  },
  {
    key: "ar",
    value: "Arabic",
  },
];

export const kitchenFacingCategoryOptions = [
  { key: "veg", value: "Veg" },
  { key: "non-veg", value: "Non-veg" },
];

export const ContainsOptions = [
  {
    value: "Veg",
    key: "veg",
  },
  {
    value: "Non-Veg",
    key: "non-veg",
  },
  {
    value: "Egg",
    key: "egg",
  },
];

export const ContainsName: any = {
  veg: "Veg",
  "non-veg": "Non-Veg",
  egg: "Egg",
};

export const ChannelsOptions = [
  {
    label: "Dine-in",
    value: "dine-in",
  },
  {
    label: "Takeaway",
    value: "takeaway",
  },
  {
    label: "Pickup",
    value: "pickup",
  },
  {
    label: "Delivery",
    value: "delivery",
  },
];

export const OtherChannelsOptions = [
  {
    label: "Walk-in",
    value: "walk-in",
  },
  {
    label: "Pickup",
    value: "pickup",
  },
  {
    label: "Delivery",
    value: "delivery",
  },
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

export const PreferenceOptions = [
  {
    label: "Dairy-free",
    value: "dairy-free",
  },
  {
    label: "Gluten-free",
    value: "gluten-free",
  },
  {
    label: "Halal",
    value: "halal",
  },
  {
    label: "Kosher",
    value: "kosher",
  },
  {
    label: "Nut-free",
    value: "nut-free",
  },
  {
    label: "Vegan",
    value: "vegan",
  },
  {
    label: "Vegetarian",
    value: "vegetarian",
  },
];

export const PreferenceName: any = {
  "dairy-free": "Dairy-free",
  "gluten-free": "Gluten-free",
  halal: "Halal",
  kosher: "Kosher",
  "nut-free": "Nut-free",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
};

export const DietryTypeOptions = [
  {
    label: "Celery",
    value: "celery",
  },
  {
    label: "Crustaceans",
    value: "crustaceans",
  },
  {
    label: "Eggs",
    value: "eggs",
  },
  {
    label: "Fish",
    value: "fish",
  },
  {
    label: "Lupin",
    value: "lupin",
  },
  {
    label: "Milk",
    value: "milk",
  },
  {
    label: "Molluscs",
    value: "molluscs",
  },
  {
    label: "Mustard",
    value: "mustard",
  },
  {
    label: "Peanuts",
    value: "peanuts",
  },
  {
    label: "Sesame",
    value: "sesame",
  },
  {
    label: "Soy",
    value: "soy",
  },
  {
    label: "Sulphites",
    value: "sulphites",
  },
  {
    label: "Tree-nuts",
    value: "tree nuts",
  },
];

export const DietryTypeName: any = {
  celery: "Celery",
  crustaceans: "Crustaceans",
  eggs: "Eggs",
  fish: "Fish",
  lupin: "Lupin",
  milk: "Milk",
  molluscs: "Molluscs",
  mustard: "Mustard",
  peanuts: "Peanuts",
  sesame: "Sesame",
  soy: "Soy",
  sulphites: "Sulphites",
  "tree nuts": "Tree-nuts",
};

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
