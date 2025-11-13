import AsyncStorage from "@react-native-async-storage/async-storage";
import PropTypes from "prop-types";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { t } from "../../i18n";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import showToast from "../components/toast";
import type { User } from "../types/user";
import { DBKeys } from "../utils/DBKeys";
import { ERRORS } from "../utils/errors";

interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthContextValue extends State {
  login: (mobile: string, password: string) => Promise<any>;
  sendOTP: (mobile: string) => Promise<any>;
  passwordReset: (
    mobile: string,
    code: string,
    password: string
  ) => Promise<any>;
  logout: () => Promise<any>;
  updateUser: (user: any) => Promise<any>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

export const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  login: () => Promise.resolve(),
  sendOTP: () => Promise.resolve(),
  passwordReset: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateUser: () => Promise.resolve(),
});

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [appState, setAppState] = useState(initialState);

  const initAppState = useCallback(
    ({ user, token }: { user: User; token: string }) => {
      setAppState({
        isAuthenticated: Boolean(token && user),
        isInitialized: true,
        user,
      });
    },
    []
  );

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        let company = null;
        const userObj: any = JSON.parse(
          (await AsyncStorage.getItem(DBKeys.USER)) as any
        );
        const accessToken = await AsyncStorage.getItem(DBKeys.TOKEN);

        if (accessToken) {
          company = await serviceCaller(`/company/${userObj?.companyRef}`);

          if (company) {
            await AsyncStorage.setItem(
              DBKeys.USER,
              JSON.stringify({ ...userObj, company: company })
            );
            initAppState({
              user: { ...userObj, company: company },
              token: accessToken,
            } as any);
          }
        } else {
          await AsyncStorage.removeItem(DBKeys.TOKEN);
          await AsyncStorage.removeItem(DBKeys.USER);

          setAppState({
            isAuthenticated: false,
            isInitialized: true,
            user: null,
          });
        }
      } catch (err) {
        console.error(err);
        initAppState({ user: null, token: null } as any);
      }
    };

    initialize();
  }, []);

  const login = async (mobile: string, password: string): Promise<void> => {
    try {
      const res = await serviceCaller(endpoint.login.path, {
        method: endpoint.login.method,
        body: {
          phone: mobile,
          password,
          authType: "password",
        },
      });

      console.log("kjkjkj", res);

      if (res.token && res.user) {
        await AsyncStorage.setItem(DBKeys.TOKEN, res.token);
        await AsyncStorage.setItem(DBKeys.USER, JSON.stringify(res.user));
        initAppState(res as any);
      }

      return res;
    } catch (error: any) {
      if (error?.code == "not_found") {
        showToast("error", ERRORS.USER_NOT_FOUND);
      } else if (error?.code == "bad_password") {
        showToast("error", ERRORS.INVALID_PASSWORD);
      } else {
        showToast("error", "Login Failed!", error.message);
      }
    }
  };

  const sendOTP = async (mobile: string): Promise<void> => {
    const res = await serviceCaller(endpoint.sendOtp.path, {
      method: endpoint.sendOtp.method,
      body: { phone: mobile, for: "reset-password" },
    });

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

    return res;
  };

  const logout = async (): Promise<any> => {
    try {
      const res = await serviceCaller(endpoint.logout.path, {
        method: endpoint.logout.method,
      });

      if (res?.loggedOut) {
        await AsyncStorage.removeItem(DBKeys.TOKEN);
        await AsyncStorage.removeItem(DBKeys.USER);

        setAppState({
          isAuthenticated: false,
          isInitialized: true,
          user: null,
        });

        showToast("success", t("User Logout Successfully!"));
      }
    } catch (error: any) {
      console.log("err", error);
      showToast("error", t("Logout Failed!"), t(ERRORS.SOMETHING_WENT_WRONG));
    }
  };

  const updateUser = async () => {
    const token = await AsyncStorage.getItem(DBKeys.TOKEN);
    const user = JSON.parse((await AsyncStorage.getItem(DBKeys.USER)) as any);

    initAppState({
      user,
      token,
    } as any);
  };

  return (
    <AuthContext.Provider
      value={{
        ...appState,
        login,
        sendOTP,
        passwordReset,
        logout,
        updateUser,
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
