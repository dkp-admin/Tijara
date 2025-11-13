import serviceCaller from "../../api";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import * as SqliteBackup from "sqlite-backup";

import { format } from "date-fns";

export async function handleBackupNotification(notification: any) {
  const data =
    process.env.EXPO_PUBLIC_APP_ENV === "qa"
      ? notification?.request?.content?.data
      : JSON.parse(notification?.request?.content?.data?.body || {});

  const deviceUser = MMKVDB.get(DBKeys.DEVICE);

  if (data?.deviceCode !== "" && data?.deviceCode !== deviceUser.phone) {
    return;
  }

  serviceCaller("/s3/signed-url", {
    query: {
      namespace: "db_backup",
      fileName: `${deviceUser.phone}-${format(new Date(), "hh:mma-ddMMyyyy")}`,
      mimeType: `application/octet-stream`,
    },
  }).then((res) => {
    SqliteBackup.uploadDb(res.url)
      .then((res) => {})
      .catch((err) => {});
  });
  MMKVDB.set("LAST_BACKUP", new Date().toISOString());
}
