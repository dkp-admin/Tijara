const endpoint = {
  login: {
    path: "/authentication/login",
    method: "POST",
  },
  sendOtp: {
    path: "/authentication/send-otp",
    method: "POST",
  },
  resetPassword: {
    path: "/authentication/reset-password",
    method: "POST",
  },
  updateProfile: {
    path: "/user/profile",
    method: "PATCH",
  },
  logout: {
    path: "/authentication/logout",
    method: "PUT",
  },
};

export default endpoint;
