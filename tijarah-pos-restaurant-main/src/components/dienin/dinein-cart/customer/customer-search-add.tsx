import React from "react";
import { Pressable, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import DefaultText from "../../../text/Text";

export default function CustomerSearchAdd({
  handlePress,
}: {
  handlePress: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <Pressable
      style={{
        // marginTop: 15,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onPress={handlePress}
    >
      <View
        style={{
          width: "100%",
          borderRadius: 8,
          paddingVertical: 6,
          paddingLeft: hp("1"),
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.primary[100],
        }}
      >
        <ICONS.ProfilePlaceholderIcon height={40} width={40} />

        <DefaultText
          style={{ marginLeft: 10, marginRight: 10 }}
          color={theme.colors.placeholder}
        >
          {t("Add a customer")}
        </DefaultText>
      </View>
    </Pressable>
  );
}
