import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ArabicLanguage from "assets/translations/ar.json";
import EnglishLanguage from "assets/translations/en.json";
import UrduLanguage from "assets/translations/ur.json";

const resources = {
  en: {
    translation: EnglishLanguage,
  },
  ar: {
    translation: ArabicLanguage,
  },
  ur: {
    translation: UrduLanguage,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng:
    typeof window !== "undefined"
      ? localStorage.getItem("currentLanguage")
      : "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// export default i18n;
