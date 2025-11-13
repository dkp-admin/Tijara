import { Alert, Image, StyleSheet, TouchableOpacity } from "react-native";
import i18n, { setI18nConfig, t } from "../../../i18n";
import { useAuth } from "../../hooks/use-auth";
import { usePreferredLanguage } from "../../hooks/use-preferred-language";
import { LanguageRowProps } from "../../types/language-types";
import {
  LANG_FLAGS_AR,
  LANG_FLAGS_EN,
  LANG_FLAGS_UR,
} from "../../utils/Constants";
import DB from "../../utils/DB";
import { DBKeys } from "../../utils/DBKeys";
import { ERRORS } from "../../utils/errors";
import DefaultText, { getOriginalSize } from "../text/Text";
import showToast from "../toast";

export const langFlags = {
  ar: LANG_FLAGS_AR,
  ur: LANG_FLAGS_UR,
  en: LANG_FLAGS_EN,
};

export default function LanguageRow({
  language,
  selected,
  setSelected,
}: LanguageRowProps) {
  const { user } = useAuth();
  const { updateLanguage } = usePreferredLanguage();

  const langName: any = {
    ar: t("Arabic"),
    en: t("English"),
    ur: t("Urdu"),
  };

  const isSelected = () => {
    return selected?.code === language?.code;
  };

  const changeLanguageAlert = () => {
    Alert.alert(
      t("Confirmation"),
      t("Do you want to reload the app for language change?"),
      [
        {
          text: t("No"),
          onPress: () => {},
        },
        {
          text: t("Yes"),
          style: "destructive",
          onPress: async () => {
            await DB.storeData(DBKeys.LANG, language.code);
            setI18nConfig(language.code, true);
            setSelected(language);
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={{
        ...styles.row_container,
        backgroundColor: isSelected() ? "#006C350D" : "transparent",
      }}
      onPress={async () => {
        changeLanguageAlert();
      }}
      disabled={language.code === i18n.currentLocale()}
    >
      <Image
        key={language.code}
        style={styles.imageStyle}
        source={langFlags[language.code]}
      />

      <DefaultText
        style={styles.languageCode}
        fontWeight="semibold"
        color="text.secondary"
      >
        {language.code}
      </DefaultText>

      <DefaultText fontWeight="semibold">{langName[language.code]}</DefaultText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row_container: {
    borderRadius: getOriginalSize(12),
    marginBottom: getOriginalSize(20),
    marginHorizontal: getOriginalSize(8),
    paddingVertical: getOriginalSize(10),
    paddingHorizontal: getOriginalSize(12),
    alignItems: "center",
    flexDirection: "row",
  },
  imageStyle: { width: getOriginalSize(45), height: getOriginalSize(45) },
  languageCode: {
    marginLeft: getOriginalSize(20),
    marginRight: getOriginalSize(12),
    textTransform: "uppercase",
  },
});
