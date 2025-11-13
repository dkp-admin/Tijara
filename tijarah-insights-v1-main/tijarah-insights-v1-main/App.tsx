import Netinfo from "@react-native-community/netinfo";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { setI18nConfig, t } from "./i18n";
import serviceCaller from "./src/api";
import DefaultText from "./src/components/text/Text";
import { AuthConsumer, AuthProvider } from "./src/context/jwt-context";
import { ThemeContextProvider } from "./src/context/theme-context";
import loadFonts from "./src/hooks/use-fonts";
import Navigation from "./src/navigation";
import DB from "./src/utils/DB";
import { DBKeys } from "./src/utils/DBKeys";
import { useNavigation } from "@react-navigation/native";
import { EventRegister } from "react-native-event-listeners";

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  // const navigation = useNavigation() as any;
  const [IsReady, SetIsReady] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [isConnected, setIsConnected] = useState(false);

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    DB.retrieveData(DBKeys.LANG).then((language: any) => {
      setI18nConfig(language || "en").then(() => {});
    });
  }, []);

  // useEffect(() => {
  //   DB.retrieveData(DBKeys.THEME_MODE).then((theme: any) => {
  //     setThemeMode(theme || "light");
  //   });
  // }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await loadFonts();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        SetIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    (async () => {
      if (IsReady) {
        await SplashScreen.hideAsync();
      }
    })();
  }, [IsReady]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        serviceCaller("/user/push-token", {
          method: "PUT",
          body: { token: token },
        })
          .then((r: any) => {
            console.info("UPDATED PUSH TOKEN : ", token);
          })
          .catch((err) => console.log(err));
      }

      // notificationListener.current =
      //   Notifications.addNotificationReceivedListener((notification: any) => {
      //     const data = notification?.request?.content?.data;
      //     console.log("data", notification);

      //     if (data?.action === "sales") {
      //     } else if (
      //       data?.action === "lowStockAlert" ||
      //       data?.action === "outOfStock" ||
      //       data?.action == "outOfStocks"
      //     ) {
      //     }
      //   });

      // responseListener.current =
      //   Notifications.addNotificationResponseReceivedListener((response) => {
      //     // console.log("notify res", response);
      //   });

      // return () => {
      //   Notifications.removeNotificationSubscription(
      //     notificationListener.current
      //   );
      //   Notifications.removeNotificationSubscription(responseListener.current);
      // };
    });
  });

  useEffect(() => {
    Netinfo.fetch().then((state: any) => {
      setIsConnected(state.isConnected);
    });
  });

  if (!IsReady) {
    return null;
  }

  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style={themeMode === "light" ? "dark" : "light"} />

        <DefaultText
          style={{ textAlign: "center" }}
          fontWeight="bold"
          fontSize={"xl"}
          color="error.dark"
        >
          {t("No Internet")}
        </DefaultText>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <AuthProvider>
            <AuthConsumer>
              {(auth) =>
                !auth.isInitialized ? (
                  <></>
                ) : (
                  <Navigation colorScheme={"light"} />
                )
              }
            </AuthConsumer>
          </AuthProvider>
          <StatusBar style={themeMode === "light" ? "dark" : "light"} />
        </ThemeContextProvider>
      </QueryClientProvider>
      <Toast />
    </SafeAreaProvider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "tijarah-app",
      importance: Notifications.AndroidImportance.MAX,
      sound: Platform.OS === "android" ? null : "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notifications!");
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "6107991e-125a-4b4f-8763-d8a18b585a73",
      })
    ).data;

    return token;
  } catch (error) {
    console.log(error);
  }
}
