import React, { createContext, useContext, useEffect, useState } from "react";
import DB from "../utils/DB";
import { DBKeys } from "../utils/DBKeys";

export const themeConfig = {
  dark: {
    fontConfig: {
      Manrope: {
        100: {
          normal: "Manrope-ExtraLight",
        },
        200: {
          normal: "Manrope-Light",
        },
        300: {
          normal: "Manrope-Regular",
        },
        400: {
          normal: "Manrope-Medium",
        },
        500: {
          normal: "Manrope-SemiBold",
        },
        600: {
          normal: "Manrope-Bold",
        },
        700: {
          normal: "Manrope-ExtraBold",
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
      thin: "100",
      light: "200",
      normal: "300",
      medium: "400",
      semibold: "500",
      bold: "600",
      extrabold: "700",
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
      manrope: "Tijarah-Regular",
    },
    colors: {
      // Add new color
      primary: {
        100: "#006C350D",
        200: "#0C93561A",
        300: "#0C935633",
        400: "#0C935680",
        1000: "#0E7440",
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
        secondary: "#A2A0A8",
      },
      error: {
        light: "#FF6262",
        dark: "#E93C3C",
        default: "#FB4E4E",
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
      Manrope: {
        100: {
          normal: "Manrope-ExtraLight",
        },
        200: {
          normal: "Manrope-Light",
        },
        300: {
          normal: "Manrope-Regular",
        },
        400: {
          normal: "Manrope-Medium",
        },
        500: {
          normal: "Manrope-SemiBold",
        },
        600: {
          normal: "Manrope-Bold",
        },
        700: {
          normal: "Manrope-ExtraBold",
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
      thin: "100",
      light: "200",
      normal: "300",
      medium: "400",
      semibold: "500",
      bold: "600",
      extrabold: "700",
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
      manrope: "Tijarah-Regular",
    },
    colors: {
      // Add new color
      primary: {
        100: "#006C350D",
        200: "#006C351A",
        300: "#006C3533",
        400: "#006C3580",
        1000: "#0E7440",
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
        primary: "#15141F",
        secondary: "#A2A0A8",
      },
      error: {
        light: "#FF6262",
        dark: "#E93C3C",
        default: "#FB4E4E",
      },
      red: {
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
  const theme = useContext(ThemeContext);

  // const [themeMode, setThemeMode] = useState("light");

  // useEffect(() => {
  //   (async () => {
  //     DB.retrieveData(DBKeys.THEME_MODE).then((theme: any) => {
  //       setThemeMode(theme || "light");
  //     });
  //   })();
  // }, []);

  // return themeMode === "light" ? theme.light : theme.dark;
  return theme.light;
}

export default ThemeContext;
