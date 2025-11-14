import { Alert, Linking } from "react-native"
import i18n from "../../i18n"
import serviceCaller from "../api"
import endpoint from "../api/endpoints"
import { APP_STORE_LINK } from "./constants"
import { isUpdateAvailable } from "./isUpdateAvailable"
import { debugLog } from "./log-patch"

export const checkForDeviceUpdate = async () => {
  try {
    const res = await serviceCaller(endpoint.appData.path, {
      method: endpoint.appData.method,
    })

    if (res) {
      debugLog(
        "On device update alert tap to download and install the app",
        res,
        "checkForDeviceUpdate.ts",
        "deviceUpdateFunction"
      )
      if (isUpdateAvailable(res?.version)) {
        if (res.type === "mandatory") {
          Alert.alert(
            "Update Tijarah?",
            "Tijarah recommends that you to use this app update to the latest version",
            [
              {
                text: i18n.t("Update"),
                onPress: async () => {
                  await Linking.openURL(APP_STORE_LINK)
                },
              },
            ]
          )
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
                  await Linking.openURL(APP_STORE_LINK)
                },
              },
            ]
          )
        }
      }
    }
  } catch (error: any) {
    console.log(error)
  }
}
