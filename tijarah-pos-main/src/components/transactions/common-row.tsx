import React from "react";
import { View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";
import ToolTip from "../tool-tip";

export default function CommonRow({
  data,
  styleTitle,
  styleValue,
  titleFontWeight,
  valueFontWeight,
  valueColor,
  isLast,
}: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("2%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.white[1000],
          borderWidth: 0.5,
          borderColor: theme.colors.dividerColor.secondary,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultText
            fontWeight={titleFontWeight || "normal"}
            style={{ ...styleTitle }}
          >
            {data.title}
          </DefaultText>

          {data?.info && (
            <View style={{ marginTop: 3, marginLeft: 8 }}>
              <ToolTip infoMsg={data.info} />
            </View>
          )}
        </View>

        <DefaultText
          style={{ ...styleValue }}
          fontWeight={valueFontWeight || "normal"}
          color={valueColor || theme.colors.otherGrey[200]}
        >
          {data.value}
        </DefaultText>
      </View>
    </>
  );
}
