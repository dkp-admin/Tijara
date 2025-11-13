import React from "react";
import { View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";

export default function SearchWithAdd({
  placeholderText,
  btnText = "",
  queryText,
  setQueryText,
  handleBtnTap,
  readPermission,
  createPermission,
}: {
  placeholderText?: string;
  btnText?: string;
  queryText?: string;
  setQueryText?: any;
  handleBtnTap?: any;
  readPermission?: boolean;
  createPermission?: boolean;
}) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        height: hp("9.5%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: wp("1.75%"),
        paddingRight: wp("0.75%"),
        paddingVertical: hp("1.25%"),
        borderBottomWidth: 1,
        borderColor: theme.colors.dividerColor.secondary,
        backgroundColor: theme.colors.primary[100],
      }}
    >
      <View
        style={{
          flex: 0.97,
          borderRadius: 16,
          paddingLeft: wp("1.5"),
          flexDirection: "row",
          alignItems: "center",
          opacity: readPermission ? 1 : 0.25,
          backgroundColor: readPermission
            ? theme.colors.primary[100]
            : theme.colors.placeholder,
        }}
      >
        <ICONS.SearchPrimaryIcon />

        <Input
          containerStyle={{
            borderWidth: 0,
            height: hp("7.25%"),
            marginLeft: wp("0.5%"),
            backgroundColor: "transparent",
          }}
          allowClear={readPermission}
          style={{
            flex: twoPaneView ? 0.975 : 0.945,
          }}
          placeholderText={placeholderText}
          values={queryText}
          handleChange={(val: any) => setQueryText(val)}
          disabled={!readPermission}
        />
      </View>

      {btnText && (
        <PrimaryButton
          style={{
            paddingVertical: hp("1.5%"),
            backgroundColor: "transparent",
          }}
          textStyle={{
            fontSize: 20,
            fontWeight: theme.fontWeights.medium,
            color: createPermission
              ? theme.colors.primary[1000]
              : theme.colors.placeholder,
            fontFamily: theme.fonts.circulatStd,
          }}
          title={btnText}
          onPress={() => {
            handleBtnTap();
          }}
          disabled={!createPermission}
        />
      )}
    </View>
  );
}
