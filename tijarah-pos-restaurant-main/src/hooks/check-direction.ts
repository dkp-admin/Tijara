import i18n from "../../i18n";

export const checkDirection = () => {
  return i18n.currentLocale() == "ar" || i18n.currentLocale() == "ur";
};
