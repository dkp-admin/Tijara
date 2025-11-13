//@ts-nocheck
import * as React from "react";
import {
  Text as CustomText,
  PixelRatio,
  StyleProp,
  TextStyle,
} from "react-native";
import { useTheme } from "../../context/theme-context";

export const getOriginalSize = (originalSize) => {
  if (PixelRatio.get() < 1.5) {
    return Number((originalSize * 0.5) / PixelRatio.get()) || 0;
  } else if (PixelRatio.get() >= 1.5 && PixelRatio.get() < 2.5) {
    return Number((originalSize * 1.5) / PixelRatio.get()) || 0;
  } else if (PixelRatio.get() >= 2.5) {
    return Number((originalSize * 2.5) / PixelRatio.get()) || 0;
  } else {
    return Number(originalSize) || 0;
  }
};

const getColor = (color, theme) => {
  const colorArr = color.split(".");
  return theme.colors[colorArr[0]][colorArr[1]];
};

const fontFamilies = {
  thin: "Tijarah-ExtraLight",
  light: "Tijarah-Light",
  normal: "Tijarah-Regular",
  medium: "Tijarah-Medium",
  semibold: "Tijarah-SemiBold",
  bold: "Tijarah-Bold",
  extrabold: "Tijarah-ExtraBold",
};

const lineHeight = {
  sm: getOriginalSize(17),
  md: getOriginalSize(22),
  xl: getOriginalSize(27),
  "2xl": getOriginalSize(30),
  "3xl": getOriginalSize(35),
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
  fontWeight?: string;
  color?: string;
  noOfLines?: number;
  style?: StyleProp<TextStyle>;
  children?: string | string[];
}) {
  const theme = useTheme();

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
        fontWeight: theme.fontWeights[fontWeight] || theme.fontWeights.normal,
        color: color?.includes(".")
          ? getColor(color, theme)
          : color || theme.colors.text.primary,
        fontFamily: fontFamilies[fontWeight] || theme.fonts.manrope,
        fontSize: fontSize
          ? getOriginalSize(theme.fontSizes[fontSize])
          : getOriginalSize(theme.fontSizes.xl),
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
