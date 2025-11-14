import React from "react";
import { TouchableOpacity } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";

export default function RadioRow({ options, selected, setSelected }: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <>
      {options.map((option: any, i: number) => {
        return (
          <TouchableOpacity
            key={i}
            style={{
              marginBottom: hp("3%"),
              marginHorizontal: wp("3%"),
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              setSelected(option);
            }}
          >
            <Checkbox
              isChecked={selected?.value == option.value}
              fillColor={theme.colors.bgColor}
              unfillColor={theme.colors.bgColor}
              iconComponent={
                selected?.value == option.value ? (
                  <ICONS.RadioFilledIcon />
                ) : (
                  <ICONS.RadioEmptyIcon />
                )
              }
              disabled
              disableBuiltInState
            />

            <DefaultText
              style={{ marginLeft: 1 }}
              fontWeight={selected?.value == option.value ? "medium" : "normal"}
            >
              {option.title}
            </DefaultText>
          </TouchableOpacity>
        );
      })}
    </>
  );
}
