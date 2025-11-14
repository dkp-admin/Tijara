import * as FileSystem from "expo-file-system";
import endpoint from "../api/endpoints";
import MMKVDB from "./DB-MMKV";
import { DBKeys } from "./DBKeys";

export const BACKGROUND_FETCH_TASK = "background-fetch-task";

// Send Log In Form Data
export const syncLogWithBackend = async () => {
  try {
    const token = MMKVDB.get(DBKeys.TOKEN);
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.cacheDirectory as any
    );

    for (const file of files) {
      const filePath = file;
      const fileInfo: any = await FileSystem.readAsStringAsync(filePath, {
        encoding: "base64",
      });

      const formData = new FormData();
      formData.append("data", JSON.stringify(fileInfo));

      const requestOptions = {
        method: endpoint.log.method,
        body: formData,
        Authorization: `Bearer ${token || ""}`,
      };

      // Replace serviceCaller with fetch
      const response = await fetch(endpoint.log.path, requestOptions);

      if (response.ok) {
        // Log successful response or handle accordingly
      } else {
        // Handle error response
        console.log("Log sync failed:", response);
      }
    }
  } catch (error) {
    console.log("Error sync log with server:", error);
  }
};
