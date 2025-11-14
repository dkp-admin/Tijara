import * as MediaLibrary from "expo-media-library";
import { Linking, Platform } from "react-native";
import MMKVDB from "./DB-MMKV";

export const openAppSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
};

export const checkMediaPermission = async () => {
  let mediaAccess = MMKVDB.get("mediaAccess");

  if (!mediaAccess) {
    mediaAccess = await MediaLibrary.requestPermissionsAsync();
    MMKVDB.set("mediaAccess", mediaAccess);
  } else {
    // Request media access permission if not granted
    const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();

    if (existingStatus !== "granted") {
      openAppSettings();
    }
  }
};
