import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function RefundHeader({ data }: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <View
      style={{
        marginBottom: 6,
        marginTop: hp("5%"),
        paddingHorizontal: wp("1.5%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <DefaultText
        style={{ width: "30%" }}
        fontSize="md"
        fontWeight="medium"
        color={theme.colors.text.primary}
      >
        {t("REFUND ITEMS")}
      </DefaultText>

      <DefaultText
        style={{ width: "70%", textAlign: "right" }}
        fontSize="md"
        color={theme.colors.otherGrey[200]}
      >
        {`${data.cashier}, ${format(
          new Date(data.date),
          "dd/MM/yyyy, hh:mma"
        )}`}
      </DefaultText>
    </View>
  );
}
