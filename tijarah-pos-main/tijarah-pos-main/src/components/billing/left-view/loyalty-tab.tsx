import React from "react";
import { View } from "react-native";
import DefaultText from "../../text/Text";

export default function LoyaltyTab() {
  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DefaultText>{"Loyalty"}</DefaultText>
    </View>
  );
}
