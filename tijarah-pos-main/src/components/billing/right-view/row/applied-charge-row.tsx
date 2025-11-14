import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";

const getChargeValue = (data: any) => {
  const maxText = data.chargeType === "custom" ? `${t("Max")}. ` : "";

  if (data.type === "percentage") {
    return maxText + `${data.value}%`;
  } else {
    return maxText + `${t("SAR")} ${Number(data.value)?.toFixed(2)}`;
  }
};

export default function AppliedChargeRow({ data, handleOnRemove }: any) {
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  return (
    <View>
      <TouchableOpacity
        style={{
          padding: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText style={{ width: "60%" }} fontSize="lg" fontWeight="normal">
          {isRTL ? data.name.ar : data.name.en}
        </DefaultText>

        <DefaultText
          style={{ width: "25%", marginRight: "5%", textAlign: "right" }}
          fontSize="xl"
          fontWeight="normal"
        >
          {getChargeValue(data)}
        </DefaultText>

        <TouchableOpacity
          style={{
            width: "10%",
            alignItems: "flex-end",
          }}
          onPress={() => handleOnRemove(data)}
        >
          <ICONS.RemoveIcon />
        </TouchableOpacity>
      </TouchableOpacity>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
    </View>
  );
}
