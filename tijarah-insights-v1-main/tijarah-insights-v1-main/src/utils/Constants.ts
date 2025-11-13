import { StatusBar } from "react-native";
import { LanguageCodes } from "../types/language-types";

export const DEFAULT_PADDING = 16;
export const STATUSBAR_HEIGHT = StatusBar.currentHeight || 20;
export const ROW_SPACING = 5;
export const ROW_RADIUS = 8;

export const APPLICATION_ID = "application_id";
export const APP_STORE_LINK = `https://play.google.com/store/apps/details?id=<${APPLICATION_ID}>`;
export const LANG_FLAGS_EN = require("../components/assets/flag-en.png");
export const LANG_FLAGS_AR = require("../components/assets/flag-ar.png");
export const LANG_FLAGS_UR = require("../components/assets/flag-ur.png");
export const PROFILE_PLACEHOLDER = require("../components/assets/Profile.png");

export const langs = [
  {
    code: "en" as LanguageCodes,
    name: "English",
    flag: "ABC",
  },
  {
    code: "ar" as LanguageCodes,
    name: "عربي",
    flag: "ABC",
  },
  {
    code: "ur" as LanguageCodes,
    name: "اردو",
    flag: "ABC",
  },
];
