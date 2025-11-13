import { reloadAsync } from "expo-updates";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";

export async function handleReloadNotification(notification: any) {
  const data =
    process.env.EXPO_PUBLIC_APP_ENV === "qa"
      ? notification?.request?.content?.data
      : JSON.parse(notification?.request?.content?.data?.body || {});
  const deviceUser = MMKVDB.get(DBKeys.DEVICE);

  if (data?.deviceCode !== "" && data?.deviceCode !== deviceUser.phone) {
    return;
  }
  reloadAsync().then(() => console.log("RELOADED"));
}
