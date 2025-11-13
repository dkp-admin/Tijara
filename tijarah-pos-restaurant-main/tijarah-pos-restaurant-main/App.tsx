import * as Device from "expo-device";
import * as ExpoPrintHelp from "expo-print-help";
import * as SplashScreen from "expo-splash-screen";
import JailMonkey from "jail-monkey";
import React, { useEffect, useMemo, useState } from "react";
import { AppState, StatusBar, Text, TouchableOpacity } from "react-native";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryClientProvider } from "react-query";
import "reflect-metadata";
import * as SqliteBackup from "sqlite-backup";
import { HOST } from "./config";
import { setI18nConfig } from "./i18n";
import { initBackgroundTasks } from "./src/background-tasks";
import AuthContext from "./src/context/auth-context";
import DeviceContext from "./src/context/device-context";
import { ThemeContextProvider } from "./src/context/theme-context";
import { Database } from "./src/db";
import loadFonts from "./src/hooks/loadFonts";
import Navigation from "./src/navigation";
import { initNotificationManager } from "./src/notifications/notification-manager";
import { buildPermission } from "./src/permissionManager/build-permission";
import { UserPermissions } from "./src/permissionManager/permission-manager";
import { queryClient } from "./src/query-client";
import InvalidTimezone from "./src/screens/authentication/invalid-timezone";
import { useCurrency } from "./src/store/get-currency";
import { useSubscription } from "./src/store/subscription-store";
import { useTimezoneValidator } from "./src/store/timezone-validator";
import SyncQueue from "./src/sync/sync-queue";
import { AuthType } from "./src/types/auth-types";
import MMKVDB from "./src/utils/DB-MMKV";
import { DBKeys } from "./src/utils/DBKeys";
import { setupLogger } from "./src/utils/axiom-logger";
import { checkExpoUpdates } from "./src/utils/checkExpoUpdates";
import { checkForDeviceUpdate } from "./src/utils/checkForDeviceUpdate";
import requestAndroid31Permissions from "./src/utils/requestAndroid31Permissions";
import { sendDeviceDetails } from "./src/utils/send-device-details";
const SyncPolling = require("./src/sync/sync-polling").default;

export default function App() {
  const [user, setUser] = useState(null) as any;
  const [permission, setPermission] = useState<UserPermissions>();
  const [deviceUser, setDeviceUser] = useState(null) as any;
  const [IsReady, SetIsReady] = useState(false);
  const { timezoneError } = useTimezoneValidator();
  const [darkMode, setDarkMode] = useState<any>(null);
  const businessDetails = MMKVDB.get(DBKeys.BUSINESS_DETAILS);

  useEffect(() => {
    const theme = MMKVDB.get(DBKeys.THEME_MODE);
    setDarkMode(theme);

    const device = MMKVDB.get(DBKeys.DEVICE);
    setDeviceUser(device);

    const user = MMKVDB.get(DBKeys.USER);
    setUser(user);

    const language = MMKVDB.get(DBKeys.LANG);
    setI18nConfig(language || "en").then(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      const permissions = buildPermission(user.permissions);
      setPermission(permissions);
    }
  }, [user]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: any) => {
        if (nextAppState === "active") {
          initBackgroundTasks();
          checkForDeviceUpdate({
            appStoreType: Device.brand === "SUNMI" ? "sunmi" : "google",
          }).then(() => {
            checkExpoUpdates();
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await loadFonts();
        await SyncQueue.initialize();
        await ExpoPrintHelp.initializeSunmi();
        await Database.getInstance().init();
        await requestAndroid31Permissions();
      } catch (e: any) {
        SetIsReady(false);
      } finally {
        await ExpoPrintHelp.initializeBt();
        if (Device.isDevice) {
          await ExpoPrintHelp.initialize();
        }
        SetIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    (async () => {
      useTimezoneValidator.getState().checkTimezone(); //
      useCurrency.getState().setCurrency();
      await SplashScreen.hideAsync();
      if (Device.brand === "qcom" || !Device.isDevice) {
        if (IsReady && !JailMonkey.isJailBroken()) {
          await SplashScreen.hideAsync();
          if (deviceUser) {
            setupLogger({
              deviceCode: deviceUser.phone,
            });
            sendDeviceDetails(deviceUser.deviceRef);
            const token = MMKVDB.get(DBKeys.TOKEN);

            await SqliteBackup.setupPeriodicBackup(
              token,
              deviceUser._id,
              HOST,
              deviceUser.phone
            );
          }
        } else {
        }
      } else {
        await SplashScreen.hideAsync();
        if (deviceUser) {
          setupLogger({
            deviceCode: deviceUser.phone,
          });
          const token = MMKVDB.get(DBKeys.TOKEN);
          sendDeviceDetails(deviceUser.deviceRef);

          await SqliteBackup.setupPeriodicBackup(
            token,
            deviceUser._id,
            HOST,
            deviceUser.phone
          );
        }
      }
    })();
  }, [IsReady]);

  useEffect(() => {
    if (deviceUser) {
      if (
        businessDetails &&
        businessDetails?.[0]?.company?.syncMethod === "push-notification"
      ) {
        initNotificationManager()
          .then((res: any) => console.log(res))
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [deviceUser, businessDetails]);

  // useEffect(() => {
  //   if (deviceUser) {
  //     if (businessDetails && businessDetails?.[0]?.company?.ownerRef) {
  //       useSubscription.getState().fetchSubscription();
  //     }
  //   }
  // }, [deviceUser, businessDetails]);

  useMemo(() => {
    if (
      businessDetails &&
      businessDetails?.[0]?.company?.syncMethod === "sync-polling"
    ) {
      SyncPolling.initialize();
    }
  }, [businessDetails]);

  const deviceContext = {
    user: deviceUser,
    login: (user: any) => {
      setDeviceUser(user);
      if (user) {
        sendDeviceDetails(user.deviceRef);
      }
    },
    logout: () => {
      setDeviceUser(null);
    },
  };

  const authContext = {
    user: user,
    login: (user: any) => {
      setUser(user);
    },
    logout: () => {
      setUser(null);
    },
    permission: permission,
  } as AuthType;

  if (!IsReady) {
    return null;
  }

  if (timezoneError) {
    return <InvalidTimezone />;
  }

  return (
    <>
      <TouchableOpacity
        style={{ position: "absolute", left: 100000 }}
        onPress={(e) => {
          e.preventDefault();
        }}
      >
        <Text>PRESS</Text>
      </TouchableOpacity>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeContextProvider>
            <DeviceContext.Provider value={deviceContext}>
              <AuthContext.Provider value={authContext}>
                <Navigation colorScheme={darkMode} />
              </AuthContext.Provider>
            </DeviceContext.Provider>
            <StatusBar barStyle={"dark-content"} backgroundColor={"#F2F2F7"} />
          </ThemeContextProvider>
        </QueryClientProvider>
        <Toast />
      </SafeAreaProvider>
    </>
  );
}
