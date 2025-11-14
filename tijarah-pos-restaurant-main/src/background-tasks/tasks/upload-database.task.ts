import { DBKeys } from "../../utils/DBKeys";
import MMKVDB from "../../utils/DB-MMKV";
import { format } from "date-fns";
import serviceCaller from "../../api";
import { differenceInHours } from "date-fns";
import { BackgroundFetchResult } from "expo-background-fetch";
import * as SqliteBackup from "sqlite-backup";

export const uploadDatabaseTask = () => {
  try {
    const device = MMKVDB.get(DBKeys.DEVICE);

    if (!device) return;

    const lastBackup = MMKVDB.get("LAST_BACKUP");

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
        SqliteBackup.uploadDb(res.url).then((res) => {});
      });

    MMKVDB.set("LAST_BACKUP", new Date().toISOString());

    return BackgroundFetchResult.NewData;
  } catch (err: any) {
    return BackgroundFetchResult.NewData;
  }
};
