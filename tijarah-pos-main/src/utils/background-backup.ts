import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";
import MMKVDB from "./DB-MMKV";
import { debugLog, errorLog } from "./log-patch";
export const BACKGROUND_FETCH_TASK = "background-fetch-task";

// const deleteOldFiles = async (directoryUri: string) => {
//   try {
//     const files = await StorageAccessFramework.readDirectoryAsync(directoryUri);
//     const now = Date.now();
//     const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

//     for (const file of files) {
//       const filePath = file;
//       const fileInfo: any = await FileSystem.getInfoAsync(filePath);
//       if (
//         fileInfo.modificationTime &&
//         fileInfo.modificationTime < sevenDaysAgo
//       ) {
//         await StorageAccessFramework.deleteAsync(filePath);
//         console.log(`Deleted file: ${file}`);
//       }
//     }
//   } catch (error) {
//     console.log("Error deleting old files:", error);
//   }
// };

// const syncWithBackend = async (directoryUri: string) => {
//   try {
//     const files = await StorageAccessFramework.readDirectoryAsync(directoryUri);
//     let token = MMKVDB.get(DBKeys.TOKEN);

//     for (const file of files) {
//       const filePath = file;
//       const fileInfo: any = await FileSystem.readAsStringAsync(filePath, {
//         encoding: "base64",
//       });

//       const formData = new FormData();
//       formData.append("data", JSON.stringify(fileInfo));

//       const requestOptions = {
//         method: endpoint.log.method,
//         body: formData,
//         Authorization: `Bearer ${token || ""}`,
//       };

//       // Replace serviceCaller with fetch
//       await fetch(endpoint.sqlite.path, requestOptions);
//     }
//   } catch (error) {
//     console.log("Error sync with server:", error);
//   }
// };

export const backupSqlite = async () => {
  const uri = MMKVDB.get("permissionDir");

  const now = Date.now();
  console.log(
    `SQLite Backup - Backup in progress : ${new Date(now).toISOString()}`
  );

  const mediaAccess = MMKVDB.get("mediaAccess");

  if (mediaAccess?.status != "granted") {
    debugLog(
      "Permission not granted",
      mediaAccess,
      "background-backup",
      "backupSqliteFunction"
    );
    return;
  }
  const dbPath = FileSystem.documentDirectory + "SQLite/tijarah";

  try {
    const file = await StorageAccessFramework.createFileAsync(
      uri.directoryUri,
      "tijarah.db",
      "application/x-sqlite3"
    );
    const fileData = await FileSystem.readAsStringAsync(dbPath, {
      encoding: "base64",
    });

    await FileSystem.writeAsStringAsync(file, fileData, {
      encoding: "base64",
    });

    // await deleteOldFiles(uri.directoryUri);
    // if (isConnected) {
    //   await syncWithBackend(uri.directoryUri);
    // }
  } catch (err: any) {
    errorLog(err?.code, err, "background-backup", "backupSqliteFunction", err);
  }
  return true;
};
