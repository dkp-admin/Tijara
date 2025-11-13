import { differenceInHours, format } from "date-fns";
import * as BackgroundFetch from "expo-background-fetch";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import * as TaskManager from "expo-task-manager";
import { reloadAsync } from "expo-updates";
import JailMonkey from "jail-monkey";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform, StatusBar } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryClientProvider } from "react-query";
import "reflect-metadata";
import * as SqliteBackup from "sqlite-backup";
import { setI18nConfig } from "./i18n";
import serviceCaller from "./src/api";
import endpoint from "./src/api/endpoints";
import AuthContext from "./src/context/auth-context";
import DeviceContext from "./src/context/device-context";
import { ThemeContextProvider } from "./src/context/theme-context";
import { CheckRequestModel } from "./src/database/check-request/check-request";
import loadFonts from "./src/hooks/loadFonts";
import Navigation from "./src/navigation";
import { buildPermission } from "./src/permissionManager/build-permission";
import { UserPermissions } from "./src/permissionManager/permission-manager";
import { queryClient } from "./src/query-client";
import requestIdDatabasePush from "./src/sync/request-id-database-push";
import { AuthType } from "./src/types/auth-types";
import EntityNames from "./src/types/entity-name";
import MMKVDB from "./src/utils/DB-MMKV";
import { DBKeys } from "./src/utils/DBKeys";
import { objectId } from "./src/utils/bsonObjectIdTransformer";
import { checkExpoUpdates } from "./src/utils/checkExpoUpdates";
import { checkForDeviceUpdate } from "./src/utils/checkForDeviceUpdate";
import { checkForDeviceUpdateSunmi } from "./src/utils/checkForDeviceUpdateSunmi";
import { SYNC_DB } from "./src/utils/constants";
import { db, repo } from "./src/utils/createDatabaseConnection";
import { debugLog, errorLog } from "./src/utils/log-patch";
import { logoutDevice } from "./src/utils/logoutDevice";
import { sendDeviceDetails } from "./src/utils/send-device-details";
import { cleanUpProducts } from "./src/utils/clear-products";

const LIMIT_ORDERS_TASK = "LIMIT_ORDERS_PULL_TASK";

TaskManager.defineTask(LIMIT_ORDERS_TASK, async () => {
  try {
    const device = MMKVDB.get(DBKeys.DEVICE);

    if (!device) return;
    debugLog("Device found.", device, "app.tsx", "sqlitedeleteoldorders");

    await repo.order
      .createQueryBuilder()
      .delete()
      .where(
        `"_id" IN (SELECT "_id" FROM "orders" ORDER BY "createdAt" DESC LIMIT -1 OFFSET 5000)`
      )
      .execute();

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err: any) {
    errorLog(err?.message, {}, "app.tsx", "sqliteBackupFunction", err);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(LIMIT_ORDERS_TASK, {
    minimumInterval: 60 * 15,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(LIMIT_ORDERS_TASK);
}

// async function sendRequest(reqId: string, ops: any) {
//   debugLog(
//     "sending all pending ops to server request function",
//     reqId,
//     "app.tsx",
//     "ads-report-push-function"
//   );
//   const res = await serviceCaller(endpoint.adsReportPush.path, {
//     method: endpoint.adsReportPush.method,
//     body: {
//       requestId: reqId,
//       operations: ops,
//     },
//   });

//   debugLog(
//     "server response ads report push",
//     res,
//     "app.tsx",
//     "ads-report-push-function"
//   );

//   if (res.message !== "accepted") {
//     // Call the function again with the same parameters
//     return sendRequest(reqId, ops);
//   }

//   return res;
// }

// const PUSH_ADS_REPORT = "PUSH_ADS_REPORT";

// TaskManager.defineTask(PUSH_ADS_REPORT, async () => {
//   try {
//     debugLog("push ads report", {}, "app.tsx", "ads-report-push-function");
//     const allPendingOps = (await MMKVDB.get("adsReport")) || [];

//     debugLog(
//       "fetched pending tasks ads report",
//       {},
//       "app.tsx",
//       "ads-report-push-function"
//     );

//     const requestId = objectId();

//     debugLog(
//       "generated request id",
//       { id: requestId },
//       "app.tsx",
//       "ads-report-push-function"
//     );

//     const request: CheckRequestModel = {
//       _id: requestId,
//       entityName: "ads-report",
//       lastSync: new Date(),
//       status: "pending",
//       createdAt: new Date(),
//     };

//     debugLog(
//       "generated request object",
//       request,
//       "app.tsx",
//       "ads-report-push-function"
//     );

//     if (allPendingOps?.length > 0) {
//       debugLog(
//         "sending all pending ops to server",
//         allPendingOps,
//         "app.tsx",
//         "ads-report-push-function"
//       );
//       await sendRequest(request._id, allPendingOps);
//     }

//     await MMKVDB.set("adsReport", []);

//     debugLog("clear pending ops", [], "app.tsx", "ads-report-push-function");

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (err: any) {
//     errorLog(err?.message, {}, "app.tsx", "ads-report-push-function", err);
//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   }
// });

// async function registerBackgroundFetchAsyncPushAdsReport() {
//   return BackgroundFetch.registerTaskAsync(PUSH_ADS_REPORT, {
//     minimumInterval: 60 * 5,
//     stopOnTerminate: false,
//     startOnBoot: true,
//   });
// }

// async function unregisterBackgroundFetchAsyncPushAdsReport() {
//   return BackgroundFetch.unregisterTaskAsync(PUSH_ADS_REPORT);
// }

// const DELETE_PRODUCTS = "DELETE_PRODUCTS";

// TaskManager.defineTask(DELETE_PRODUCTS, async () => {
//   try {
//     debugLog(
//       "Background task started delete products",
//       {},
//       "app.tsx",
//       "clear-products-backgroud-task"
//     );
//     const device = MMKVDB.get(DBKeys.DEVICE);

//     cleanUpProducts(device?.deviceRef);

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (err: any) {
//     errorLog(err?.message, {}, "app.tsx", "ads-report-push-function", err);
//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   }
// });

// async function registerBackgroundFetchAsyncDeleteProducts() {
//   return BackgroundFetch.registerTaskAsync(DELETE_PRODUCTS, {
//     minimumInterval: 60 * 15,
//     stopOnTerminate: false,
//     startOnBoot: true,
//   });
// }

// async function unregisterBackgroundFetchAsyncDeleteProducts() {
//   return BackgroundFetch.unregisterTaskAsync(DELETE_PRODUCTS);
// }

const TASK_NAME = "UPLOAD_DATABASE_TASK";

TaskManager.defineTask(TASK_NAME, () => {
  try {
    // Call your upload function here
    const device = MMKVDB.get(DBKeys.DEVICE);

    if (!device) return;
    debugLog(
      "Device found for backup",
      device,
      "app.tsx",
      "sqliteBackupFunction"
    );

    const lastBackup = MMKVDB.get("LAST_BACKUP");
    debugLog(
      "Last backup date",
      { date: lastBackup },
      "app.tsx",
      "sqliteBackupFunction"
    );

    if (
      differenceInHours(new Date(), new Date(lastBackup || "")) > 5 ||
      !lastBackup ||
      lastBackup === undefined
    )
      serviceCaller("/s3/signed-url", {
        query: {
          namespace: "db_backup",
          fileName: `${device.phone}-${format(new Date(), "hh:mma-ddMMyyyy")}`,
          mimeType: `application/octet-stream`,
        },
      }).then((res) => {
        SqliteBackup.uploadDb(res.url).then((res) =>
          debugLog(
            "Sqlite backup uploaded to server",
            res,
            "app.tsx",
            "sqliteBackupFunction"
          )
        );
      });

    MMKVDB.set("LAST_BACKUP", new Date().toISOString());

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err: any) {
    errorLog(err?.message, {}, "app.tsx", "sqliteBackupFunction", err);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  }
});

const pullFromServer: any = {
  products: EntityNames.ProductsPull,
  categories: EntityNames.CategoryPull,
  collections: EntityNames.CollectionPull,
  customers: EntityNames.CustomerPull,
  companies: EntityNames.BusinessDetailsPull,
  locations: EntityNames.BusinessDetailsPull,
  orders: EntityNames.OrdersPull,
  printtemplates: EntityNames.PrintTemplatePull,
  stockhistories: EntityNames.StockHistoryPull,
  batches: EntityNames.BatchPull,
  quickitems: EntityNames.QuickItemsPull,
  charges: EntityNames.CustomChargePull,
  billingSettings: EntityNames.BillingSettingsPull,
  adsManagement: EntityNames.AdsManagementPull,
  sectionTables: EntityNames.SectionTablesPull,
  menu: EntityNames.MenuPull,
  voidComp: EntityNames.VoidCompPull,
  boxCrates: EntityNames.BoxCratesPull,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [user, setUser] = useState(null) as any;
  const [permission, setPermission] = useState<UserPermissions>();
  const [deviceUser, setDeviceUser] = useState(null) as any;
  const [IsReady, SetIsReady] = useState(false);
  const [darkMode, setDarkMode] = useState<any>(null);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isRegisteredPushReports, setIsRegisteredPushReports] =
    React.useState(false);
  const [isRegisteredDeleteProducts, setIsRegisteredDeleteProducts] =
    React.useState(false);
  // const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
  // const [updateData, setUpdateData] = useState<any>(null)
  // const [notification, setNotification] = useState<any>(null)

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    checkStatusAsync();
    // checkStatusAsyncPushReports();
    // checkStatusAsyncDeleteProducts();
  }, []);

  const checkStatusAsync = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      LIMIT_ORDERS_TASK
    );
    setIsRegistered(isRegistered);
  };

  // const checkStatusAsyncDeleteProducts = async () => {
  //   const isRegisteredDeleteProducts = await TaskManager.isTaskRegisteredAsync(
  //     DELETE_PRODUCTS
  //   );

  //   setIsRegisteredDeleteProducts(isRegisteredDeleteProducts);
  // };

  // const checkStatusAsyncPushReports = async () => {
  //   const isRegisteredPushedReports = await TaskManager.isTaskRegisteredAsync(
  //     PUSH_ADS_REPORT
  //   );
  //   setIsRegisteredPushReports(isRegisteredPushedReports);
  // };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };

  // const toggleFetchTaskDeleteProducts = async () => {
  //   if (isRegistered) {
  //     await unregisterBackgroundFetchAsyncDeleteProducts();
  //   } else {
  //     await registerBackgroundFetchAsyncDeleteProducts();
  //   }

  //   checkStatusAsync();
  // };

  // const toggleFetchTaskPushReports = async () => {
  //   if (isRegisteredPushReports) {
  //     await unregisterBackgroundFetchAsyncPushAdsReport();
  //   } else {
  //     await registerBackgroundFetchAsyncPushAdsReport();
  //   }

  //   checkStatusAsyncPushReports();
  // };

  useMemo(() => {
    const theme = MMKVDB.get(DBKeys.THEME_MODE);
    EventRegister.emit("changeTheme", theme);
  }, []);

  useMemo(() => {
    const device = MMKVDB.get(DBKeys.DEVICE);
    setDeviceUser(device);
  }, []);

  useMemo(() => {
    const user = MMKVDB.get(DBKeys.USER);
    setUser(user);
  }, []);

  useMemo(() => {
    if (user) {
      const permissions = buildPermission(user.permissions);
      setPermission(permissions);
    }
  }, [user]);

  useMemo(() => {
    const language = MMKVDB.get(DBKeys.LANG);
    setI18nConfig(language || "en").then(() => {});
  }, []);

  useMemo(() => {
    const listener = EventRegister.addEventListener("changeTheme", (data) => {
      setDarkMode(data);
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, [darkMode]);

  useMemo(() => {
    const handleAppStateChange = async (nextAppState: any) => {
      if (nextAppState === "active") {
        // checkDirectoryPermission();
        // checkMediaPermission();
        toggleFetchTask();
        // toggleFetchTaskPushReports();
        // toggleFetchTaskDeleteProducts();
        if (Device.brand !== "qcom" && Device.brand !== "SUNMI") {
          checkForDeviceUpdate();
        }
        if (Device.brand === "SUNMI") {
          checkForDeviceUpdateSunmi();
        }
        // checkUpdate()
        // checkAndRequestNotificationPermission(openAppSettings);
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await loadFonts();
        await db.initialize();
      } catch (e) {
        SetIsReady(true);
      } finally {
        SetIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    (async () => {
      await SplashScreen.hideAsync();
      debugLog("app is in ready stage", {}, "app.tsx", "useEffectHook");
      if (Device.brand === "qcom" || !Device.isDevice) {
        debugLog(
          "enter in the qcom condition check",
          {},
          "app.tsx",
          "useEffectHook"
        );
        if (IsReady && !JailMonkey.isJailBroken()) {
          debugLog(
            "enter in is ready and not jailbroken condition",
            {},
            "app.tsx",
            "useEffectHook"
          );
          await SplashScreen.hideAsync();
          debugLog(
            "Device is not rooted or jailbroken.",
            {},
            "app.tsx",
            "useEffectHook"
          );

          if (deviceUser) {
            sendDeviceDetails(deviceUser.deviceRef);
          }
        } else {
          debugLog(
            "Device is rooted or jailbroken.",
            {},
            "app.tsx",
            "useEffectHook"
          );
        }
      } else {
        debugLog(
          "enter in the else condition check , calling hideSplash()",
          {},
          "app.tsx",
          "useEffectHook"
        );
        await SplashScreen.hideAsync();
        debugLog(
          "Device is not rooted or jailbroken.",
          {},
          "app.tsx",
          "useEffectHook"
        );

        if (deviceUser) {
          sendDeviceDetails(deviceUser.deviceRef);
        }
      }
    })();
  }, [IsReady]);

  useEffect(() => {
    checkExpoUpdates();
  }, []);

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

  useEffect(() => {
    if (deviceUser) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          serviceCaller("/user/push-token", {
            method: "PUT",
            body: { token: token.data },
          })
            .then((r: any) => {
              debugLog(
                "User push token send to server",
                r,
                "app.tsx",
                "pushTokenApi"
              );
            })
            .catch((err: any) =>
              errorLog(
                err?.code,
                { token: token },
                "app.tsx",
                "pushTokenApi",
                err
              )
            );
        }
      });

      notificationListener.current =
        Notifications.addNotificationReceivedListener(
          async (notification: any) => {
            const data = notification?.request?.content?.data;

            if (data?.action === "trigger-sqlite-backup") {
              if (
                data?.deviceCode !== "" &&
                data?.deviceCode !== deviceUser.phone
              ) {
                return;
              }

              serviceCaller("/s3/signed-url", {
                query: {
                  namespace: "db_backup",
                  fileName: `${deviceUser.phone}-${format(
                    new Date(),
                    "hh:mma-ddMMyyyy"
                  )}`,
                  mimeType: `application/octet-stream`,
                },
              }).then((res) => {
                SqliteBackup.uploadDb(res.url).then((res) =>
                  debugLog(
                    "Sqlite backup uploaded to server",
                    res,
                    "app.tsx",
                    "sqliteBackupFunction"
                  )
                );
              });
              MMKVDB.set("LAST_BACKUP", new Date().toISOString());
            } else if (data?.action === "reload_app") {
              if (
                data?.deviceCode !== "" &&
                data?.deviceCode !== deviceUser.phone
              ) {
                return;
              }

              debugLog("Reloading App", {}, "app.tsx", "sqliteBackupFunction");
              reloadAsync().then(() => console.log("RELOADED"));
            } else if (data?.action === "request_id_sync") {
              requestIdDatabasePush
                .pushEntityRequestId(data.requestId, data.entityName)
                .then((r) =>
                  debugLog(
                    "Successfully sync from reuqest id " +
                      data.requestId +
                      " " +
                      data.entityName,
                    r,
                    "app.tsx",
                    "pushNotificationEffectFunction"
                  )
                );
            } else if (data?.action === SYNC_DB.PULL) {
              data.entities.forEach((entityName: any) => {
                debugLog(entityName, data, "app.tsx", "syncEnqueueEvent");
                EventRegister.emit("sync:enqueue", {
                  entityName: pullFromServer[entityName],
                });
              });
            } else if (data?.action === "update") {
              if (Device.brand !== "qcom" && Device.brand !== "SUNMI") {
                checkForDeviceUpdate();
              }
              if (Device.brand === "SUNMI") {
                checkForDeviceUpdateSunmi();
              }
            } else if (
              data?.action === "session_expired" ||
              data?.action == "logged_out"
            ) {
              debugLog(
                "Session expired or logout action getting from notification",
                data,
                "app.tsx",
                "notificationListenerFunction"
              );
              authContext.logout();
              logoutDevice(deviceContext);
            }
          }
        );

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("notify res", response);
        });

      return () => {
        Notifications.removeNotificationSubscription(
          notificationListener.current!
        );
        Notifications.removeNotificationSubscription(responseListener.current!);
      };
    }
  }, [deviceUser]);

  if (!IsReady) {
    return null;
  }

  return (
    <>
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

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      debugLog(
        "Failed to get push token for push notifications!",
        { status: finalStatus },
        "app.tsx",
        "registerPushTokenFunction"
      );
      return;
    }

    token = await Notifications.getExpoPushTokenAsync({
      projectId: "4a9a53fc-afde-4206-a608-7de1c651fead", //Constants?.expoConfig?.extra?.eas?.projectId,
    });

    // For android
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        // sound: Platform.OS === "android" ? null : "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } else {
    debugLog(
      "Must use physical device for Push Notifications",
      {},
      "app.tsx",
      "registerPushTokenFunction"
    );
  }
}
