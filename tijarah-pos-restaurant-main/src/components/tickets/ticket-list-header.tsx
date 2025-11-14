import React from "react";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";
import { View } from "react-native";

export default function TicketListHeader() {
  const { wp, hp } = useResponsive();

  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: hp("2%"),
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
      }}
    >
      <DefaultText style={{ width: "30%" }} fontSize="sm" fontWeight="medium">
        {`${t("TICKET NAME/NO")}.`}
      </DefaultText>

      <DefaultText style={{ width: "20%" }} fontSize="sm" fontWeight="medium">
        {t("ORDER TYPE")}
      </DefaultText>

      <DefaultText style={{ width: "20%" }} fontSize="sm" fontWeight="medium">
        {t("AMOUNT")}
      </DefaultText>

      <DefaultText
        style={{ width: "25%", paddingRight: wp("1%"), textAlign: "right" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("STATUS")}
      </DefaultText>

      <DefaultText style={{ width: "5%" }} />
    </View>
  );
}
