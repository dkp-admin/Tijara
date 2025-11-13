const endpoint = {
  login: {
    path: "/authentication/login",
    method: "POST",
  },
  authorize: {
    path: "/authentication/authenticate-pos",
    method: "POST",
  },
  sendOtp: {
    path: "/authentication/send-otp",
    method: "POST",
  },
  register: {
    path: "/authentication/register",
    method: "POST",
  },
  verifyOTP: {
    path: "/authentication/verify-otp",
    method: "POST",
  },
  orderingSendOTP: {
    path: "/ordering/send-otp",
    method: "POST",
  },
  orderingVerifyOTP: {
    path: "/ordering/verify-otp",
    method: "POST",
  },
  subscribe: {
    path: "/user/subscribe",
    method: "POST",
  },
  resetPassword: {
    path: "/authentication/reset-password",
    method: "POST",
  },
  //onboard
  onboard: {
    path: "/user/onboard",
    method: "POST",
  },
  //user
  updateProfile: {
    path: "/user/profile",
    method: "PATCH",
  },
  //change password
  changePassword: {
    path: "/user/change-password",
    method: "POST",
  },
  //upload
  getSignedUrl: {
    path: "/s3/signed-url",
    method: "get",
  },
  //Update FCM Token
  updateFcmToken: {
    path: "/user/push-token",
    method: "put",
  },
  deviceSendCode: {
    path: "/device/send-code",
    method: "POST",
  },
  sendReceipt: {
    path: "/order/send-receipt",
    method: "POST",
  },
  sendSalesSummaryReceipt: {
    path: "/report/sale-summary/reciept",
    method: "POST",
  },
  sendPoReceipt: {
    path: "/purchase-order/send",
    method: "POST",
  },
  sendStocktakesReceipt: {
    path: "/stocktakes/send",
    method: "POST",
  },
  isAlreadyImported: {
    path: "/global-products/check-import",
    method: "GET",
  },
  generateUniqueSKU: {
    path: "/product/sku",
    method: "GET",
  },
  singleWallet: {
    path: "/wallet/get",
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
  featureModule: {
    path: "/authentication/modules",
    method: "GET",
  },
  receivePayment: {
    path: "/subscription/payment",
    method: "POST",
  },
};

export default endpoint;
