const endpoint = {
  login: {
    path: "/authentication/login",
    method: "POST",
  },
  fetchPOSUser: {
    path: "/user/fetch-pos-user",
    method: "GET",
  },
  resetPassword: {
    path: "/authentication/reset-password",
    method: "POST",
  },
  logout: {
    path: "/authentication/logout",
    method: "PUT",
  },
  businessDetails: {
    path: "/device/fetch-business-detail",
    method: "GET",
  },
  productPull: {
    path: "/pull/product",
    method: "GET",
  },
  categoryPull: {
    path: "/pull/category",
    method: "GET",
  },
  collectionPull: {
    path: "/pull/collection",
    method: "GET",
  },
  customerPull: {
    path: "/pull/customer",
    method: "GET",
  },
  cashDrawerTxnPull: {
    path: "/pull/cash-drawer-txn",
    method: "GET",
  },
  businessDetailPull: {
    path: "/pull/business-detail",
    method: "GET",
  },
  orderPull: {
    path: "/pull/order",
    method: "GET",
  },
  printTemplatePull: {
    path: "/print-template",
    method: "GET",
  },
  stockHistoryPull: {
    path: "/pull/stock-history",
    method: "GET",
  },
  batchPull: {
    path: "/pull/batch",
    method: "GET",
  },
  quickItemsPull: {
    path: "/pull/quick-item",
    method: "GET",
  },
  customChargePull: {
    path: "/pull/custom-charge",
    method: "GET",
  },
  adsManagementPull: {
    path: "/pull/ads",
    method: "GET",
  },
  orderNumberSequencePull: {
    path: "/pull/order-number-sequence",
    method: "GET",
  },
  orderNumberSequencePush: {
    path: "/push/order-number-sequence",
    method: "POST",
  },
  kitchenManagementPull: {
    path: "/pull/kitchen-management",
    method: "GET",
  },
  sectionTablesPull: {
    path: "/pull/section-tables",
    method: "GET",
  },
  menuPull: {
    path: "/pull/menu-management",
    method: "GET",
  },
  voidCompPull: {
    path: "/pull/void-comp",
    method: "GET",
  },
  boxCratesPull: {
    path: "/pull/box-crates",
    method: "GET",
  },
  customerGoups: {
    path: "/customer-group",
    method: "GET",
  },
  productPush: {
    path: "/push/product",
    method: "POST",
  },
  sectionTablesPush: {
    path: "/push/section-tables",
    method: "POST",
  },
  customerPush: {
    path: "/push/customer",
    method: "POST",
  },
  businessDetailPush: {
    path: "/push/location",
    method: "POST",
  },
  orderPush: {
    path: "/push/orders",
    method: "POST",
  },
  globalProductPush: {
    path: "/push/global-product",
    method: "POST",
  },
  adsReportPush: {
    path: "/push/ads-report",
    method: "POST",
  },
  cashDrawerTxnPush: {
    path: "/push/cash-drawer-txn",
    method: "POST",
  },
  stockHistoryPush: {
    path: "/push/stock-history",
    method: "POST",
  },
  batchPush: {
    path: "/push/batch",
    method: "POST",
  },
  quickItemsPush: {
    path: "/push/quick-item",
    method: "POST",
  },
  kitchenManagementPush: {
    path: "/push/kitchen-management",
    method: "POST",
  },
  boxCratesPush: {
    path: "/push/box-crates",
    method: "POST",
  },
  billingSettingsPull: {
    path: "/pull/device-config",
    method: "GET",
  },
  checkRequestPush: {
    path: "/push/check-request",
    method: "GET",
  },
  updateUser: {
    path: "/user",
    method: "PATCH",
  },
  categoryAdd: {
    path: "/category",
    method: "POST",
  },
  collectionAdd: {
    path: "/collection",
    method: "POST",
  },
  couponAdd: {
    path: "/coupon",
    method: "POST",
  },
  coupons: {
    path: "/coupon",
    method: "GET",
  },
  couponUpdate: {
    path: "/coupon",
    method: "PATCH",
  },
  cashDrawerTxn: {
    path: "/cash-drawer-txn",
    method: "POST",
  },
  appData: {
    path: "/app-data",
    method: "GET",
  },

  orders: {
    path: "/order",
    method: "GET",
  },
  createProduct: {
    path: "/product",
    method: "POST",
  },
  updateProduct: {
    path: "/product",
    method: "PATCH",
  },
  stockHistoryCreate: {
    path: "/stock-history",
    method: "POST",
  },
  createCategory: {
    path: "/category",
    method: "POST",
  },
  updateCategory: {
    path: "/category",
    method: "PATCH",
  },
  createCustomer: {
    path: "/customer",
    method: "POST",
  },
  updateCustomer: {
    path: "/customer",
    method: "PATCH",
  },
  updateBusinessDetail: {
    path: "/location/busines-detail",
    method: "PATCH",
  },
  notification: {
    path: "/notification",
    method: "GET",
  },
  sendReceipt: {
    path: "/order/send-receipt",
    method: "POST",
  },
  orderReport: {
    path: "/report/order",
    method: "GET",
  },
  shiftReport: {
    path: "/report/shift",
    method: "GET",
  },
  shiftReportStats: {
    path: "/report/shift/stats",
    method: "GET",
  },
  sqlite: {
    path: "/sqlite",
    method: "POST",
  },
  log: {
    path: "/push/device-log",
    method: "POST",
  },
  brands: {
    path: "/brands",
    method: "GET",
  },
  category: {
    path: "/category",
    method: "GET",
  },
  collection: {
    path: "/collection",
    method: "GET",
  },
  modifiers: {
    path: "/modifier",
    method: "GET",
  },
  tax: {
    path: "/tax",
    method: "GET",
  },
  vendor: {
    path: "/vendor",
    method: "GET",
  },
  globalProducts: {
    path: "/global-products",
    method: "GET",
  },
  isAlreadyImported: {
    path: "/global-products/check-import",
    method: "GET",
  },
  importGlobalProduct: {
    path: "/product/import",
    method: "POST",
  },
  customerWallets: {
    path: "/wallet",
    method: "GET",
  },
  singleWallet: {
    path: "/wallet/get",
    method: "GET",
  },
  customerCredits: {
    path: "/credit",
    method: "GET",
  },
  walletSendOTP: {
    path: "/wallet/send-otp",
    method: "POST",
  },
  walletVerifyOTP: {
    path: "/wallet/verify-otp",
    method: "POST",
  },
  creditSendOTP: {
    path: "/credit/send-otp",
    method: "POST",
  },
  creditVerifyOTP: {
    path: "/credit/verify-otp",
    method: "POST",
  },
  sendOTP: {
    path: "/authentication/send-otp",
    method: "POST",
  },
  generateUniqueSKU: {
    path: "/product/sku",
    method: "GET",
  },
  sendTransactionReceipt: {
    path: "/report/sale-summary/reciept",
    method: "POST",
  },
  pushBillingSettings: {
    path: "/push/device-config",
    method: "POST",
  },
  menuConfig: {
    path: "/ordering/menu-config",
    method: "GET",
  },
  menuConfigUpdate: {
    path: "/ordering/menu-config",
    method: "PATCH",
  },
  onlineOrdering: {
    path: "/ordering/order",
    method: "GET",
  },
  onlineOrderingUpdate: {
    path: "/ordering/order",
    method: "PATCH",
  },
  onlineOrderingActivityLogs: {
    path: "/ordering/activity-logs",
    method: "GET",
  },
  onlineOrderingCancel: {
    path: "/ordering/cancel",
    method: "POST",
  },
  driver: {
    path: "/ordering/driver",
    method: "GET",
  },
  assignDriver: {
    path: "/ordering/driver/assign-driver",
    method: "POST",
  },
  timeEvents: {
    path: "/time-based-events",
    method: "GET",
  },
  assignCollection: {
    path: "/collection/assign",
    method: "POST",
  },
  removeCollection: {
    path: "/collection/remove",
    method: "POST",
  },
  reportingHours: {
    path: "/reporting-hours",
    method: "GET",
  },
  dayEndTime: {
    path: "/cash-drawer-txn/get-day-end",
    method: "GET",
  },
  group: {
    path: "/customer-group",
    method: "POST",
  },
  miscExpenses: {
    path: "/accounting",
    method: "GET",
  },
  miscExpensesCreate: {
    path: "/accounting",
    method: "POST",
  },
  miscExpensesUpdate: {
    path: "/accounting",
    method: "PATCH",
  },
  assignProductKitchen: {
    path: "/kitchen-management/assign",
    method: "POST",
  },
  removeProductKitchen: {
    path: "/kitchen-management/remove",
    method: "POST",
  },
  retailMenu: {
    path: "/menu",
    method: "GET",
  },
  restaurantMenu: {
    path: "/menu-management/menu",
    method: "GET",
  },
  subscriptionByCompanyRef: {
    path: "/subscription/companyRef",
    method: "GET",
  },
  subscriptionByOwnerRef: {
    path: "/subscription/ownerRef",
    method: "GET",
  },
};

export default endpoint;
