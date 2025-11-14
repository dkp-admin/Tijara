import * as Updates from "expo-updates"
import { Alert } from "react-native"
import i18n from "../../i18n"
import { debugLog, errorLog } from "./log-patch"

export const checkExpoUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync()

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync()
      Alert.alert(
        i18n.t("An update available"),
        i18n.t("A new version of app is available, update now?"),
        [
          {
            text: i18n.t("Update"),
            onPress: () => {
              try {
                debugLog(
                  "Expo updates",
                  update,
                  "app.tsx",
                  "expoUpdatesFunction"
                )
                Updates.reloadAsync()
              } catch (e: any) {
                errorLog(e?.message, {}, "app.tsx", "expoUpdatesFunction", e)
              }
            },
          },
          {
            text: i18n.t("Cancel"),
            onPress: () => {},
          },
        ]
      )
    }
  } catch (e: any) {
    errorLog(e?.message, {}, "app.tsx", "expoUpdatesFunction", e)
  }
}
