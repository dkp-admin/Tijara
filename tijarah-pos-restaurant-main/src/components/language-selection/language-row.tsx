import React, { useContext } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import i18n, { setI18nConfig, t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { usePreferredLanguage } from "../../hooks/use-preferred-language";
import { useResponsive } from "../../hooks/use-responsiveness";
import { LanguageRowProps } from "../../types/language-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import {
  LANG_FLAGS_AR,
  LANG_FLAGS_EN,
  LANG_FLAGS_UR,
} from "../../utils/constants";
import { ERRORS } from "../../utils/errors";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";
import showToast from "../toast";

export const langFlags = {
  ar: LANG_FLAGS_AR,
  ur: LANG_FLAGS_UR,
  en: LANG_FLAGS_EN,
};

export default function LanguageRow({
  isLogin,
  isFromDevice,
  language,
  selected,
  setSelected,
}: LanguageRowProps) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { hp } = useResponsive();
  const { updateLanguage } = usePreferredLanguage();
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;

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
            const callAPI = isFromDevice
              ? deviceContext?.user != null
              : authContext?.user != null;

            if (isConnected && callAPI) {
              try {
                const res = await updateLanguage({
                  params: {
                    id: authContext?.user
                      ? authContext?.user?._id
                      : deviceContext?.user?._id,
                  },
                  body: { language: language.code || "en" },
                });

                if (res?.code == "success") {
                  MMKVDB.set(DBKeys.LANG, language.code);
                  setI18nConfig(language.code, true);
                  setSelected(language);
                } else {
                  showToast("error", ERRORS.SOMETHING_WENT_WRONG);
                }
              } catch (error: any) {
                if (error?._err?.code === 500) {
                  showToast("error", t("500_message"));
                } else {
                  showToast("error", ERRORS.SOMETHING_WENT_WRONG);
                }
              }
            } else {
              MMKVDB.set(DBKeys.LANG, language.code);
              setI18nConfig(language.code, true);
              setSelected(language);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={{
        ...styles.row_container,
        marginTop: hp("1.5%"),
        borderRadius: 14,
        paddingVertical: hp("2.2%"),
        paddingHorizontal: hp("2%"),
        backgroundColor: isLogin
          ? theme.colors.bgColor
          : theme.colors.white[1000],
      }}
      onPress={async () => {
        if (isLogin) {
          changeLanguageAlert();
        } else {
          MMKVDB.set(DBKeys.LANG, language.code);
          setI18nConfig(language.code, true);
          setSelected(language);
        }
      }}
      disabled={language.code === i18n.currentLocale()}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          isChecked={isSelected()}
          fillColor={isLogin ? theme.colors.bgColor : theme.colors.white[1000]}
          unfillColor={
            isLogin ? theme.colors.bgColor : theme.colors.white[1000]
          }
          iconComponent={
            isSelected() ? <ICONS.TickFilledIcon /> : <ICONS.TickEmptyIcon />
          }
          disabled
          disableBuiltInState
        />

        <DefaultText style={{ marginLeft: hp("0.2%") }} fontWeight="medium">
          {langName[language.code]}
        </DefaultText>
      </View>

      <Image key={language.code} source={langFlags[language.code]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
