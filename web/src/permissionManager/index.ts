import { User } from "src/types/user";
import { USER_TYPES } from "src/utils/constants";

export enum MoleculeType {
  // global product
  "global-product:create" = "global-product:create",
  "global-product:read" = "global-product:read",
  "global-product:update" = "global-product:update",
  "global-product:import" = "global-product:import",
  "global-product:manage" = "global-product:manage",

  // global categories
  "global-category:create" = "global-category:create",
  "global-category:read" = "global-category:read",
  "global-category:update" = "global-category:update",
  "global-category:manage" = "global-category:manage",

  // brands
  "brand:create" = "brand:create",
  "brand:read" = "brand:read",
  "brand:update" = "brand:update",
  "brand:import" = "brand:import",
  "brand:manage" = "brand:manage",

  // platform users
  "platform-user:create" = "platform-user:create",
  "platform-user:read" = "platform-user:read",
  "platform-user:readOwn" = "platform-user:readOwn",
  "platform-user:update" = "platform-user:update",
  "platform-user:manage" = "platform-user:manage",
  "platform-user:onboard" = "platform-user:onboard",
  "platform-user:delete" = "platform-user:delete",

  // businessType
  "business-type:create" = "business-type:create",
  "business-type:read" = "business-type:read",
  "business-type:update" = "business-type:update",
  "business-type:manage" = "business-type:manage",

  // paymentType
  "payment-type:create" = "payment-type:create",
  "payment-type:read" = "payment-type:read",
  "payment-type:update" = "payment-type:update",
  "payment-type:manage" = "payment-type:manage",
  "payment-type:delete" = "payment-type:delete",

  // vatRate
  "vat-rate:create" = "vat-rate:create",
  "vat-rate:read" = "vat-rate:read",
  "vat-rate:update" = "vat-rate:update",
  "vat-rate:manage" = "vat-rate:manage",

  // apkManagement
  "apk-management:create" = "apk-management:create",
  "apk-management:read" = "apk-management:read",
  "apk-management:manage" = "apk-management:manage",
  "apk-management:delete" = "apk-management:delete",

  // sync-requests
  "sync-request:read" = "sync-request:read",

  "audit-log:read" = "audit-log:read",

  // role
  "role:create" = "role:create",
  "role:read" = "role:read",
  "role:update" = "role:update",
  "role:manage" = "role:manage",

  // company
  "company:create" = "company:create",
  "company:read" = "company:read",
  "company:update" = "company:update",
  "company:delete" = "company:delete",
  "company:manage" = "company:manage",

  // Wallet
  "wallet:read" = "wallet:read",
  "wallet:update" = "wallet:update",
  "wallet:manage" = "wallet:manage",

  // products
  "product:create" = "product:create",
  "product:read" = "product:read",
  "product:update" = "product:update",
  "product:batching" = "product:batching",
  "product:import" = "product:import",
  "product:manage" = "product:manage",
  "product:delete" = "product:delete",

  // stock history
  "stock-history:read" = "stock-history:read",
  "stock-history:update" = "stock-history:update",
  "stock-history:manage" = "stock-history:manage",

  //vendor
  "vendor:create" = "vendor:create",
  "vendor:read" = "vendor:read",
  "vendor:update" = "vendor:update",
  "vendor:manage" = "vendor:manage",

  //vendor-product
  "vendor-product:create" = "vendor-product:create",
  "vendor-product:read" = "vendor-product:read",
  "vendor-product:update" = "vendor-product:update",
  "vendor-product:delete" = "vendor-product:delete",
  "vendor-product:manage" = "vendor-product:manage",

  //batch
  "batch:create" = "batch:create",
  "batch:read" = "batch:read",
  "batch:update" = "batch:update",
  "batch:manage" = "batch:manage",

  //po
  "po:create" = "po:create",
  "po:read" = "po:read",
  "po:update" = "po:update",
  "po:import" = "po:import",
  "po:manage" = "po:manage",

  // //grn
  // "grn:create" = "grn:create",
  // "grn:read" = "grn:read",
  // "grn:update" = "grn:update",
  // "grn:imgrnrt" = "grn:import",
  // "grn:manage" = "grn:manage",

  //cashdrawer-txn
  "cash-drawer-txn:create" = "cash-drawer-txn:create",
  "cash-drawer-txn:read" = "cash-drawer-txn:read",
  "cash-drawer-txn:update" = "cash-drawer-txn:update",
  "cash-drawer-txn:manage" = "cash-drawer-txn:manage",

  //App-Data
  "app-data:manage" = "app-data:manage",
  "app-data:read" = "app-data:read",

  // category
  "category:create" = "category:create",
  "category:read" = "category:read",
  "category:update" = "category:update",
  "category:manage" = "category:manage",

  // collection
  "collection:create" = "collection:create",
  "collection:read" = "collection:read",
  "collection:update" = "collection:update",
  "collection:manage" = "collection:manage",

  // bulk-price-update
  "bulk-price-update:create" = "bulk-price-update:create",
  "bulk-price-update:read" = "bulk-price-update:read",
  "bulk-price-update:manage" = "bulk-price-update:manage",

  //Device Settings
  "device-settings:manage" = "device-settings:manage",
  "device-settings:update" = "device-settings:update",
  "device-settings:read" = "device-settings:read",

  //Internal Transfer
  "internal-transfer:manage" = "internal-transfer:manage",
  "internal-transfer:create" = "internal-transfer:create",
  "internal-transfer:read" = "internal-transfer:read",
  "internal-transfer:update" = "internal-transfer:update",

  // custom charge
  "custom-charge:read" = "custom-charge:read",
  "custom-charge:create" = "custom-charge:create",
  "custom-charge:update" = "custom-charge:update",
  "custom-charge:manage" = "custom-charge:manage",

  // modifiers
  "modifier:create" = "modifier:create",
  "modifier:read" = "modifier:read",
  "modifier:update" = "modifier:update",
  "modifier:manage" = "modifier:manage",
  "modifier:delete" = "modifier:delete",

  // ads
  "ads:read" = "ads:read",
  "ads:create" = "ads:create",
  "ads:update" = "ads:update",
  "ads:delete" = "ads:delete",
  "ads:manage" = "ads:manage",

  // customer
  "customer:create" = "customer:create",
  "customer:read" = "customer:read",
  "customer:update" = "customer:update",
  "customer:manage" = "customer:manage",

  // timed-event
  "timed-event:create" = "timed-event:create",
  "timed-event:read" = "timed-event:read",
  "timed-event:update" = "timed-event:update",
  "timed-event:manage" = "timed-event:manage",
  "timed-event:delete" = "timed-event:delete",

  // customer credit
  "customer-credit:allowed" = "customer-credit:allowed",
  "customer-credit:blocked" = "customer-credit:blocked",
  "customer-credit:blacklist" = "customer-credit:blacklist",
  "customer-credit:pay" = "customer-credit:pay",
  "customer-credit:manage" = "customer-credit:manage",

  // group
  "group:create" = "group:create",
  "group:read" = "group:read",
  "group:update" = "group:update",
  "group:delete" = "group:delete",
  "group:manage" = "group:manage",

  // location
  "location:create" = "location:create",
  "location:read" = "location:read",
  "location:update" = "location:update",
  "location:manage" = "location:manage",

  // receipt template
  "receipt-template:read" = "receipt-template:read",
  "receipt-template:update" = "receipt-template:update",
  "receipt-template:manage" = "receipt-template:manage",

  //Quick Items
  "quick-items:create" = "quick-items:create",
  "quick-items:read" = "quick-items:read",
  "quick-items:delete" = "quick-items:delete",
  "quick-items:manage" = "quick-items:manage",

  // device
  "device:create" = "device:create",
  "device:read" = "device:read",
  "device:update" = "device:update",
  "device:manage" = "device:manage",

  // users
  "user:create" = "user:create",
  "user:read" = "user:read",
  "user:readOwn" = "user:readOwn",
  "user:update" = "user:update",
  "user:manage" = "user:manage",
  "user:onboard" = "user:onboard",
  "user:delete" = "user:delete",

  // coupon
  "coupon:create" = "coupon:create",
  "coupon:read" = "coupon:read",
  "coupon:update" = "coupon:update",
  "coupon:manage" = "coupon:manage",

  // promotion
  "promotion:create" = "promotion:create",
  "promotion:read" = "promotion:read",
  "promotion:update" = "promotion:update",
  "promotion:manage" = "promotion:manage",

  // account|user
  "account:read" = "account:read",
  "account:update" = "account:update",
  "account:manage" = "account:manage",
  "company:loyalty-setting" = "company:loyalty-setting",
  "company:credit-setting" = "company:credit-setting",
  "company:order-type" = "company:order-type",

  // profile
  "profile:read" = "profile:read",
  "profile:update" = "profile:update",
  "profile:manage" = "profile:manage",

  // dashboard
  "dashboard:read" = "dashboard:read",
  "dashboard:manage" = "dashboard:manage",

  // section-table
  "section-table:create" = "section-table:create",
  "section-table:read" = "section-table:read",
  "section-table:update" = "section-table:update",
  "section-table:manage" = "section-table:manage",

  // stocktake
  "stocktake:create" = "stocktake:create",
  "stocktake:read" = "stocktake:read",
  "stocktake:update" = "stocktake:update",
  "stocktake:manage" = "stocktake:manage",
  "stocktake:request" = "stocktake:request",
  "stocktake:approve" = "stocktake:approve",

  // void-comp
  "void-comp:create" = "void-comp:create",
  "void-comp:read" = "void-comp:read",
  "void-comp:update" = "void-comp:update",
  "void-comp:manage" = "void-comp:manage",

  // kitchen
  "kitchen:create" = "kitchen:create",
  "kitchen:read" = "kitchen:read",
  "kitchen:update" = "kitchen:update",
  "kitchen:manage" = "kitchen:manage",

  // menu
  "menu:create" = "menu:create",
  "menu:read" = "menu:read",
  "menu:update" = "menu:update",
  "menu:manage" = "menu:manage",

  // expense
  "expense:create" = "expense:create",
  "expense:read" = "expense:read",
  "expense:update" = "expense:update",
  "expense:manage" = "expense:manage",

  // accounting
  "accounting:create" = "accounting:create",
  "accounting:read" = "accounting:read",
  "acounting:update" = "acounting:update",
  "accounting:manage" = "accounting:manage",

  // boxes-crates
  "boxes-crates:create" = "boxes-crates:create",
  "boxes-crates:read" = "boxes-crates:read",
  "boxes-crates:update" = "boxes-crates:update",
  "boxes-crates:manage" = "boxes-crates:manage",

  // volume-pricing
  "volume-pricing:create" = "volume-pricing:create",
  "volume-pricing:read" = "volume-pricing:read",
  "volume-pricing:update" = "volume-pricing:update",
  "volume-pricing:manage" = "volume-pricing:manage",

  //orders
  "order:read" = "order:read",
  "order:create" = "order:create",
  "order:update" = "order:update",
  "order:print" = "order:print",
  "order:send-receipt" = "order:send-receipt",
  "order:issue-refund" = "order:issue-refund",
  "order:manage" = "order:manage",

  // reports
  "report:companies:read" = "report:companies:read",
  "report:product:read" = "report:product:read",
  "report:categories:read" = "report:categories:read",
  "report:shift-and-cash-drawer:read" = "report:shift-and-cash-drawer:read",
  "report:payment-method:read" = "report:payment-method:read",
  "report:sales:read" = "report:sales:read",
  "report:sales-summary:read" = "report:sales-summary:read",
  "report:inventory:read" = "report:inventory:read",
  "report:inventory-by-location:read" = "report:inventory-by-location:read",
  "report:inventory-change:read" = "report:inventory-change:read",
  "report:variant:read" = "report:variant:read",
  "report:vat:read" = "report:vat:read",
  "report:ads:read" = "report:ads:read",
  "report:void:read" = "report:void:read",
  "report:comp:read" = "report:comp:read",
  "report:manage" = "report:manage",

  "package:read" = "package:read",
  "package:manage" = "package:manage",
  "package:create" = "package:create",
  "package:update" = "package:update",

  "subscription:read" = "subscription:read",
  "subscription:manage" = "subscription:manage",
  "subscription:create" = "subscription:create",
  "subscription:update" = "subscription:update",

  // zatca
  "zatca:read" = "zatca:read",
  "zatca:manage" = "zatca:manage",
}

export function PermissionManagerBuilder(user: User) {
  function canAccess(molecule: MoleculeType) {
    if (!user) return false;

    if (user.userType === USER_TYPES.SUPERADMIN && !user.roleRef) {
      const screen = molecule.split(":")[0];
      const superAdminPermission = screen + ":manage";
      return user?.permissions?.includes(superAdminPermission);
    } else {
      return user?.permissions?.includes(molecule);
    }
  }
  return canAccess;
}
