import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText, { getOriginalSize } from "../../text/Text";

export default function ScrollTabButton({
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
        flex: tabs?.length === 1 ? 0 : tabs?.length > 3 ? 0 : 1,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: getOriginalSize(5),
        marginHorizontal: wp("-1.5%"),
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
              marginHorizontal: wp("1.75%"),
              paddingVertical: hp("0.75%"),
              paddingHorizontal: wp("5%"),
              borderColor:
                activeTab === idx ? theme.colors.primary[1000] : "#F2F2F2",
              backgroundColor:
                activeTab === idx ? theme.colors.primary[200] : "transparent",
            }}
            onPress={() => {
              onChange(idx);
            }}
          >
            <DefaultText
              fontSize="md"
              fontWeight="semibold"
              color={activeTab === idx ? "primary.1000" : "text.primary"}
            >
              {tab}
            </DefaultText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
