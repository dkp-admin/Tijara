import React from "react";
import { Dimensions, View } from "react-native";
import { PrimaryButton } from "../buttons/primary-button";
import DefaultText from "../text/Text";

export default function NoDataPlaceholder({
  title,
  showBtn = false,
  btnTitle = "",
  handleOnPress,
}: any) {
  return (
    <View
      style={{
        marginTop: Dimensions.get("window").height * 0.06,
        alignItems: "center",
      }}
    >
      <DefaultText
        style={{ textAlign: "center" }}
        fontSize="2xl"
        fontWeight="extrabold"
      >
        {title}
      </DefaultText>

      {showBtn ? (
        <PrimaryButton
          style={{ marginTop: 40 }}
          title={btnTitle}
          onPress={() => {
            handleOnPress();
          }}
        />
      ) : (
        <></>
      )}
    </View>
  );
}
