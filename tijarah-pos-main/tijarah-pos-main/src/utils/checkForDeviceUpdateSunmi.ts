import { Alert, Linking } from "react-native";
import i18n from "../../i18n";
import serviceCaller from "../api";
import endpoint from "../api/endpoints";
import { SUNMI_APPLICATION_ID } from "./constants";
import { isUpdateAvailable } from "./isUpdateAvailable";
import { debugLog } from "./log-patch";

export const checkForDeviceUpdateSunmi = async () => {
  try {
    const res = await serviceCaller(endpoint.appData.path, {
      method: endpoint.appData.method,
    });

    if (res) {
      debugLog(
        "On device sunmi update alert tap to download and install the app",
        res,
        "checkForDeviceUpdateSunmi.ts",
        "deviceUpdateFunction"
      );
      if (isUpdateAvailable(res?.version)) {
        if (res.type === "mandatory") {
          Alert.alert(
            "Update Tijarah?",
            "Tijarah recommends that you to use this app update to the latest version",
            [
              {
                text: i18n.t("Update"),
                onPress: async () => {
                  const url = `market://woyou.market/appDetail?packageName=${SUNMI_APPLICATION_ID}&isUpdate=${true}`;

                  Linking.openURL(url)
                    .then((res) => console.log(res))
                    .catch((err) => console.log(err));
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
                  const url = `market://woyou.market/appDetail?packageName=${SUNMI_APPLICATION_ID}&isUpdate=${true}`;

                  Linking.openURL(url)
                    .then((res) => console.log(res))
                    .catch((err) => console.log(err));
                },
              },
            ]
          );
        }
      }
    }
  } catch (error: any) {
    console.log(error);
  }
};
