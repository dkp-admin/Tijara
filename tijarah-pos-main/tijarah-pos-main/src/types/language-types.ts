export type LanguageCodes = "en" | "ar" | "ur";

export type LanguageType = {
  name: string;
  code: LanguageCodes;
  flag: string;
};

export type LanguageRowProps = {
  isLogin?: boolean;
  isFromDevice?: boolean;
  language: LanguageType;
  selected: LanguageType;
  setSelected: (langauge: LanguageType) => void;
};
