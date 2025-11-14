import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useTheme } from "../../context/theme-context";

const ItemDivider = ({ style = {} }) => {
  const theme = useTheme();

  return (
    <SafeAreaView>
      <View style={{ overflow: "hidden" }}>
        <View
          style={{
            borderColor: theme.colors.dividerColor.main,
            borderStyle: "dashed",
            borderWidth: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            margin: StyleSheet.hairlineWidth,
            ...style,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ItemDivider;
