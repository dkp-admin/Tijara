export const platformPermissions = [
  {
    label: "Dashboard",
    permissions: [
      {
        label: "Read",
        value: "dashboard:read",
        key: "platform:dashboard:read",
      },
    ],
    key: "platform:dashboard",
  },
  {
    label: "Companies Report",
    permissions: [
      {
        label: "Read",
        value: "report:companies:read",
        key: "platform:report:companies:read",
      },
    ],
    key: "platform:report:companies",
  },
  {
    label: "Product Report",
    permissions: [
      {
        label: "Read",
        value: "report:product:read",
        key: "platform:report:product:read",
      },
    ],
    key: "platform:report:product",
  },
  {
    label: "Categories Report",
    permissions: [
      {
        label: "Read",
        value: "report:categories:read",
        key: "platform:report:categoris:read",
      },
    ],
    key: "platform:report:categories",
  },
  {
    label: "Shift and cash drawer Report",
    permissions: [
      {
        label: "Read",
        value: "report:shift-and-cash-drawer:read",
        key: "platform:report:shift-and-cash-drawer:read",
      },
    ],
    key: "platform:report:shift-and-cash-drawer",
  },
  {
    label: "Payment method Report",
    permissions: [
      {
        label: "Read",
        value: "report:payment-method:read",
        key: "platform:report:payment-method:read",
      },
    ],
    key: "platform:report:payment-method",
  },
  {
    label: "Sales Report",
    permissions: [
      {
        label: "Read",
        value: "report:sales:read",
        key: "platform:report:sales",
      },
    ],
    key: "platform:report:sales",
  },
  {
    label: "Sales Summary Report",
    permissions: [
      {
        label: "Read",
        value: "report:sales-summary:read",
        key: "platform:report:sales-summary:read",
      },
    ],
    key: "platform:report:sales-summary",
  },
  {
    label: "Inventory Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory:read",
        key: "platform:report:inventory:read",
      },
    ],
    key: "platform:report:inventory",
  },
  {
    label: "Inventory By Location Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory-by-location:read",
        key: "platform:report:inventory-by-location:read",
      },
    ],
    key: "platform:report:inventory-by-location",
  },
  {
    label: "Inventory Change Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory-change:read",
        key: "platform:report:inventory-change:read",
      },
    ],
    key: "platform:report:inventory-change",
  },
  {
    label: "Variant-Box Report",
    permissions: [
      {
        label: "Read",
        value: "report:variant:read",
        key: "platform:report:variant:read",
      },
    ],
    key: "platform:report:variant",
  },
  {
    label: "VAT Report",
    permissions: [
      {
        label: "Read",
        value: "report:vat:read",
        key: "platform:report:vat:read",
      },
    ],
    key: "platform:report:vat",
  },
  {
    label: "ADs Report",
    permissions: [
      {
        label: "Read",
        value: "report:ads:read",
        key: "platform:report:ads:read",
      },
    ],
    key: "platform:report:ads",
  },

  {
    label: "Company",
    permissions: [
      { label: "Read", value: "company:read", key: "platform:company:read" },

      {
        label: "Update",
        value: "company:update",
        key: "platform:company:update",
      },
    ],
    key: "platform:company",
  },

  {
    label: "Role",
    permissions: [
      { label: "Read", value: "role:read", key: "platform:role:read" },
      { label: "Create", value: "role:create", key: "platform:role:create" },
      { label: "Update", value: "role:update", key: "platform:role:update" },
    ],
    key: "platform:role",
  },

  {
    label: "Global Product",
    permissions: [
      {
        label: "Read",
        value: "global-product:read",
        key: "platform:global-product:read",
      },
      {
        label: "Create",
        value: "global-product:create",
        key: "platform:global-product:create",
      },
      {
        label: "Update",
        value: "global-product:update",
        key: "platform:global-product:update",
      },
      {
        label: "Import",
        value: "global-product:import",
        key: "platform:global-product:import",
      },
    ],
    key: "platform:global-product",
  },
  {
    label: "Global categories",
    permissions: [
      {
        label: "Read",
        value: "global-category:read",
        key: "platform:global-category:read",
      },
      {
        label: "Create",
        value: "global-category:create",
        key: "platform:global-category:create",
      },
      {
        label: "Update",
        value: "global-category:update",
        key: "platform:global-category:update",
      },
    ],
    key: "platform:global-category",
  },
  {
    label: "Brands",
    permissions: [
      { label: "Read", value: "brand:read", key: "platform:brands:read" },
      { label: "Create", value: "brand:create", key: "platform:brands:create" },
      { label: "Update", value: "brand:update", key: "platform:brands:update" },
      { label: "Import", value: "brand:import", key: "platform:brands:import" },
    ],
    key: "platform:brands",
  },
  {
    label: "Users",
    permissions: [
      { label: "Read", value: "platform-user:read", key: "platform:user:read" },
      {
        label: "ReadOwn",
        value: "user:readOwn",
        key: "platform:user:readOwn",
      },
      {
        label: "Create",
        value: "platform-user:create",
        key: "platform:user:create",
      },
      {
        label: "Update",
        value: "platform-user:update",
        key: "platform:user:update",
      },
    ],
    key: "platform:platform-user",
  },
  {
    label: "Business Type",
    permissions: [
      {
        label: "Read",
        value: "business-type:read",
        key: "platform:business-type:read",
      },
      {
        label: "Create",
        value: "business-type:create",
        key: "platform:business-type:create",
      },
      {
        label: "Update",
        value: "business-type:update",
        key: "platform:business-type:update",
      },
    ],
    key: "platform:business-type",
  },
  {
    label: "VAT Rate",
    permissions: [
      {
        label: "Read",
        value: "vat-rate:read",
        key: "platform:vat-rate:read",
      },
      {
        label: "Create",
        value: "vat-rate:create",
        key: "platform:vat-rate:create",
      },
      {
        label: "Update",
        value: "vat-rate:update",
        key: "platform:vat-rate:update",
      },
    ],
    key: "platform:vat-rate",
  },
  {
    label: "Ads Management",
    permissions: [
      {
        label: "Read",
        value: "ads:read",
        key: "platform:ads:read",
      },
      {
        label: "Create",
        value: "ads:create",
        key: "platform:ads:create",
      },
    ],
    key: "platform:ads",
  },
  {
    label: "APK Management",
    permissions: [
      {
        label: "Read",
        value: "apk-management:read",
        key: "platform:apk-management:read",
      },
      {
        label: "Create",
        value: "apk-management:create",
        key: "platform:apk-management:create",
      },
    ],
    key: "platform:apk-management",
  },

  {
    label: "Account",
    permissions: [
      {
        label: "Read",
        value: "account:read",
        key: "platform:account:read",
      },
      {
        label: "Update",
        value: "account:update",
        key: "platform:account:update",
      },
    ],
    key: "platform:account",
  },
];

export const adminPermissions = [
  {
    label: "Dashboard",
    permissions: [
      { label: "Read", value: "dashboard:read", key: "admin:dashboard:read" },
    ],
    key: "admin:dashboard",
  },
  {
    label: "Product Report",
    permissions: [
      {
        label: "Read",
        value: "report:product:read",
        key: "admin:report:product:read",
      },
    ],
    key: "admin:product-report",
  },
  {
    label: "Categories Report",
    permissions: [
      {
        label: "Read",
        value: "report:categories:read",
        key: "admin:report:categories:read",
      },
    ],
    key: "admin:categories-report",
  },
  {
    label: "Shift and cash drawer Report",
    permissions: [
      {
        label: "Read",
        value: "report:shift-and-cash-drawer:read",
        key: "admin:report:shift-and-cash-drawer:read",
      },
    ],
    key: "admin:shift-and-cash-drawer-report",
  },
  {
    label: "Payment method Report",
    permissions: [
      {
        label: "Read",
        value: "report:payment-method:read",
        key: "admin:report:payment-method:read",
      },
    ],
    key: "admin:payment-method-report",
  },
  {
    label: "Sales Report",
    permissions: [
      {
        label: "Read",
        value: "report:sales:read",
        key: "admin:report:sales:read",
      },
    ],
    key: "admin:sales-report",
  },
  {
    label: "Sales Summary Report",
    permissions: [
      {
        label: "Read",
        value: "report:sales-summary:read",
        key: "admin:report:sales-summary:read",
      },
    ],
    key: "admin:report:sales-summary",
  },
  {
    label: "Inventory Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory:read",
        key: "admin:report:inventory:read",
      },
    ],
    key: "admin:report:inventory",
  },
  {
    label: "Inventory By Location Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory-by-location:read",
        key: "admin:report:inventory-by-location:read",
      },
    ],
    key: "admin:report:inventory-by-location",
  },
  {
    label: "Inventory Change Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory-change:read",
        key: "admin:report:inventory-change:read",
      },
    ],
    key: "admin:report:inventory-change",
  },
  {
    label: "Variant-Box Report",
    permissions: [
      {
        label: "Read",
        value: "report:variant:read",
        key: "admin:report:variant:read",
      },
    ],
    key: "admin:report:variant",
  },
  {
    label: "VAT Report",
    permissions: [
      {
        label: "Read",
        value: "report:vat:read",
        key: "admin:report:vat:read",
      },
    ],
    key: "admin:report:vat",
  },
  {
    label: "ADs Report",
    permissions: [
      {
        label: "Read",
        value: "report:ads:read",
        key: "admin:report:ads:read",
      },
    ],
    key: "admin:report:ads",
  },
  {
    label: "Void Report",
    permissions: [
      {
        label: "Read",
        value: "report:void:read",
        key: "admin:report:void:read",
      },
    ],
    key: "admin:report:void",
  },
  {
    label: "Comp Report",
    permissions: [
      {
        label: "Read",
        value: "report:comp:read",
        key: "admin:report:comp:read",
      },
    ],
    key: "admin:report:comp",
  },
  {
    label: "Orders",
    permissions: [
      { label: "Read", value: "order:read", key: "admin:order:read" },
      { label: "Create", value: "order:create", key: "admin:order:create" },
      { label: "Update", value: "order:update", key: "admin:order:update" },
      { label: "Print", value: "order:print", key: "admin:order:print" },
      {
        label: "Send Receipt",
        value: "order:send-receipt",
        key: "admin:order:send-receipt",
      },
      {
        label: "Issue Refund",
        value: "order:issue-refund",
        key: "admin:order:issue-refund",
      },
    ],
    key: "admin:orders",
  },
  {
    label: "Product",
    permissions: [
      { label: "Read", value: "product:read", key: "admin:product:read" },
      { label: "Create", value: "product:create", key: "admin:product:create" },
      { label: "Update", value: "product:update", key: "admin:product:update" },
      { label: "Import", value: "product:import", key: "admin:product:import" },
      {
        label: "Batching",
        value: "product:batching",
        key: "admin:product:batching",
      },
    ],
    key: "admin:product",
  },
  {
    label: "Global Product",
    permissions: [
      {
        label: "Read",
        value: "global-product:read",
        key: "admin:global-product:read",
      },

      {
        label: "Import",
        value: "global-product:import",
        key: "admin:global-product:import",
      },
    ],
    key: "admin:global-product",
  },
  {
    label: "Boxes and Crates",
    permissions: [
      {
        label: "Read",
        value: "boxes-crates:read",
        key: "admin:boxes-crates:read",
      },
      {
        label: "Create",
        value: "boxes-crates:create",
        key: "admin:boxes-crates:create",
      },
      {
        label: "Update",
        value: "boxes-crates:update",
        key: "admin:boxes-crates:update",
      },
      // { label: "Import", value: "boxes-crates:import", key: "admin:boxes-crates:import" },
    ],
    key: "admin:product",
  },
  {
    label: "Custom charges",
    permissions: [
      {
        label: "Read",
        value: "custom-charge:read",
        key: "admin:custom-charge:read",
      },
      {
        label: "Create",
        value: "custom-charge:create",
        key: "admin:custom-charge:create",
      },
      {
        label: "Update",
        value: "custom-charge:update",
        key: "admin:custom-charge:update",
      },
    ],
    key: "admin:product",
  },
  {
    label: "Modifier",
    permissions: [
      { label: "Read", value: "modifier:read", key: "admin:modifier:read" },
      {
        label: "Create",
        value: "modifier:create",
        key: "admin:modifier:create",
      },
      {
        label: "Update",
        value: "modifier:update",
        key: "admin:modifier:update",
      },
      {
        label: "Delete",
        value: "modifier:delete",
        key: "admin:modifier:import",
      },
    ],
    key: "admin:modifier",
  },
  {
    label: "Single product import",
    permissions: [
      {
        label: "Read",
        value: "global-product:read",
        key: "admin:global-product:read",
      },
      {
        label: "Import",
        value: "product:import",
        key: "admin:single-product:import",
      },
    ],
  },
  {
    label: "Inventory History",
    permissions: [
      {
        label: "Read",
        value: "stock-history:read",
        key: "admin:stock-history:read",
      },
    ],
    key: "admin:stock-history",
  },
  {
    label: "Vendor",
    permissions: [
      { label: "Read", value: "vendor:read", key: "admin:vendor:read" },
      { label: "Create", value: "vendor:create", key: "admin:vendor:create" },
      { label: "Update", value: "vendor:update", key: "admin:vendor:update" },
    ],
    key: "admin:vendor",
  },
  {
    label: "Vendor Product",
    permissions: [
      {
        label: "Read",
        value: "vendor-product:read",
        key: "admin:vendor-product:read",
      },
      {
        label: "Create",
        value: "vendor-product:create",
        key: "admin:vendor-product:create",
      },

      {
        label: "Update",
        value: "vendor-product:update",
        key: "admin:vendor-product:update",
      },
      {
        label: "Delete",
        value: "vendor-product:delete",
        key: "admin:vendor-product:delete",
      },
    ],
    key: "admin:vendor-product",
  },

  {
    label: "PO & GRN",
    permissions: [
      { label: "Read", value: "po:read", key: "admin:po:read" },
      { label: "Create", value: "po:create", key: "admin:po:create" },
      { label: "Update", value: "po:update", key: "admin:po:update" },
    ],
    key: "admin:po",
  },
  {
    label: "Internal Transfer",
    permissions: [
      {
        label: "Read",
        value: "internal-transfer:read",
        key: "admin:internal-transfer:read",
      },
      {
        label: "Create",
        value: "internal-transfer:create",
        key: "admin:internal-transfer:create",
      },
      {
        label: "Update",
        value: "internal-transfer:update",
        key: "admin:internal-transfer:update",
      },
    ],
    key: "admin:internal-transfer",
  },

  {
    label: "Category",
    permissions: [
      { label: "Read", value: "category:read", key: "admin:category:read" },
      {
        label: "Create",
        value: "category:create",
        key: "admin:category:create",
      },
      {
        label: "Update",
        value: "category:update",
        key: "admin:category:update",
      },
    ],
    key: "admin:category",
  },

  {
    label: "Price Adjustment",
    permissions: [
      {
        label: "Read",
        value: "bulk-price-update:read",
        key: "admin:bulk-price-update:read",
      },
      {
        label: "Create",
        value: "bulk-price-update:create",
        key: "admin:bulk-price-update:create",
      },
    ],
    key: "admin:bulk-price-update",
  },

  {
    label: "Collection",
    permissions: [
      { label: "Read", value: "collection:read", key: "admin:collection:read" },
      {
        label: "Create",
        value: "collection:create",
        key: "admin:collection:create",
      },
      {
        label: "Update",
        value: "collection:update",
        key: "admin:collection:update",
      },
    ],
    key: "admin:collection",
  },
  {
    label: "Promotions",
    permissions: [
      { label: "Read", value: "promotion:read", key: "admin:promotion:read" },
      {
        label: "Create",
        value: "promotion:create",
        key: "admin:promotion:create",
      },
      {
        label: "Update",
        value: "promotion:update",
        key: "admin:promotion:update",
      },
    ],
    key: "admin:promotion",
  },
  {
    label: "Timed Events",
    permissions: [
      {
        label: "Read",
        value: "timed-event:read",
        key: "admin:timed-event:read",
      },
      {
        label: "Create",
        value: "timed-event:create",
        key: "admin:timed-event:create",
      },
      {
        label: "Update",
        value: "timed-event:update",
        key: "admin:timed-event:update",
      },
    ],
    key: "admin:timed-event",
  },
  // {
  //   label: "Price Adjustment",
  //   permissions: [
  //     {
  //       label: "Read",
  //       value: "price-adjustment:read",
  //       key: "admin:price-adjustment:read",
  //     },
  //     {
  //       label: "Create",
  //       value: "price-adjustment:create",
  //       key: "admin:price-adjustment:create",
  //     },
  //     {
  //       label: "Update",
  //       value: "price-adjustment:update",
  //       key: "admin:price-adjustment:update",
  //     },
  //   ],
  //   key: "admin:price-adjustment",
  // },
  {
    label: "Ads",
    permissions: [
      {
        label: "Read",
        value: "ads:read",
        key: "admin:ads:read",
      },
      {
        label: "Create",
        value: "ads:create",
        key: "admin:ads:create",
      },
      {
        label: "Update",
        value: "ads:update",
        key: "admin:ads:update",
      },
      {
        label: "Delete",
        value: "ads:delete",
        key: "admin:ads:delete",
      },
    ],
    key: "admin:ads",
  },
  {
    label: "Customer",
    permissions: [
      { label: "Read", value: "customer:read", key: "admin:customer:read" },
      {
        label: "Create",
        value: "customer:create",
        key: "admin:customer:create",
      },
      {
        label: "Update",
        value: "customer:update",
        key: "admin:customer:update",
      },
    ],
    key: "admin:customer",
  },
  {
    label: "Customer Credit Management",
    permissions: [
      {
        label: "Credit Allowed",
        value: "customer-credit:allowed",
        key: "admin:customer-credit:allowed",
      },
      {
        label: "Blocked",
        value: "customer-credit:blocked",
        key: "admin:customer-credit:blocked",
      },
      {
        label: "Blacklist",
        value: "customer-credit:blacklist",
        key: "admin:customer-credit:blacklist",
      },
      {
        label: "Receive Payment",
        value: "customer-credit:pay",
        key: "admin:customer-credit:pay",
      },
    ],
    key: "admin:customer-credit",
  },
  {
    label: "Group",
    permissions: [
      { label: "Read", value: "group:read", key: "admin:group:read" },
      {
        label: "Create",
        value: "group:create",
        key: "admin:group:create",
      },
      {
        label: "Update",
        value: "group:update",
        key: "admin:group:update",
      },
      {
        label: "Delete",
        value: "group:delete",
        key: "admin:group:delete",
      },
    ],
    key: "admin:group",
  },
  {
    label: "Location",
    permissions: [
      { label: "Read", value: "location:read", key: "admin:location:read" },
      {
        label: "Create",
        value: "location:create",
        key: "admin:location:create",
      },
      {
        label: "Update",
        value: "location:update",
        key: "admin:location:update",
      },
    ],
    key: "admin:location",
  },
  {
    label: "Receipt Template",
    permissions: [
      {
        label: "Read",
        value: "receipt-template:read",
        key: "admin:receipt-template:read",
      },
      {
        label: "Update",
        value: "receipt-template:update",
        key: "admin:receipt-template:update",
      },
    ],
    key: "admin:receipt-template",
  },
  {
    label: "Quick Items",
    permissions: [
      {
        label: "Read",
        value: "quick-items:read",
        key: "admin:quick-items:read",
      },
      {
        label: "Create",
        value: "quick-items:create",
        key: "admin:quick-items:create",
      },
      {
        label: "Delete",
        value: "quick-items:delete",
        key: "admin:quick-items:delete",
      },
    ],
    key: "admin:receipt-template",
  },
  {
    label: "Devices",
    permissions: [
      { label: "Read", value: "device:read", key: "admin:device:read" },
      { label: "Create", value: "device:create", key: "admin:device:create" },
      { label: "Update", value: "device:update", key: "admin:device:update" },
    ],
    key: "admin:devices",
  },
  {
    label: "Billing settings",
    permissions: [
      {
        label: "Read",
        value: "device-settings:read",
        key: "admin:device-settings:read",
      },
      {
        label: "Update",
        value: "device-settings:update",
        key: "admin:device-settings:update",
      },
    ],
    key: "admin:devices",
  },
  {
    label: "Users",
    permissions: [
      { label: "Read", value: "user:read", key: "admin:user:read" },
      { label: "ReadOwn", value: "user:readOwn", key: "admin:user:readOwn" },
      { label: "Create", value: "user:create", key: "admin:user:create" },
      { label: "Update", value: "user:update", key: "admin:user:update" },
    ],
    key: "admin:users",
  },
  {
    label: "Discount",
    permissions: [
      { label: "Read", value: "coupon:read", key: "admin:coupon:read" },
      { label: "Create", value: "coupon:create", key: "admin:coupon:create" },
      { label: "Update", value: "coupon:update", key: "admin:coupon:update" },
    ],
    key: "admin:discount",
  },
  {
    label: "Account",
    permissions: [
      { label: "Read", value: "account:read", key: "admin:account:read" },
      { label: "Update", value: "account:update", key: "admin:account:update" },
      {
        label: "Loyalty Setting",
        value: "company:loyalty-setting",
        key: "admin:company:loyalty-setting",
      },
      {
        label: "Credit Setting",
        value: "company:credit-setting",
        key: "admin:company:credit-setting",
      },
      {
        label: "Order Type",
        value: "company:order-type",
        key: "admin:company:order-type",
      },
    ],
    key: "admin:account",
  },
  {
    label: "Section and Table",
    permissions: [
      {
        label: "Read",
        value: "section-table:read",
        key: "admin:section-table:read",
      },
      {
        label: "Create",
        value: "section-table:create",
        key: "admin:section-table:create",
      },
      {
        label: "Update",
        value: "section-table:update",
        key: "admin:section-table:update",
      },
    ],
    key: "admin:section-table",
  },
  // {
  //   label: "Stocktake",
  //   permissions: [
  //     { label: "Read", value: "stocktake:read", key: "admin:stocktake:read" },
  //     {
  //       label: "Create",
  //       value: "stocktake:create",
  //       key: "admin:stocktake:create",
  //     },
  //     {
  //       label: "Update",
  //       value: "stocktake:update",
  //       key: "admin:stocktake:update",
  //     },
  //     {
  //       label: "Request",
  //       value: "stocktake:request",
  //       key: "admin:stocktake:request",
  //     },
  //     {
  //       label: "Approve",
  //       value: "stocktake:approve",
  //       key: "admin:stocktake:approve",
  //     },
  //   ],
  //   key: "admin:stocktake",
  // },
  {
    label: "Void comp",
    permissions: [
      { label: "Read", value: "void-comp:read", key: "admin:void-comp:read" },
      {
        label: "Create",
        value: "void-comp:create",
        key: "admin:void-comp:create",
      },
      {
        label: "Update",
        value: "void-comp:update",
        key: "admin:void-comp:update",
      },
    ],
    key: "admin:void-comp",
  },
  {
    label: "Kitchen",
    permissions: [
      { label: "Read", value: "kitchen:read", key: "admin:kitchen:read" },
      { label: "Create", value: "kitchen:create", key: "admin:kitchen:create" },
      { label: "Update", value: "kitchen:update", key: "admin:kitchen:update" },
    ],
    key: "admin:kitchen",
  },
  {
    label: "Menu",
    permissions: [
      { label: "Read", value: "menu:read", key: "admin:menu:read" },
      { label: "Create", value: "menu:create", key: "admin:menu:create" },
      { label: "Update", value: "menu:update", key: "admin:menu:update" },
    ],
    key: "admin:menu",
  },

  {
    label: "Accounting",
    permissions: [
      { label: "Read", value: "accounting:read", key: "admin:accounting:read" },
      {
        label: "Create",
        value: "accounting:create",
        key: "admin:accounting:create",
      },
      {
        label: "Update",
        value: "accounting:update",
        key: "admin:accounting:update",
      },
    ],
    key: "admin:accounting",
  },
];

export const saptcoAdminPermissions = [
  {
    label: "Dashboard",
    permissions: [
      { label: "Read", value: "dashboard:read", key: "admin:dashboard:read" },
    ],
    key: "admin:dashboard",
  },
  {
    label: "Product Report",
    permissions: [
      {
        label: "Read",
        value: "report:product:read",
        key: "admin:report:product:read",
      },
    ],
    key: "admin:product-report",
  },
  {
    label: "Categories Report",
    permissions: [
      {
        label: "Read",
        value: "report:categories:read",
        key: "admin:report:categories:read",
      },
    ],
    key: "admin:categories-report",
  },
  {
    label: "Shift and cash drawer Report",
    permissions: [
      {
        label: "Read",
        value: "report:shift-and-cash-drawer:read",
        key: "admin:report:shift-and-cash-drawer:read",
      },
    ],
    key: "admin:shift-and-cash-drawer-report",
  },
  {
    label: "Payment method Report",
    permissions: [
      {
        label: "Read",
        value: "report:payment-method:read",
        key: "admin:report:payment-method:read",
      },
    ],
    key: "admin:payment-method-report",
  },
  {
    label: "Sales Report",
    permissions: [
      {
        label: "Read",
        value: "report:sales:read",
        key: "admin:report:sales:read",
      },
    ],
    key: "admin:sales-report",
  },
  {
    label: "Sales Summary Report",
    permissions: [
      {
        label: "Read",
        value: "report:sales-summary:read",
        key: "admin:report:sales-summary:read",
      },
    ],
    key: "admin:report:sales-summary",
  },
  {
    label: "Inventory Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory:read",
        key: "admin:report:inventory:read",
      },
    ],
    key: "admin:report:inventory",
  },
  {
    label: "Inventory By Location Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory-by-location:read",
        key: "admin:report:inventory-by-location:read",
      },
    ],
    key: "admin:report:inventory-by-location",
  },
  {
    label: "Inventory Change Report",
    permissions: [
      {
        label: "Read",
        value: "report:inventory-change:read",
        key: "admin:report:inventory-change:read",
      },
    ],
    key: "admin:report:inventory-change",
  },
  {
    label: "Variant-Box Report",
    permissions: [
      {
        label: "Read",
        value: "report:variant:read",
        key: "admin:report:variant:read",
      },
    ],
    key: "admin:report:variant",
  },
  {
    label: "VAT Report",
    permissions: [
      {
        label: "Read",
        value: "report:vat:read",
        key: "admin:report:vat:read",
      },
    ],
    key: "admin:report:vat",
  },
  {
    label: "ADs Report",
    permissions: [
      {
        label: "Read",
        value: "report:ads:read",
        key: "admin:report:ads:read",
      },
    ],
    key: "admin:report:ads",
  },
  {
    label: "Orders",
    permissions: [
      { label: "Read", value: "order:read", key: "admin:order:read" },
      { label: "Create", value: "order:create", key: "admin:order:create" },
      { label: "Update", value: "order:update", key: "admin:order:update" },
      { label: "Print", value: "order:print", key: "admin:order:print" },
      {
        label: "Send Receipt",
        value: "order:send-receipt",
        key: "admin:order:send-receipt",
      },
      {
        label: "Issue Refund",
        value: "order:issue-refund",
        key: "admin:order:issue-refund",
      },
    ],
    key: "admin:orders",
  },
  {
    label: "Product",
    permissions: [
      { label: "Read", value: "product:read", key: "admin:product:read" },
      { label: "Create", value: "product:create", key: "admin:product:create" },
      { label: "Update", value: "product:update", key: "admin:product:update" },
      { label: "Import", value: "product:import", key: "admin:product:import" },
      {
        label: "Batching",
        value: "product:batching",
        key: "admin:product:batching",
      },
    ],
    key: "admin:product",
  },
  {
    label: "Custom charges",
    permissions: [
      {
        label: "Read",
        value: "custom-charge:read",
        key: "admin:custom-charge:read",
      },
      {
        label: "Create",
        value: "custom-charge:create",
        key: "admin:custom-charge:create",
      },
      {
        label: "Update",
        value: "custom-charge:update",
        key: "admin:custom-charge:update",
      },
    ],
    key: "admin:product",
  },
  {
    label: "Modifier",
    permissions: [
      { label: "Read", value: "modifier:read", key: "admin:modifier:read" },
      {
        label: "Create",
        value: "modifier:create",
        key: "admin:modifier:create",
      },
      {
        label: "Update",
        value: "modifier:update",
        key: "admin:modifier:update",
      },
      {
        label: "Delete",
        value: "modifier:delete",
        key: "admin:modifier:import",
      },
    ],
    key: "admin:modifier",
  },
  {
    label: "Single product import",
    permissions: [
      {
        label: "Read",
        value: "global-product:read",
        key: "admin:global-product:read",
      },
      {
        label: "Import",
        value: "product:import",
        key: "admin:single-product:import",
      },
    ],
  },
  {
    label: "Inventory History",
    permissions: [
      {
        label: "Read",
        value: "stock-history:read",
        key: "admin:stock-history:read",
      },
    ],
    key: "admin:stock-history",
  },
  {
    label: "Vendor",
    permissions: [
      { label: "Read", value: "vendor:read", key: "admin:vendor:read" },
      { label: "Create", value: "vendor:create", key: "admin:vendor:create" },
      { label: "Update", value: "vendor:update", key: "admin:vendor:update" },
    ],
    key: "admin:vendor",
  },
  {
    label: "Vendor Product",
    permissions: [
      {
        label: "Read",
        value: "vendor-product:read",
        key: "admin:vendor-product:read",
      },
      {
        label: "Create",
        value: "vendor-product:create",
        key: "admin:vendor-product:create",
      },

      {
        label: "Update",
        value: "vendor-product:update",
        key: "admin:vendor-product:update",
      },
      {
        label: "Delete",
        value: "vendor-product:delete",
        key: "admin:vendor-product:delete",
      },
    ],
    key: "admin:vendor-product",
  },

  {
    label: "PO & GRN",
    permissions: [
      { label: "Read", value: "po:read", key: "admin:po:read" },
      { label: "Create", value: "po:create", key: "admin:po:create" },
      { label: "Update", value: "po:update", key: "admin:po:update" },
    ],
    key: "admin:po",
  },
  {
    label: "Internal Transfer",
    permissions: [
      {
        label: "Read",
        value: "internal-transfer:read",
        key: "admin:internal-transfer:read",
      },
      {
        label: "Create",
        value: "internal-transfer:create",
        key: "admin:internal-transfer:create",
      },
      {
        label: "Update",
        value: "internal-transfer:update",
        key: "admin:internal-transfer:update",
      },
    ],
    key: "admin:internal-transfer",
  },

  {
    label: "Category",
    permissions: [
      { label: "Read", value: "category:read", key: "admin:category:read" },
      {
        label: "Create",
        value: "category:create",
        key: "admin:category:create",
      },
      {
        label: "Update",
        value: "category:update",
        key: "admin:category:update",
      },
    ],
    key: "admin:category",
  },

  // {
  //   label: "Price Adjustment",
  //   permissions: [
  //     {
  //       label: "Read",
  //       value: "bulk-price-update:read",
  //       key: "admin:bulk-price-update:read",
  //     },
  //     {
  //       label: "Create",
  //       value: "bulk-price-update:create",
  //       key: "admin:bulk-price-update:create",
  //     },
  //   ],
  //   key: "admin:bulk-price-update",
  // },

  {
    label: "Collection",
    permissions: [
      { label: "Read", value: "collection:read", key: "admin:collection:read" },
      {
        label: "Create",
        value: "collection:create",
        key: "admin:collection:create",
      },
      {
        label: "Update",
        value: "collection:update",
        key: "admin:collection:update",
      },
    ],
    key: "admin:collection",
  },
  {
    label: "Promotions",
    permissions: [
      { label: "Read", value: "promotion:read", key: "admin:promotion:read" },
      {
        label: "Create",
        value: "promotion:create",
        key: "admin:promotion:create",
      },
      {
        label: "Update",
        value: "promotion:update",
        key: "admin:promotion:update",
      },
    ],
    key: "admin:promotion",
  },
  // {
  //   label: "Timed Events",
  //   permissions: [
  //     {
  //       label: "Read",
  //       value: "timed-event:read",
  //       key: "admin:timed-event:read",
  //     },
  //     {
  //       label: "Create",
  //       value: "timed-event:create",
  //       key: "admin:timed-event:create",
  //     },
  //     {
  //       label: "Update",
  //       value: "timed-event:update",
  //       key: "admin:timed-event:update",
  //     },
  //   ],
  //   key: "admin:timed-event",
  // },
  // {
  //   label: "Price Adjustment",
  //   permissions: [
  //     {
  //       label: "Read",
  //       value: "price-adjustment:read",
  //       key: "admin:price-adjustment:read",
  //     },
  //     {
  //       label: "Create",
  //       value: "price-adjustment:create",
  //       key: "admin:price-adjustment:create",
  //     },
  //     {
  //       label: "Update",
  //       value: "price-adjustment:update",
  //       key: "admin:price-adjustment:update",
  //     },
  //   ],
  //   key: "admin:price-adjustment",
  // },
  {
    label: "Ads",
    permissions: [
      {
        label: "Read",
        value: "ads:read",
        key: "admin:ads:read",
      },
      {
        label: "Create",
        value: "ads:create",
        key: "admin:ads:create",
      },
      {
        label: "Update",
        value: "ads:update",
        key: "admin:ads:update",
      },
      {
        label: "Delete",
        value: "ads:delete",
        key: "admin:ads:delete",
      },
    ],
    key: "admin:ads",
  },
  {
    label: "Customer",
    permissions: [
      { label: "Read", value: "customer:read", key: "admin:customer:read" },
      {
        label: "Create",
        value: "customer:create",
        key: "admin:customer:create",
      },
      {
        label: "Update",
        value: "customer:update",
        key: "admin:customer:update",
      },
    ],
    key: "admin:customer",
  },
  {
    label: "Customer Credit Management",
    permissions: [
      {
        label: "Credit Allowed",
        value: "customer-credit:allowed",
        key: "admin:customer-credit:allowed",
      },
      {
        label: "Blocked",
        value: "customer-credit:blocked",
        key: "admin:customer-credit:blocked",
      },
      {
        label: "Blacklist",
        value: "customer-credit:blacklist",
        key: "admin:customer-credit:blacklist",
      },
      {
        label: "Receive Payment",
        value: "customer-credit:pay",
        key: "admin:customer-credit:pay",
      },
    ],
    key: "admin:customer-credit",
  },
  {
    label: "Group",
    permissions: [
      { label: "Read", value: "group:read", key: "admin:group:read" },
      {
        label: "Create",
        value: "group:create",
        key: "admin:group:create",
      },
      {
        label: "Update",
        value: "group:update",
        key: "admin:group:update",
      },
      {
        label: "Delete",
        value: "group:delete",
        key: "admin:group:delete",
      },
    ],
    key: "admin:group",
  },
  {
    label: "Location",
    permissions: [
      { label: "Read", value: "location:read", key: "admin:location:read" },
      {
        label: "Create",
        value: "location:create",
        key: "admin:location:create",
      },
      {
        label: "Update",
        value: "location:update",
        key: "admin:location:update",
      },
    ],
    key: "admin:location",
  },
  {
    label: "Receipt Template",
    permissions: [
      {
        label: "Read",
        value: "receipt-template:read",
        key: "admin:receipt-template:read",
      },
      {
        label: "Update",
        value: "receipt-template:update",
        key: "admin:receipt-template:update",
      },
    ],
    key: "admin:receipt-template",
  },
  {
    label: "Quick Items",
    permissions: [
      {
        label: "Read",
        value: "quick-items:read",
        key: "admin:quick-items:read",
      },
      {
        label: "Create",
        value: "quick-items:create",
        key: "admin:quick-items:create",
      },
      {
        label: "Delete",
        value: "quick-items:delete",
        key: "admin:quick-items:delete",
      },
    ],
    key: "admin:receipt-template",
  },
  {
    label: "Devices",
    permissions: [
      { label: "Read", value: "device:read", key: "admin:device:read" },
      { label: "Create", value: "device:create", key: "admin:device:create" },
      { label: "Update", value: "device:update", key: "admin:device:update" },
    ],
    key: "admin:devices",
  },
  {
    label: "Billing settings",
    permissions: [
      {
        label: "Read",
        value: "device-settings:read",
        key: "admin:device-settings:read",
      },
      {
        label: "Update",
        value: "device-settings:update",
        key: "admin:device-settings:update",
      },
    ],
    key: "admin:devices",
  },
  {
    label: "Users",
    permissions: [
      { label: "Read", value: "user:read", key: "admin:user:read" },
      { label: "ReadOwn", value: "user:readOwn", key: "admin:user:readOwn" },
      { label: "Create", value: "user:create", key: "admin:user:create" },
      { label: "Update", value: "user:update", key: "admin:user:update" },
    ],
    key: "admin:users",
  },
  {
    label: "Discount",
    permissions: [
      { label: "Read", value: "coupon:read", key: "admin:coupon:read" },
      { label: "Create", value: "coupon:create", key: "admin:coupon:create" },
      { label: "Update", value: "coupon:update", key: "admin:coupon:update" },
    ],
    key: "admin:discount",
  },
  {
    label: "Account",
    permissions: [
      { label: "Read", value: "account:read", key: "admin:account:read" },
      { label: "Update", value: "account:update", key: "admin:account:update" },
      {
        label: "Loyalty Setting",
        value: "company:loyalty-setting",
        key: "admin:company:loyalty-setting",
      },
      {
        label: "Credit Setting",
        value: "company:credit-setting",
        key: "admin:company:credit-setting",
      },
      {
        label: "Order Type",
        value: "company:order-type",
        key: "admin:company:order-type",
      },
    ],
    key: "admin:account",
  },
];

export const posPermissions = [
  {
    label: "Dashboard",
    permissions: [
      { label: "Read", value: "pos:dashboard:read", key: "pos:dashboard:read" },
    ],
    key: "pos:dashboard",
  },
  {
    label: "Vendor",
    permissions: [
      { label: "Read", value: "pos:vendor:read", key: "pos:vendor:read" },
    ],
    key: "pos:vendor",
  },
  {
    label: "PO & GRN",
    permissions: [{ label: "Read", value: "pos:po:read", key: "pos:po:read" }],
    key: "pos:po",
  },

  {
    label: "Inventory History",
    permissions: [
      {
        label: "Read",
        value: "pos:stock-history:read",
        key: "pos:stock-history:read",
      },
    ],
    key: "pos:stock-history",
  },
  {
    label: "Reports",
    permissions: [
      { label: "Sales", value: "pos:report:sales", key: "pos:report:sales" },
      { label: "Order", value: "pos:report:order", key: "pos:report:order" },
      { label: "Shift", value: "pos:report:shift", key: "pos:report:shift" },
      {
        label: "Activity Log",
        value: "pos:report:activity-log",
        key: "pos:report:activity-log",
      },
      {
        label: "Category",
        value: "pos:report:category",
        key: "pos:report:category",
      },
      {
        label: "Product",
        value: "pos:report:product",
        key: "pos:report:product",
      },
    ],
    key: "pos:report",
  },
  {
    label: "Orders",
    permissions: [
      { label: "Read", value: "pos:order:read", key: "pos:order:read" },
      { label: "Create", value: "pos:order:create", key: "pos:order:create" },
      { label: "Update", value: "pos:order:update", key: "pos:order:update" },
      { label: "Print", value: "pos:order:print", key: "pos:order:print" },
      {
        label: "Send Receipt",
        value: "pos:order:send-receipt",
        key: "pos:order:send-receipt",
      },
    ],
    key: "pos:order",
  },
  {
    label: "Customer",
    permissions: [
      { label: "Read", value: "pos:customer:read", key: "pos:customer:read" },
      {
        label: "Create",
        value: "pos:customer:create",
        key: "pos:customer:create",
      },
      {
        label: "Update",
        value: "pos:customer:update",
        key: "pos:customer:update",
      },
    ],
    key: "pos:customer",
  },
  {
    label: "Customer Credit Management",
    permissions: [
      {
        label: "Credit Allowed",
        value: "pos:customer-credit:allowed",
        key: "pos:customer-credit:allowed",
      },
      {
        label: "Blocked",
        value: "pos:customer-credit:blocked",
        key: "pos:customer-credit:blocked",
      },
      {
        label: "Blacklist",
        value: "pos:customer-credit:blacklist",
        key: "pos:customer-credit:blacklist",
      },
      {
        label: "Receive Payment",
        value: "pos:customer-credit:pay",
        key: "pos:customer-credit:pay",
      },
    ],
    key: "pos:customer-credit",
  },
  {
    label: "Product",
    permissions: [
      { label: "Read", value: "pos:product:read", key: "pos:product:read" },
      {
        label: "Create",
        value: "pos:product:create",
        key: "pos:product:create",
      },
      {
        label: "Update",
        value: "pos:product:update",
        key: "pos:product:update",
      },
      {
        label: "Import",
        value: "pos:product:import",
        key: "pos:product:import",
      },
      {
        label: "Batching",
        value: "pos:product:batching",
        key: "pos:product:batching",
      },
    ],
    key: "pos:product",
  },
  {
    label: "Category",
    permissions: [
      { label: "Read", value: "pos:category:read", key: "pos:category:read" },
      {
        label: "Create",
        value: "pos:category:create",
        key: "pos:category:create",
      },
    ],
    key: "pos:category",
  },
  {
    label: "Collection",
    permissions: [
      {
        label: "Read",
        value: "pos:collection:read",
        key: "pos:collection:read",
      },
      {
        label: "Create",
        value: "pos:collection:create",
        key: "pos:collection:create",
      },
    ],
    key: "pos:collection",
  },
  {
    label: "Global Product",
    permissions: [
      {
        label: "Read",
        value: "pos:global-product:read",
        key: "pos:global-product:read",
      },
    ],
    key: "pos:global-product",
  },
  {
    label: "Discount",
    permissions: [
      { label: "Read", value: "pos:coupon:read", key: "pos:coupon:read" },
      { label: "Create", value: "pos:coupon:create", key: "pos:coupon:create" },
      { label: "Update", value: "pos:coupon:update", key: "pos:coupon:update" },
    ],
    key: "pos:coupon",
  },
  {
    label: "Business Details",
    permissions: [
      {
        label: "Read",
        value: "pos:business-detail:read",
        key: "pos:business-detail:read",
      },
      {
        label: "Update",
        value: "pos:business-detail:update",
        key: "pos:business-detail:update",
      },
    ],
    key: "pos:business-detail",
  },
  {
    label: "Printer",
    permissions: [
      { label: "Read", value: "pos:printer:read", key: "pos:printer:read" },
      {
        label: "Create",
        value: "pos:printer:create",
        key: "pos:printer:create",
      },
      {
        label: "Update",
        value: "pos:printer:update",
        key: "pos:printer:update",
      },
      {
        label: "Delete",
        value: "pos:printer:delete",
        key: "pos:printer:delete",
      },
    ],
    key: "pos:printer",
  },
  {
    label: "Billing Settings",
    permissions: [
      {
        label: "Read",
        value: "pos:billing-settings:read",
        key: "pos:billing-settings:read",
      },
      {
        label: "Update",
        value: "pos:billing-settings:update",
        key: "pos:billing-settings:update",
      },
      {
        label: "Keypad",
        value: "pos:billing-settings:keypad",
        key: "pos:billing-settings:keypad",
      },
      {
        label: "Discount",
        value: "pos:billing-settings:discount",
        key: "pos:billing-settings:discount",
      },
      {
        label: "Promotions",
        value: "pos:billing-settings:promotions",
        key: "pos:billing-settings:promotions",
      },

      {
        label: "Custom Charges",
        value: "pos:billing-settings:custom-charges",
        key: "pos:billing-settings:custom-charges",
      },
    ],
    key: "pos:billing-settings",
  },
  {
    label: "User",
    permissions: [
      { label: "Update", value: "pos:user:update", key: "pos:user:update" },
      {
        label: "Change Pin",
        value: "pos:user:change-pin",
        key: "pos:user:change-pin",
      },
    ],
    key: "pos:user",
  },
  {
    label: "Section and Table",
    permissions: [
      {
        label: "Read",
        value: "pos:section-table:read",
        key: "pos:section-table:read",
      },
    ],
    key: "pos:section-table",
  },
  {
    label: "Menu",
    permissions: [
      {
        label: "Read",
        value: "pos:menu:read",
        key: "pos:menu:read",
      },
    ],
    key: "pos:menu",
  },
  {
    label: "Expense",
    permissions: [
      { label: "Read", value: "pos:expense:read", key: "pos:expense:read" },
      {
        label: "Create",
        value: "pos:expense:create",
        key: "pos:expense:create",
      },
      {
        label: "Update",
        value: "pos:expense:update",
        key: "pos:expense:update",
      },
    ],
    key: "pos:expense",
  },
  {
    label: "Kitchen",
    permissions: [
      { label: "Read", value: "pos:kitchen:read", key: "pos:kitchen:read" },
      {
        label: "Create",
        value: "pos:kitchen:create",
        key: "pos:kitchen:create",
      },
      {
        label: "Update",
        value: "pos:kitchen:update",
        key: "pos:kitchen:update",
      },
    ],
    key: "pos:kitchen",
  },
  {
    label: "Void and Comp",
    permissions: [
      {
        label: "Read",
        value: "pos:void-comp:read",
        key: "pos:void-comp:read",
      },
    ],
    key: "pos:void-comp",
  },
];
