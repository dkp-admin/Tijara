import React from "react";
import { View } from "react-native";
import { useResponsive } from "../../hooks/use-responsiveness";
import { PrimaryButton } from "../buttons/primary-button";
import DefaultText from "../text/Text";

export default function NoDataPlaceholder({
  marginTop,
  title,
  showBtn = false,
  btnTitle = "",
  handleOnPress,
}: any) {
  const { wp, hp } = useResponsive();

  return (
    <View
      style={{
        marginTop: marginTop || hp("50%"),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DefaultText
        style={{ textAlign: "center" }}
        fontSize="2xl"
        fontWeight="medium"
      >
        {title}
      </DefaultText>

      {showBtn ? (
        <PrimaryButton
          reverse
          style={{
            minWidth: wp("20%"),
            paddingVertical: hp("2%"),
            backgroundColor: "transparent",
          }}
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
