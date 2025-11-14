import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";

export default function TabButton({
  isDashboard,
  isBilling,
  activeTab,
  onChange,
  tabs,
  tabStyle,
  containerStyle,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <View
      style={{
        height: isDashboard ? "100%" : hp("5.75%"),
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        backgroundColor: isDashboard ? "transparent" : theme.colors.bgColor,
        borderWidth: isBilling ? 0 : 1,
        borderColor: theme.colors.dividerColor.secondary,
        width: "100%",
        ...containerStyle,
      }}
    >
      {tabs?.map((tab: string, idx: number) => {
        return (
          <TouchableOpacity
            key={idx}
            style={{
              flex: isBilling ? 0 : 1,
              justifyContent: "flex-end",
              alignItems: "center",
              overflow: "hidden",
              paddingVertical: hp("1.25%"),
              marginHorizontal: isBilling ? hp("2%") : 0,
              ...tabStyle,
            }}
            onPress={() => {
              onChange(idx);
            }}
          >
            <DefaultText
              fontSize="md"
              fontWeight={activeTab == idx ? "medium" : "normal"}
              color={
                activeTab == idx
                  ? theme.colors.primary[1000]
                  : theme.colors.otherGrey[200]
              }
            >
              {tab}
            </DefaultText>

            {activeTab == idx && (
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  borderWidth: isDashboard ? 1 : 1,
                  borderColor: theme.colors.primary[1000],
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
