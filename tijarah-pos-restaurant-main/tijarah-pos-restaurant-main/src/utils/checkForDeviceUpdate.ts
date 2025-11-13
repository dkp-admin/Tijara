import { Alert, Linking } from "react-native";
import i18n from "../../i18n";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import { APP_STORE_LINK, SUNMI_APP_STORE_LINK } from "./constants";

import { compareVersions } from "compare-versions";
import * as Constant from "expo-constants";

const canUpdate = (version: any) => {
  if (!Constant.default.expoConfig) return false;
  return (
    compareVersions(Constant.default.expoConfig.version as any, version) === -1
  );
};

export const checkForDeviceUpdate = async ({
  appStoreType,
}: {
  appStoreType: "sunmi" | "google";
}) => {
  const appStoreLink =
    appStoreType === "sunmi" ? SUNMI_APP_STORE_LINK : APP_STORE_LINK;
  try {
    const res = await serviceCaller(endpoint.appData.path, {
      method: endpoint.appData.method,
    });

    if (res) {
      if (canUpdate(res?.version)) {
        if (res.type === "mandatory") {
          Alert.alert(
            "Update Tijarah?",
            "Tijarah recommends that you to use this app update to the latest version",
            [
              {
                text: i18n.t("Update"),
                onPress: async () => {
                  await Linking.openURL(appStoreLink);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Update Tijarah?",
            "Tijarah recommends that you to use this app update to the latest version",
            [
              {
                text: i18n.t("Skip"),
                onPress: () => {},
                style: "destructive",
              },
              {
                text: i18n.t("Update"),
                onPress: async () => {
                  await Linking.openURL(appStoreLink);
                },
              },
            ]
          );
        }
      }
    }
  } catch (error: any) {}
};
