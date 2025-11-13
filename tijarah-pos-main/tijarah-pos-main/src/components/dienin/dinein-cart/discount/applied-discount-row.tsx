import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import { t } from "../../../../../i18n";
import cart from "../../../../utils/cart";

const getDiscountValue = (discount: string, type: string) => {
  if (type === "percent") {
    return `${discount}%`;
  } else {
    return `${t("SAR")}` + Number(discount)?.toFixed(2);
  }
};

export default function AppliedDiscountRow({ data, handleOnRemove }: any) {
  const { hp, wp } = useResponsive();

  return (
    <>
      <TouchableOpacity
        style={{
          padding: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{ width: "30%", marginLeft: wp("1%") }}
          fontSize="lg"
          fontWeight="normal"
        >
          {data.code}
        </DefaultText>
        <View
          style={{
            width: "40%",
            marginRight: "5%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DefaultText
            style={{ textAlign: "left" }}
            fontSize="xl"
            fontWeight="normal"
          >
            {getDiscountValue(data.discount, data.discountType)}
          </DefaultText>
        </View>

        <TouchableOpacity
          style={{
            width: "20%",
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
    </>
  );
}
