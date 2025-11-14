import { reloadAsync } from "expo-updates";
import * as Updates from "expo-updates";
import i18n from "i18n-js";
import { I18nManager } from "react-native";
import * as ar from "./assets/translations/ar.json";
import * as en from "./assets/translations/en.json";
import * as ur from "./assets/translations/ur.json";

export const DEFAULT_LANGUAGE = "en";

export const translationGetters: { [key: string]: any } = {
  en: () => en,
  ar: () => ar,
  ur: () => ur,
};

// export const translate = memoize(
//   (key: any, opts = {}) => {
//     return i18n.t(key, {
//       ...opts,
//       defaultValue: `${key}.missing`,
//     })
//   },
//   (key: any) => key
// )

export const t = i18n.t.bind(i18n);

export const langConfig = {
  en: {
    languageTag: "en",
    isRTL: false,
  },
  ar: {
    languageTag: "ar",
    isRTL: true,
  },
  ur: {
    languageTag: "ur",
    isRTL: true,
  },
};

export const setI18nConfig = async (
  codeLang: "en" | "ar" | "ur",
  reloadApp?: boolean
) => {
  const { languageTag, isRTL } = langConfig[codeLang || "en"];

  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);

  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;

  if (reloadApp) {
    // await reloadAsync();
    Updates.reloadAsync();
  }

  return languageTag;
};

export default i18n;
