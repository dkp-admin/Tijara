import React from "react";
import { View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";

export default function ItemHeader({ selected, handleSelection }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("2.25%"),
          paddingHorizontal: hp("2%"),
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.primary[100],
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Checkbox
            isChecked={selected}
            fillColor={theme.colors.primary[100]}
            unfillColor={theme.colors.primary[100]}
            iconComponent={
              selected ? (
                <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
              ) : (
                <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
              )
            }
            onPress={() => handleSelection(!selected)}
          />

          <DefaultText fontSize="sm" fontWeight="medium">
            {t("ITEMS")}
          </DefaultText>
        </View>

        <DefaultText
          style={{ alignSelf: "flex-end" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("PRICE")}
        </DefaultText>
      </View>
    </>
  );
}
