import * as Updates from "expo-updates";
import { Alert } from "react-native";
import i18n from "../../i18n";

export const checkExpoUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        i18n.t("An update available"),
        i18n.t("A new version of app is available, update now?"),
        [
          {
            text: i18n.t("Update"),
            onPress: () => {
              try {
                Updates.reloadAsync();
              } catch (e: any) {}
            },
          },
          {
            text: i18n.t("Cancel"),
            onPress: () => {},
          },
        ]
      );
    }
  } catch (e: any) {}
};
