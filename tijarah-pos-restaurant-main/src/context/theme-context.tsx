import React, { createContext, useContext, useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";

export const themeConfig = {
  dark: {
    fontConfig: {
      circulatStd: {
        100: {
          normal: "CircularStd-Light",
        },
        200: {
          normal: "CircularStd-Book",
        },
        300: {
          normal: "CircularStd-Medium",
        },
        400: {
          normal: "CircularStd-Bold",
        },
        500: {
          normal: "CircularStd-Black",
        },
        600: {
          normal: "CircularStd-BookItalic",
        },
      },
    },
    letterSpacings: {
      xs: "-0.05em",
      sm: "-0.025em",
      md: 0,
      lg: "0.025em",
      xl: "0.05em",
      "2xl": "0.1em",
    },
    lineHeights: {
      "2xs": "1em",
      xs: "1.125em",
      sm: "1.25em",
      md: "1.375em",
      lg: "1.5em",
      xl: "1.75em",
      "2xl": "2em",
      "3xl": "2.5em",
      "4xl": "3em",
      "5xl": "4em",
    },
    fontWeights: {
      hairline: "100",
      thin: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
      extrablack: "950",
    },
    fontSizes: {
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      "2xl": 20,
      "3xl": 24,
      "4xl": 32,
      "5xl": 40,
      "6xl": 48,
    },
    fonts: {
      circulatStd: "Tijarah-Regular",
    },
    colors: {
      // Add new color
      primary: {
        100: "#0C93561A",
        200: "#0C935633",
        300: "#0C935680",
        1000: "#0C9356",
      },
      dark: {
        50: "#F9F9FA",
        100: "#E8E8E8",
        200: "#DCDBE0",
        400: "#CCCACF",
        600: "#A2A0A8",
        800: "#52525C",
        900: "#211F32",
        1000: "#15141F",
      },
      white: {
        1000: "#FFFFFF",
      },
      black: {
        1000: "#000000",
      },
      otherGrey: {
        100: "#6C737F",
        200: "#FFFFFF7A",
      },
      placeholder: "#A2A0A8",
      text: {
        primary: "#EDF2F7",
      },
      red: {
        default: "#F44837",
      },
      dividerColor: {
        main: "#C6C6C8",
        secondary: "#29303D",
      },
      bgColor: "#121212",
      bgColor2: "#282828",
      transparentBg: "#00000099",
      tabBottomColor: "#1C2536",
    },
  },

  light: {
    fontConfig: {
      CirculatStd: {
        100: {
          normal: "CircularStd-Light",
        },
        200: {
          normal: "CircularStd-Book",
        },
        300: {
          normal: "CircularStd-Medium",
        },
        400: {
          normal: "CircularStd-Bold",
        },
        500: {
          normal: "CircularStd-Black",
        },
        600: {
          normal: "CircularStd-BookItalic",
        },
      },
    },
    letterSpacings: {
      xs: "-0.05em",
      sm: "-0.025em",
      md: 0,
      lg: "0.025em",
      xl: "0.05em",
      "2xl": "0.1em",
    },
    lineHeights: {
      "2xs": "1em",
      xs: "1.125em",
      sm: "1.25em",
      md: "1.375em",
      lg: "1.5em",
      xl: "1.75em",
      "2xl": "2em",
      "3xl": "2.5em",
      "4xl": "3em",
      "5xl": "4em",
    },
    fontWeights: {
      hairline: "100",
      thin: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
      extrablack: "950",
    },
    fontSizes: {
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      "2xl": 20,
      "3xl": 24,
      "4xl": 32,
      "5xl": 40,
      "6xl": 48,
    },
    fonts: {
      circulatStd: "Tijarah-Regular",
    },
    colors: {
      // Add new color
      primary: {
        100: "#006C351A",
        200: "#006C3533",
        300: "#006C3580",
        1000: "#006C35",
      },
      dark: {
        50: "#F9F9FA",
        100: "#E8E8E8",
        200: "#DCDBE0",
        400: "#CCCACF",
        600: "#A2A0A8",
        800: "#52525C",
        900: "#211F32",
        1000: "#15141F",
      },
      white: {
        1000: "#FFFFFF",
      },
      black: {
        1000: "#000000",
      },
      otherGrey: {
        100: "#555555",
        200: "#6B7280",
      },
      placeholder: "#A2A0A8",
      text: {
        primary: "#272727",
      },
      yellow: { 100: "#F586341A", default: "#F58634" },
      red: {
        100: "#F448371A",
        default: "#F44837",
      },
      dividerColor: {
        main: "#C6C6C8",
        secondary: "#D8D8D8",
      },
      bgColor: "#F2F2F7",
      bgColor2: "#FFFFFF",
      transparentBg: "#00000099",
      tabBottomColor: "#FFFFFF",
    },
  },
};

const ThemeContext = createContext(themeConfig);

export function ThemeContextProvider({ children }: { children: any }) {
  return (
    <ThemeContext.Provider value={themeConfig}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  // const mode = useColorScheme();
  const theme = useContext(ThemeContext);

  // const [darkMode, setDarkMode] = useState<any>();

  // useEffect(() => {
  //   const listener = EventRegister.addEventListener("changeTheme", (data) => {
  //     setDarkMode(data);
  //   });
  //   return () => {
  //     EventRegister.removeEventListener(listener as string);
  //   };
  // }, [darkMode]);

  // useEffect(() => {
  //   const theme = MMKVDB.get(DBKeys.THEME_MODE) || mode;

  //   setDarkMode(theme);
  // }, []);

  return theme.light;
}

export default ThemeContext;
