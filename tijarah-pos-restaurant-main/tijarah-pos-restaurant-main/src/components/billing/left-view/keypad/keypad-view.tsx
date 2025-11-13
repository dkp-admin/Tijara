import React from "react";
import { TouchableOpacity } from "react-native";
import ICONS from "../../../../utils/icons";
import DefaultText from "../../../text/Text";

export function KeypadView({ onPress, data, disabled }: any) {
  return (
    <TouchableOpacity
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={() => onPress(data)}
      disabled={disabled}
    >
      {data == "del" ? (
        <ICONS.DelIcon />
      ) : (
        <DefaultText
          style={{ fontSize: 50 }}
          color={data == "add" ? "primary.1000" : "text.primary"}
        >
          {data == "add" ? "+" : data}
        </DefaultText>
      )}
    </TouchableOpacity>
  );
}
