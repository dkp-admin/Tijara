//@ts-nocheck
import * as React from "react";
import { StyleProp, Text as CustomText, TextStyle } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";

const getColor = (color, theme) => {
  const colorArr = color.split(".");
  return theme.colors[colorArr[0]][colorArr[1]];
};

const fontFamilies = {
  hairline: "Tijarah-Light",
  thin: "Tijarah-Light",
  light: "Tijarah-Light",
  normal: "Tijarah-Regular",
  italicNormal: "Tijarah-Italic-Regular",
  medium: "Tijarah-Medium",
  semibold: "Tijarah-Medium",
  bold: "Tijarah-Bold",
  extrabold: "Tijarah-Black",
  black: "Tijarah-Black",
};

const lineHeight = {
  sm: 17,
  md: 22,
  xl: 27,
  "2xl": 30,
  "3xl": 35,
};

export default function DefaultText({
  fontFamily,
  fontSize,
  fontWeight,
  color,
  noOfLines,
  style,
  children,
  ...props
}: {
  fontFamily?: string;
  fontSize?: any;
  fontWeight?: any;
  color?: string;
  noOfLines?: number;
  style?: StyleProp<TextStyle>;
  children?: string | string[];
}) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const getLineHeight = () => {
    if (fontSize) {
      return lineHeight[fontSize];
    } else {
      return null;
    }
  };

  return (
    <CustomText
      style={{
        textAlign: "left",
        fontWeight: theme.fontWeights[fontWeight] || theme.fontWeights.medium,
        color: color?.includes(".")
          ? getColor(color, theme)
          : color || theme.colors.text.primary,
        fontFamily: fontFamilies[fontWeight] || theme.fonts.circulatStd,
        fontSize:
          theme.fontSizes[fontSize] ||
          (!twoPaneView ? theme.fontSizes.lg : theme.fontSizes.xl),
        lineHeight: getLineHeight(),
        ...(style as any),
      }}
      numberOfLines={noOfLines}
      {...props}
    >
      {children}
    </CustomText>
  );
}
