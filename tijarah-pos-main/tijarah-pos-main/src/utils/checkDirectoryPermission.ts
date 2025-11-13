import { StorageAccessFramework } from "expo-file-system";
import MMKVDB from "./DB-MMKV";

export const checkDirectoryPermission = async () => {
  let storageAccess = MMKVDB.get("permissionDir");

  if (!storageAccess || !storageAccess?.granted) {
    const dir = StorageAccessFramework.getUriForDirectoryInRoot("");
    storageAccess =
      await StorageAccessFramework.requestDirectoryPermissionsAsync(dir);
    MMKVDB.set("permissionDir", storageAccess);
  }
};
