import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import DefaultText from "../../../text/Text";
import { checkDirection } from "../../../../hooks/check-direction";

interface TabButtonProps {
  currentTab: string;
  sectionOptions: any[];
  handleCurrentTab: (tab: string) => void;
  data: any;
}

const SectionTabButton: React.FC<TabButtonProps> = ({
  currentTab,
  sectionOptions,
  handleCurrentTab,
  data,
}) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        ...styles.tabContainer,
        height: hp("4.75%"),
        marginVertical: hp("1.5%"),
        paddingHorizontal: hp("1.75%"),
      }}
      alwaysBounceHorizontal={false}
      showsHorizontalScrollIndicator={false}
    >
      {sectionOptions.map((tab) => (
        <TouchableOpacity
          key={tab._id}
          style={{
            borderRadius: 5,
            marginRight: hp("1.75%"),
            paddingVertical: hp("0.4%"),
            paddingHorizontal: hp("2%"),
            backgroundColor:
              currentTab === tab._id
                ? theme.colors.primary[1000]
                : theme.colors.dark[100],
          }}
          onPress={() => {
            handleCurrentTab(tab._id);
          }}
        >
          <DefaultText
            fontSize="md"
            fontWeight="medium"
            color={
              currentTab === tab._id
                ? theme.colors.white[1000]
                : theme.colors.placeholder
            }
          >
            {isRTL ? tab.name.ar : tab.name.en}
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

export default SectionTabButton;
