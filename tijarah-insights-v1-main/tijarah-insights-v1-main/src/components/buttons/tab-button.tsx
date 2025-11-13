import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/theme-context";
import DefaultText, { getOriginalSize } from "../text/Text";
import { useResponsive } from "../../hooks/use-responsiveness";

export default function TabButton({ activeTab, onChange, tabs }: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={{
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
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
              borderWidth: 1,
              borderRadius: 30,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: wp("1.5%"),
              paddingVertical: hp("1.15%"),
              paddingHorizontal: wp("5.5%"),
              borderColor:
                activeTab === idx
                  ? theme.colors.primary[1000]
                  : theme.colors.dark[200],
              backgroundColor:
                activeTab === idx
                  ? theme.colors.primary[1000]
                  : theme.colors.bgColor,
            }}
            onPress={() => {
              onChange(idx);
            }}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color={activeTab === idx ? "white.1000" : "text.secondary"}
            >
              {tab}
            </DefaultText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
