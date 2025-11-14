import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import serviceCaller from "../api";

export async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    if (finalStatus === "granted") {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "0f2671c5-35cf-4102-97c3-4fcecad8e7c9",
      });
      console.log("TijarahNotification", "token", token);
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("tijarah-notification", {
          name: "tijarah-notification",
          importance: Notifications.AndroidImportance.MAX,
          sound: "notification_sound.mp3",
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      await serviceCaller("/user/push-token", {
        method: "PUT",
        body: { token: token.data },
      }).catch((err: any) => {
        console.log("TijarahNotification", "push-token-api error", err);
      });

      return token;
    }
  }
}
