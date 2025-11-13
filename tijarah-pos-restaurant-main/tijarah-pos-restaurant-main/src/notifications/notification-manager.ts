import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { logInfo } from "../utils/axiom-logger";
import { checkForDeviceUpdate } from "../utils/checkForDeviceUpdate";
import { handleBackupNotification } from "./handler/backup-handler";
import { handleReloadNotification } from "./handler/reload-handler";
import { requestIdSyncHandler } from "./handler/request-id-sync-handler";
import { syncPullHandler } from "./handler/sync-pull-handler";
import { registerForPushNotificationsAsync } from "./register-push-notification";

Notifications.setNotificationHandler({
  handleNotification: async (notification: any) => {
    const channelId = notification.request.trigger?.channelId;

    if (channelId === "entity-change") {
      // Silent notifications: Only run logic, no UI update
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };
    }

    // For visible notifications
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      sound: "default",
    };
  },
});

async function handleNotification(notification: any) {
  const data = JSON.parse(notification?.request?.content?.data?.body || {});

  if (data?.action === "trigger-sqlite-backup") {
    logInfo(`[Notification]`, data);
    handleBackupNotification(notification);
  } else if (data?.action === "reload_app") {
    logInfo(`[Notification]`, data);
    handleReloadNotification(notification);
  } else if (data?.action === "request_id_sync") {
    logInfo(`[Notification]`, data);
    requestIdSyncHandler(notification);
  } else if (data?.action === "pull") {
    logInfo(`[Notification]`, data);
    syncPullHandler(notification);
  } else if (data?.action === "update") {
    logInfo(`[Notification]`, data);
    checkForDeviceUpdate({
      appStoreType: Device.brand === "SUNMI" ? "sunmi" : "google",
    });
  } else if (
    data?.action === "session_expired" ||
    data?.action == "logged_out"
  ) {
    // logInfo(`[Notification]`, data);
    // authContext.logout();
    // logoutDevice(deviceContext);
  }
}

export async function initNotificationManager() {
  await registerForPushNotificationsAsync();
  return Notifications.addNotificationReceivedListener(handleNotification);
}
