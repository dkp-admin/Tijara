import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import i18n from "../../i18n";

export const checkAndRequestNotificationPermission = async (onPress: any) => {
  const notificationPermissionAllowed = await checkNotificationPermission();

  if (!notificationPermissionAllowed) {
    const { status } = await Notifications.getPermissionsAsync();

    if (status === "denied") {
      // Permission denied

      Alert.alert(
        i18n.t("Notification"),
        i18n.t(
          "Tijarah recommends that you to allow notification permission from settings to sync with data"
        ),
        [
          {
            text: i18n.t("OK"),
            onPress: async () => {
              onPress();
            },
          },
        ]
      );
    }
  }
};

const checkNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  return existingStatus === "granted";
};
