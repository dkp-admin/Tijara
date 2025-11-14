import PropTypes from "prop-types";
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { usePreferredLanguage } from "src/hooks/preferred-language/use-preferred-language";
import { useUserType } from "src/hooks/use-user-type";
import { Customer } from "src/types/customer";
import { Device } from "src/types/device";
import type { User } from "src/types/user";
import { Issuer } from "src/utils/auth";
import { USER_TYPES } from "src/utils/constants";
import generateUniqueCode from "src/utils/generate-unique-code";

const STORAGE_KEY = "accessToken";
const STORAGE_KEY_DEVICE = "accessDeviceToken";

interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  device: Device | null;
  customer: Customer | null;
  subscription: null;
}

interface AuthContextValue extends State {
  issuer: Issuer.JWT;
  login: (mobile: string, password: string) => Promise<any>;
  deviceLogin: (email: string, password: string) => Promise<any>;
  authorize: (posId: string, mobile: string) => Promise<any>;
  logout: () => Promise<any>;
  deviceLogout: () => Promise<any>;
  userDeviceLogout: (deviceId: string, deviceCode: string) => Promise<any>;
  sendCode: (mobile: string) => Promise<any>;
  orderingSendCode: (mobile: string) => Promise<any>;
  passwordReset: (
    mobile: string,
    code: string,
    password: string
  ) => Promise<any>;
  register: (
    name: string,
    email: string,
    phone: string,
    profilePicture: string,
    password: string
  ) => Promise<any>;
  verifyOTP: (
    email: string,
    name: string,
    otp: string,
    password: string,
    phone: string,
    profilePicture: string
  ) => Promise<any>;
  orderingVerifyOTP: (
    phone: string,
    otp: string,
    locationRef: string
  ) => Promise<any>;
  updateUser: (user: any) => Promise<any>;
  updateCustomer: (customer: any) => Promise<any>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  device: null,
  customer: null,
  subscription: null,
};

export const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  issuer: Issuer.JWT,
  login: () => Promise.resolve(),
  deviceLogin: () => Promise.resolve(),
  authorize: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  deviceLogout: () => Promise.resolve(),
  userDeviceLogout: () => Promise.resolve(),
  sendCode: () => Promise.resolve(),
  orderingSendCode: () => Promise.resolve(),
  passwordReset: () => Promise.resolve(),
  register: () => Promise.resolve(),
  verifyOTP: () => Promise.resolve(),
  orderingVerifyOTP: () => Promise.resolve(),
  updateUser: () => Promise.resolve(),
  updateCustomer: () => Promise.resolve(),
});

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [appState, setAppState] = useState(initialState);
  const { setUserType } = useUserType();
  const { updateLanguage } = usePreferredLanguage();

  const initAppState = useCallback(
    ({
      user,
      device,
      customer,
      token,
      deviceToken,
      subscription,
    }: {
      user: User;
      device: Device;
      customer: Customer;
      token: string;
      deviceToken: string;
      subscription: any;
    }) => {
      setAppState({
        isAuthenticated: Boolean(token && user),
        isInitialized: true,
        user,
        device,
        customer,
        subscription,
      });
    },
    []
  );

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        const accessToken = window.localStorage.getItem(STORAGE_KEY);
        const accessDeviceToken =
          window.localStorage.getItem(STORAGE_KEY_DEVICE);
        const user = JSON.parse(window.localStorage.getItem("user"));
        const device = JSON.parse(window.localStorage.getItem("device"));
        const customer = JSON.parse(window.localStorage.getItem("customer"));
        const subscription = JSON.parse(
          window.localStorage.getItem("subscription")
        );

        initAppState({
          user,
          device,
          customer,
          token: accessToken,
          deviceToken: accessDeviceToken,
          subscription,
        });
      } catch (err) {
        console.error(err);
      }
    };

    initialize();
  }, []);

  const login = async (mobile: string, password: string): Promise<void> => {
    const res = await serviceCaller(endpoint.login.path, {
      method: endpoint.login.method,
      body: {
        phone: mobile,
        password,
        authType: "password",
      },
    });

    if (res.token && res.user) {
      localStorage.setItem(STORAGE_KEY, res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("subscription", JSON.stringify(res.subscription));
      const device = JSON.parse(localStorage.getItem("device"));
      const deviceToken = localStorage.getItem(STORAGE_KEY_DEVICE);
      const lng = localStorage.getItem("currentLanguage");
      const resData = await updateLanguage({
        params: { id: res?.user?._id },
        body: { language: lng || "en" },
      });

      if (resData != null) {
        localStorage.setItem("currentLanguage", lng || "en");
      }
      localStorage.setItem("userType", res?.user?.userType);
      setUserType(res?.user?.userType);

      initAppState({
        user: res.user,
        device: device,
        customer: null,
        token: res.token,
        deviceToken,
        subscription: res.subscription,
      });

      if (res?.subscription?.modules.length > 0) {
        localStorage.setItem(
          "modulePermission",
          JSON.stringify([
            ...res.subscription.modules.flatMap((module: any) =>
              module.subModules?.length
                ? module.subModules.map((subModule: any) => ({
                    key: subModule.key,
                    name: subModule.name,
                  }))
                : [
                    {
                      key: module.key,
                      name: module.name,
                    },
                  ]
            ),
            ...(res.subscription.addons?.length
              ? res.subscription.addons.flatMap((addon: any) =>
                  addon.subModules?.length
                    ? addon.subModules.map((subModule: any) => ({
                        key: subModule.key,
                        name: subModule.name,
                      }))
                    : [
                        {
                          key: addon.key,
                          name: addon.name,
                        },
                      ]
                )
              : []),
          ])
        );
      }
    }

    return res;
  };

  const deviceLogin = async (code: string, password: string): Promise<void> => {
    const res = await serviceCaller(endpoint.login.path, {
      method: endpoint.login.method,
      body: {
        email: code + "@posApp",
        password: password,
        authType: "email",
      },
    });

    if (res.token && res.user) {
      localStorage.setItem(STORAGE_KEY_DEVICE, res.token);
      localStorage.setItem("device", JSON.stringify(res.user));
      localStorage.setItem("subscription", JSON.stringify(res.subscription));

      initAppState({
        user: null,
        device: res.user,
        customer: null,
        token: "",
        deviceToken: res.token,
        subscription: res.subscription,
      });

      if (res?.subscription?.modules.length > 0) {
        localStorage.setItem(
          "modulePermission",
          JSON.stringify([
            ...res.subscription.modules.flatMap((module: any) =>
              module.subModules?.length
                ? module.subModules.map((subModule: any) => ({
                    key: subModule.key,
                    name: subModule.name,
                  }))
                : [
                    {
                      key: module.key,
                      name: module.name,
                    },
                  ]
            ),
            ...(res.subscription.addons?.length
              ? res.subscription.addons.flatMap((addon: any) =>
                  addon.subModules?.length
                    ? addon.subModules.map((subModule: any) => ({
                        key: subModule.key,
                        name: subModule.name,
                      }))
                    : [
                        {
                          key: addon.key,
                          name: addon.name,
                        },
                      ]
                )
              : []),
          ])
        );
      }
    }

    return res;
  };

  const authorize = async (posId: string, mobile: string): Promise<void> => {
    const res = await serviceCaller(endpoint.authorize.path, {
      method: endpoint.authorize.method,
      headers: { "x-pos-id": posId },
      body: { phone: mobile },
    });

    if (res.token && res.user) {
      localStorage.setItem(STORAGE_KEY, res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("subscription", JSON.stringify(res.subscription));
      const device = JSON.parse(localStorage.getItem("device"));
      const accessDeviceToken = window.localStorage.getItem(STORAGE_KEY_DEVICE);
      const lng = localStorage.getItem("currentLanguage");
      const resData = await updateLanguage({
        params: { id: res.user._id },
        body: { language: lng || "en" },
      });

      if (resData != null) {
        localStorage.setItem("currentLanguage", lng || "en");
      }
      localStorage.setItem("userType", res.user.userType);
      setUserType(res.user.userType);

      if (res?.subscription?.modules.length > 0) {
        localStorage.setItem(
          "modulePermission",
          JSON.stringify([
            ...res.subscription.modules.flatMap((module: any) =>
              module.subModules?.length
                ? module.subModules.map((subModule: any) => ({
                    key: subModule.key,
                    name: subModule.name,
                  }))
                : [
                    {
                      key: module.key,
                      name: module.name,
                    },
                  ]
            ),
            ...(res.subscription.addons?.length
              ? res.subscription.addons.flatMap((addon: any) =>
                  addon.subModules?.length
                    ? addon.subModules.map((subModule: any) => ({
                        key: subModule.key,
                        name: subModule.name,
                      }))
                    : [
                        {
                          key: addon.key,
                          name: addon.name,
                        },
                      ]
                )
              : []),
          ])
        );
      }

      initAppState({
        user: res.user,
        device: device,
        customer: null,
        token: res.token,
        deviceToken: accessDeviceToken,
        subscription: res.subscription,
      });
    }

    return res;
  };

  const logout = async (): Promise<any> => {
    const device = JSON.parse(localStorage.getItem("device"));

    if (device?._id) {
      const deveicePassword = generateUniqueCode(6);

      serviceCaller(`/device/${device?.deviceRef}`, {
        method: "PATCH",
        body: {
          deviceCode: device?.phone,
          pin: deveicePassword,
          devicePin: deveicePassword,
          connectivityStatus: "offline",
        },
      });
    }

    setAppState({
      isAuthenticated: false,
      isInitialized: true,
      user: null,
      device: null,
      customer: null,
      subscription: null,
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_DEVICE);
  };

  const deviceLogout = async (): Promise<any> => {
    const device = JSON.parse(localStorage.getItem("device"));

    setAppState({
      isAuthenticated: false,
      isInitialized: true,
      user: null,
      device: device,
      customer: null,
      subscription: null,
    });
  };

  const userDeviceLogout = async (
    deviceId: string,
    deviceCode: string
  ): Promise<any> => {
    const token = localStorage.getItem(STORAGE_KEY);
    const user = JSON.parse(localStorage.getItem("user"));
    const deveicePassword = generateUniqueCode(6);

    initAppState({
      user,
      device: null,
      customer: null,
      token,
      deviceToken: "",
      subscription: null,
    });

    const res = await serviceCaller(`/device/${deviceId}`, {
      method: "PATCH",
      body: {
        deviceCode: deviceCode,
        pin: deveicePassword,
        devicePin: deveicePassword,
        connectivityStatus: "offline",
      },
    });

    return res;
  };

  const sendCode = async (mobile: string): Promise<void> => {
    const res = await serviceCaller(endpoint.sendOtp.path, {
      method: endpoint.sendOtp.method,
      body: { phone: mobile, for: "reset-password" },
    });
    if (res.message == "Ok") {
    }
    return res;
  };

  const orderingSendCode = async (mobile: string): Promise<void> => {
    const res = await serviceCaller(endpoint.orderingSendOTP.path, {
      method: endpoint.orderingSendOTP.method,
      body: { phone: mobile },
    });
    if (res.message == "Ok") {
    }
    return res;
  };

  const passwordReset = async (
    mobile: string,
    code: string,
    password: string
  ): Promise<void> => {
    const res = await serviceCaller(endpoint.resetPassword.path, {
      method: endpoint.resetPassword.method,
      body: {
        phone: mobile,
        otp: code,
        newPassword: password,
      },
    });
    if (res) {
    }

    return res;
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    profilePicture: string,
    password: string
  ): Promise<void> => {
    const res = await serviceCaller(endpoint.register.path, {
      method: endpoint.register.method,
      body: {
        name,
        email,
        phone,
        profilePicture,
        password,
        userType: USER_TYPES.ADMIN,
      },
    });

    if (res) {
    }
    return res;
  };

  const verifyOTP = async (
    email: string,
    name: string,
    otp: string,
    password: string,
    phone: string,
    profilePicture: string
  ): Promise<void> => {
    const res = await serviceCaller(endpoint.verifyOTP.path, {
      method: endpoint.verifyOTP.method,
      body: {
        email,
        name,
        otp,
        password,
        phone,
        profilePicture,
        // userType: USER_TYPES.ADMIN,
      },
    });

    if (res.user && res.token) {
      const device = JSON.parse(localStorage.getItem("device"));
      const accessDeviceToken = window.localStorage.getItem(STORAGE_KEY_DEVICE);
      localStorage.setItem(STORAGE_KEY, res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("userType", res?.user?.userType);
      setUserType(res?.user?.userType);

      initAppState({
        user: res.user,
        device: device,
        customer: null,
        token: res.token,
        deviceToken: accessDeviceToken,
        subscription: res.subscription,
      });
    }
    return res;
  };

  const orderingVerifyOTP = async (
    phone: string,
    otp: string,
    locationRef: string
  ): Promise<void> => {
    const res = await serviceCaller(endpoint.orderingVerifyOTP.path, {
      method: endpoint.orderingVerifyOTP.method,
      body: {
        phone,
        otp,
        locationRef,
      },
    });

    if (res.userDoc && res.customerDoc && res.token) {
      localStorage.setItem(STORAGE_KEY, res.token);
      localStorage.setItem("user", JSON.stringify(res.userDoc));
      localStorage.setItem("customer", JSON.stringify(res.customerDoc));
      localStorage.setItem("userType", res?.userDoc?.userType);
      setUserType(res?.userDoc?.userType);

      initAppState({
        user: res.userDoc,
        device: null,
        customer: res.customerDoc,
        token: res.token,
        deviceToken: "",
        subscription: null,
      });
    }
    return res;
  };

  const updateUser = async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const user = JSON.parse(localStorage.getItem("user"));
    const device = JSON.parse(localStorage.getItem("device"));
    const accessDeviceToken = window.localStorage.getItem(STORAGE_KEY_DEVICE);
    const subscription = JSON.parse(localStorage.getItem("subscription"));
    initAppState({
      user,
      device,
      customer: null,
      token,
      deviceToken: accessDeviceToken,
      subscription: subscription,
    });
  };

  const updateCustomer = async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const user = JSON.parse(localStorage.getItem("user"));
    const customer = JSON.parse(localStorage.getItem("customer"));
    initAppState({
      user,
      device: null,
      customer,
      token,
      deviceToken: "",
      subscription: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...appState,
        issuer: Issuer.JWT,
        login,
        deviceLogin,
        authorize,
        logout,
        deviceLogout,
        userDeviceLogout,
        sendCode,
        orderingSendCode,
        passwordReset,
        register,
        verifyOTP,
        orderingVerifyOTP,
        updateUser,
        updateCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;
