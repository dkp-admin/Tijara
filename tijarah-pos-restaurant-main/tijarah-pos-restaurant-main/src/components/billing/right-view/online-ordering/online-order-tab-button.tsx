import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import DefaultText from "../../../text/Text";

interface TabButtonProps {
  currentTab: string;
  handleCurrentTab: (tab: string) => void;
}

const OnlineTabButton: React.FC<TabButtonProps> = ({
  currentTab,
  handleCurrentTab,
}) => {
  const theme = useTheme();
  const { hp } = useResponsive();

  const tabDataOptions = [
    {
      label: t("All"),
      value: "all",
    },
    {
      label: t("Open"),
      value: "open",
    },
    {
      label: t("Inprocess"),
      value: "inprocess",
    },
    {
      label: t("Ready/OTW"),
      value: "ready",
    },
    // {
    //   label: t("Completed/Cancelled"),
    //   value: "completed",
    // },
  ];

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        ...styles.tabContainer,
        height: hp("5.75%"),
        marginVertical: hp("1.5%"),
        paddingHorizontal: hp("1.75%"),
      }}
      alwaysBounceHorizontal={false}
      showsHorizontalScrollIndicator={false}
    >
      {tabDataOptions.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          style={{
            borderRadius: 50,
            borderWidth: 1.25,
            borderColor:
              currentTab === tab.value
                ? theme.colors.primary[1000]
                : theme.colors.otherGrey[200],
            marginRight: hp("1.75%"),
            paddingVertical: hp("1%"),
            paddingHorizontal: hp("2%"),
            backgroundColor:
              currentTab === tab.value
                ? theme.colors.primary[100]
                : theme.colors.bgColor,
          }}
          onPress={() => {
            handleCurrentTab(tab.value);
          }}
        >
          <DefaultText
            fontSize="md"
            fontWeight="medium"
            color={
              currentTab === tab.value
                ? theme.colors.primary[1000]
                : theme.colors.otherGrey[200]
            }
          >
            {tab.label}
          </DefaultText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    display: "flex",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default OnlineTabButton;
