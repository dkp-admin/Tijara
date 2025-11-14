import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import { useCurrency } from "../../../../store/get-currency";

const getDiscountValue = (discount: string, type: string, currency: string) => {
  if (type === "percent") {
    return `${discount}%`;
  } else {
    return `${currency}` + Number(discount)?.toFixed(2);
  }
};

export default function AppliedDiscountRow({ data, handleOnRemove }: any) {
  const { hp, wp } = useResponsive();
  const { currency } = useCurrency();

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
            {getDiscountValue(data.discount, data.discountType, currency)}
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
