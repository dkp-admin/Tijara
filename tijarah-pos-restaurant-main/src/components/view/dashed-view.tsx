import React from "react";
import { SafeAreaView, View } from "react-native";
import { useTheme } from "../../context/theme-context";

export const DashedView = ({
  marginTop = 25,
  marginBottom = 25,
  marginHorizontal = -20,
}: any) => {
  const theme = useTheme();

  return (
    <SafeAreaView>
      <View style={{ overflow: "hidden" }}>
        <View
          style={{
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: theme.colors.otherGrey[100],
            margin: -1,
            marginTop: marginTop,
            marginBottom: marginBottom == 0 ? -1 : marginBottom,
            marginHorizontal: marginHorizontal,
          }}
        />
      </View>
    </SafeAreaView>
  );
};
