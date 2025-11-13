import React from "react";
import { Pressable, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";

export default function BillingSearchAdd({
  handlePress,
}: {
  handlePress: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <Pressable
      style={{
        height: hp("9%"),
        flexDirection: "row",
        alignItems: "center",
        marginVertical: hp("0.5%"),
        justifyContent: "space-between",
        paddingLeft: hp("1.5%"),
        paddingRight: hp("0.75%"),
      }}
      onPress={handlePress}
    >
      <View
        style={{
          width: "98%",
          borderRadius: 16,
          paddingVertical: 8,
          paddingLeft: hp("1"),
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.primary[100],
        }}
      >
        <ICONS.ProfilePlaceholderIcon height={hp("5.5%")} width={hp("5.5%")} />

        <DefaultText
          style={{ marginLeft: 10 }}
          color={theme.colors.placeholder}
        >
          {t("Search or add a customer with name or phone")}
        </DefaultText>
      </View>
    </Pressable>
  );
}
