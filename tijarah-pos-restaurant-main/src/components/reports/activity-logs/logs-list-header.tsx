import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import DefaultText from "../../text/Text";

export default function ActivityLogsListHeader({ data }: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <>
      <SeparatorHorizontalView />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: wp("1.7%"),
          paddingRight: wp("2.8%"),
          paddingVertical: hp("2%"),
          backgroundColor: "#E6E8F0",
        }}
      >
        <DefaultText
          style={{ fontFamily: theme.fonts.circulatStd }}
          fontSize="lg"
          fontWeight="medium"
        >
          {format(new Date(data), "EEEE, do MMMM yyyy")}
        </DefaultText>
      </View>
    </>
  );
}
