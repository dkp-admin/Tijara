export const paths = {
  index: "/",
  checkout: "/checkout",
  contact: "/contact",
  pricing: "/pricing",
  authentication: {
    login: "/authentication/login",
    register: "/authentication/register",
    "get-started": "/authentication/get-started",
    forgotPassword: {
      classic: "/auth-demo/forgot-password/classic",
      modern: "/auth-demo/forgot-password/modern",
    },
    resetPassword: {
      classic: "/auth-demo/reset-password/classic",
      modern: "/auth-demo/reset-password/modern",
    },
    verifyCode: {
      classic: "/auth-demo/verify-code/classic",
      modern: "/auth-demo/verify-code/modern",
    },
  },
  auth: {
    auth0: {
      callback: "/auth/auth0/callback",
      login: "/auth/auth0/login",
    },
    jwt: {
      login: "/auth/jwt/login",
      register: "/auth/jwt/register",
    },
    firebase: {
      login: "/auth/firebase/login",
      register: "/auth/firebase/register",
    },
    amplify: {
      confirmRegister: "/auth/amplify/confirm-register",
      forgotPassword: "/auth/amplify/forgot-password",
      login: "/auth/amplify/login",
      register: "/auth/amplify/register",
      resetPassword: "/auth/amplify/reset-password",
    },
  },
  authDemo: {
    forgotPassword: {
      classic: "/auth-demo/forgot-password/classic",
      modern: "/auth-demo/forgot-password/modern",
    },
    login: {
      classic: "/auth-demo/login/classic",
      modern: "/auth-demo/login/modern",
    },
    register: {
      classic: "/auth-demo/register/classic",
      modern: "/auth-demo/register/modern",
    },
    resetPassword: {
      classic: "/auth-demo/reset-password/classic",
      modern: "/auth-demo/reset-password/modern",
    },
    verifyCode: {
      classic: "/auth-demo/verify-code/classic",
      modern: "/auth-demo/verify-code/modern",
    },
  },
  dashboard: {
    index: "/dashboard",
    academy: {
      index: "/dashboard/academy",
      courseDetails: "/dashboard/academy/courses/:courseId",
    },
    account: "/dashboard/account",
    analytics: "/dashboard/analytics",
    blank: "/dashboard/blank",
    blog: {
      index: "/dashboard/blog",
      postDetails: "/dashboard/blog/:postId",
      postCreate: "/dashboard/blog/create",
    },
    calendar: "/dashboard/calendar",
    chat: "/dashboard/chat",
    crypto: "/dashboard/crypto",
    customers: {
      index: "/dashboard/customers",
      details: "/dashboard/customers/:customerId",
      edit: "/dashboard/customers/:customerId/edit",
    },
    ecommerce: "/dashboard/ecommerce",
    fileManager: "/dashboard/file-manager",
    invoices: {
      index: "/dashboard/invoices",
      details: "/dashboard/invoices/:orderId",
    },
    jobs: {
      index: "/dashboard/jobs",
      create: "/dashboard/jobs/create",
      companies: {
        details: "/dashboard/jobs/companies/:companyId",
      },
    },
    kanban: "/dashboard/kanban",
    logistics: {
      index: "/dashboard/logistics",
      fleet: "/dashboard/logistics/fleet",
    },
    mail: "/dashboard/mail",
    orders: {
      index: "/dashboard/orders",
      details: "/dashboard/orders/:orderId",
    },
    products: {
      index: "/dashboard/products",
      create: "/dashboard/products/create",
    },
    social: {
      index: "/dashboard/social",
      profile: "/dashboard/social/profile",
      feed: "/dashboard/social/feed",
    },
  },
  components: {
    index: "/components",
    dataDisplay: {
      detailLists: "/components/data-display/detail-lists",
      tables: "/components/data-display/tables",
      quickStats: "/components/data-display/quick-stats",
    },
    lists: {
      groupedLists: "/components/lists/grouped-lists",
      gridLists: "/components/lists/grid-lists",
    },
    forms: "/components/forms",
    modals: "/components/modals",
    charts: "/components/charts",
    buttons: "/components/buttons",
    typography: "/components/typography",
    colors: "/components/colors",
    inputs: "/components/inputs",
  },
  docs: "https://material-kit-pro-react-docs.devias.io",
  401: "/401",
  404: "/404",
  500: "/500",
  menu: "/menu",
  hyperlocal: "/birq",

  // =====
};

export const tijarahPaths = {
  index: "/",
  dashboard: {
    salesDashboard: "/dashboard/sales",
    inventoryDashboard: "/dashboard/inventory",
    // otherDashboard: "/dashboard/others",
    // hourlyDashboard: "/dashboard/hourly-reports",
  },
  reports: {
    // productsReport: "/reports/product",
    categoriesReport: "/reports/category",
    shiftsAndCashDrawerReport: "/reports/shifts-cash-drawer",
    shiftReport: "/reports/shifts",
    paymentMethodReport: "/reports/payment-methods",
    refundReport: "/reports/refunds",
    salesReport: "/reports/sales",
    // newSalesReport: "/reports/new-sales",
    salesSummaryReport: "/reports/summary",
    performanceReport: "/reports/performance",
    inventoryChangeReport: "/reports/change-inventory",
    lowInventoryReport: "/reports/low-inventory",
    inventoryByLocationReport: "/reports/location-inventory",
    expiringInventory: "/reports/expiring-inventory",
    vatReport: "/reports/vat",
    customChargeVatReport: "/reports/charges-custom-vat",
    inventoryReport: "/reports/inventory",
    variantReport: "/reports/variant-box",
    deadInventoryReport: "/reports/dead-inventory",
    adsReport: "/reports/ads",
    void: "/reports/void",
    comp: "/reports/comp",
    productReportOrderWise: "/reports/product-order-wise",
  },
  billing: {
    index: "/pos",
    "online-order-details": "/pos/online-order-details",
  },
  orders: "/orders",
  barcodePrint: "/barcode-print",
  inventoryManagement: {
    purchaseOrder: {
      index: "/inventory-management/purchase-order",
      createpo: "/inventory-management/purchase-order/create-po",
      returnPo: "/inventory-management/purchase-order/return-to-vendor",
    },
    stocktakes: {
      index: "/inventory-management/stocktakes",
      create: "/inventory-management/stocktakes/create",
    },
    vendor: {
      index: "/inventory-management/vendor",
      create: "/inventory-management/vendor/create",
    },
    internalTransfer: {
      index: "/inventory-management/internal-transfer",
      create: "/inventory-management/internal-transfer/create",
    },
    history: "/inventory-management/history",
  },
  authentication: {
    login: "/authentication/login",
    logout: "/authentication/logout",
    register: "/authentication/register",
    otpVerification: "/authentication/otp-verify",
    getStarted: "/authentication/get-started",
    forgotPassword: "/authentication/forgot-password",
    resetPassword: "/authentication/password-reset",
    subcription: "/authentication/subscription-expiry",
    renewal: "/authentication/subscription-renewal",
    packages: "/authentication/packages",
    paymentGateway: "/authentication/payment-gateway",
  },
  signup: {
    steps: "/signup",
  },
  catalogue: {
    globalProducts: {
      index: "/global-products",
      view: "/global-products/view",
    },
    products: {
      index: "/products",
      create: "/products/create",
    },
    compositeProducts: {
      index: "/composite-products",
      create: "/composite-products/create",
    },
    priceAdjustment: {
      index: "/price-adjustment",
      create: "/price-adjustment/create",
    },
    boxesAndCrates: {
      index: "/boxes-and-crates",
      create: "/boxes-and-crates/create",
    },

    volumetricPricing: {
      index: "/volumetric-pricing",
      create: "/volumetric-pricing/create",
    },
    customCharges: {
      index: "/custom-charges",
      create: "/custom-charges/create",
    },
    modifiers: {
      index: "/modifiers",
      create: "/modifiers/create",
    },
    categories: {
      index: "/categories",
      create: "/categories/create",
    },
    collections: {
      index: "/collections",
      create: "/collections/create",
    },
    menu: {
      index: "/menu-management",
      create: "/menu-management/create",
    },
    brands: {
      index: "/brands",
      create: "/brands/create",
    },
  },
  management: {
    customers: {
      index: "/customers",
      create: "/customers/create",
      createGroup: "/customers/group-create",
    },
    // miscellaneousExpenses: {
    //   index: "/miscellaneous-expenses",
    //   create: "/miscellaneous-expenses/create",
    // },
    locations: {
      create: "/locations/create",
      list: {
        index: "/locations/list",
      },
      cashManagement: {
        index: "/locations/cash-management",
        edit: "/locations/cash-management/edit",
      },
      receiptTemplate: {
        index: "/locations/receipt-template",
      },
      users: {
        index: "/locations/users",
        create: "/locations/users/create",
      },
    },
    devicesManagement: {
      devices: {
        index: "/devicesManagement/devices",
        create: "/devicesManagement/devices/create",
      },
      kitchen: {
        index: "/devicesManagement/kitchen-settings",
        create: "/devicesManagement/kitchen-settings/create",
      },
    },
    discounts: {
      index: "/discounts",
      create: "/discounts/create",
    },
    sectionTable: {
      index: "/section-table",
      create: "/section-table/create",
    },
    timedEvents: {
      index: "/timed-events",
      create: "/timed-events/create",
    },
    promotions: {
      index: "/promotions",
      create: "/promotions/create",
    },
    vat: {
      index: "/vat",
      create: "/vat/create",
    },
    settings: "/settings",

    account: "/account",
    profile: "/profile",
    companyUsers: {
      create: "/users/create",
    },
    reportingHour: "/reporting-hour/create",
  },
  hyperlocal: {
    index: "/birq",
    businessTypeDetails: "/birq/business-type-details",
  },
  accounting: {
    accounting: {
      index: "/new-accounting",
      create: "/new-accounting/create",
    },
  },
  platform: {
    auditLogs: "/platform/logs/audit-logs",
    logs: {
      posSyncReq: "/platform/logs/sync-req-logs",
    },
    reports: {
      companies: "/platform/reports/companies",
    },
    companies: "/platform/companies",
    globalProducts: {
      index: "/platform/global-products",
      create: "/platform/global-products/create",
    },
    globalCategories: {
      index: "/platform/global-categories",
      create: "/platform/global-categories/create",
    },
    globalBrands: {
      index: "/platform/global-brands",
      create: "/platform/global-brands/create",
    },
    industries: {
      index: "/platform/industries",
      create: "/platform/industries/create",
    },
    businessTypes: {
      index: "/platform/business-types",
      create: "/platform/business-types/create",
    },
    paymentTypes: {
      index: "/platform/payment-types",
      create: "/platform/payment-types/create",
    },
    packages: {
      index: "/platform/packages",
      create: "/platform/packages/create",
    },
    currencies: {
      index: "/platform/currencies",
      create: "/platform/currencies/create",
    },
    subscriptions: {
      index: "/platform/subscriptions",
      invoices: "/platform/subscriptions/invoices",
    },
    vatrate: {
      index: "/platform/vat-rate",
      create: "/platform/vat-rate/create",
    },
    apkManagement: {
      index: "/platform/apk-management",
      create: "/platform/apk-management/create",
    },
    subscriptionManagement: {
      packages: {
        index: "/platform/subscription-management/packages",
        create: "/platform/subscription-management/packages/create",
      },
      referralCoupon: {
        index: "/platform/subscription-management/referral-coupon",
        create: "/platform/subscription-management/referral-coupon/create",
      },
    },
    platformUsers: {
      index: "/platform/users",
      create: "/platform/users/create",
    },
    rolesAndPermission: {
      index: "/platform/rolesAndPermission",
      create: "/platform/rolesAndPermission/create",
    },
    adsManagement: {
      index: "/platform/platform-ads",
      create: "/platform/platform-ads/create",
    },
  },
  zatcaInvoices: {
    index: "/zatca-invoices",
  },
  menu: "/menu",
  displayToken: "/display-token",
  401: "/401",
  404: "/404",
  500: "/500",
};
