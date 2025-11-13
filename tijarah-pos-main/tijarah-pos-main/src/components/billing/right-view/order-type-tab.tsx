import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function OrderTypeTabButton({
  activeTab,
  onChange,
  tabs,
  tabStyle,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={{
        height: hp("5.75%"),
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        backgroundColor: theme.colors.bgColor,
      }}
      alwaysBounceHorizontal={false}
      showsHorizontalScrollIndicator={false}
    >
      {tabs?.map((tab: string, idx: number) => {
        return (
          <TouchableOpacity
            key={idx}
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              overflow: "hidden",
              paddingVertical: hp("1.25%"),
              marginHorizontal: hp("2%"),
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
              {t(tab)}
            </DefaultText>

            {activeTab == idx && (
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  borderWidth: 1,
                  borderColor: theme.colors.primary[1000],
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
