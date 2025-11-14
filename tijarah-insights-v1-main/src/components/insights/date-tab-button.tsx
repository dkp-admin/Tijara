import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText, { getOriginalSize } from "../text/Text";

export default function DateTabButton({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: number;
  onChange: any;
  tabs: string[];
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: getOriginalSize(5),
        marginHorizontal: getOriginalSize(10),
      }}
      alwaysBounceHorizontal={false}
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map((tab: string, idx: number) => {
        return (
          <TouchableOpacity
            key={idx}
            style={{
              flex: 1,
              borderRadius: getOriginalSize(8),
              borderWidth: getOriginalSize(1.25),
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: wp("2%"),
              paddingVertical: hp("1.15%"),
              paddingHorizontal: wp("5%"),
              borderColor:
                activeTab === idx ? theme.colors.primary[1000] : "#F2F2F2",
              backgroundColor:
                activeTab === idx ? theme.colors.primary[1000] : "transparent",
            }}
            onPress={() => {
              onChange(idx);
            }}
          >
            <DefaultText
              fontWeight="semibold"
              color={activeTab === idx ? "white.1000" : "text.primary"}
            >
              {tab}
            </DefaultText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
