import React from "react";
import { View } from "react-native";
import DefaultText from "../../text/Text";

export default function FavouritesTab() {
  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DefaultText>{"Favourites"}</DefaultText>
    </View>
  );
}
