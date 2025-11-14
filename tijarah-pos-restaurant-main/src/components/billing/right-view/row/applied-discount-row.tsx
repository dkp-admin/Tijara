import React from "react";
import { TouchableOpacity } from "react-native";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { useCurrency } from "../../../../store/get-currency";
import cart from "../../../../utils/cart";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";

const getDiscountValue = (discount: string, type: string, currency: string) => {
  if (type === "percent") {
    return `${discount}%`;
  } else {
    return `${currency}` + Number(discount)?.toFixed(2);
  }
};

export default function AppliedDiscountRow({ data, handleOnRemove }: any) {
  const { hp } = useResponsive();
  const { currency } = useCurrency();

  const freeItemsDiscount: any = cart?.cartItems?.reduce(
    (prev: any, cur: any) => {
      if (cur?.isFree && cur?.promotionsData[0].id === data._id)
        return (
          prev +
          Number(
            cur?.discountedTotal > 0
              ? cur?.total - cur?.discountedTotal
              : cur?.total
          )
        );
      else return prev;
    },
    0
  );
  return (
    <>
      <TouchableOpacity
        style={{
          padding: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText style={{ width: "30%" }} fontSize="lg" fontWeight="normal">
          {data.name || "-"}
        </DefaultText>
        <DefaultText style={{ width: "30%" }} fontSize="lg" fontWeight="normal">
          {data.code}
        </DefaultText>

        <DefaultText
          style={{ width: "25%", marginRight: "5%", textAlign: "right" }}
          fontSize="xl"
          fontWeight="normal"
        >
          {data?.advancedPromotion &&
          data?.reward?.rewardType === "get_the_following_items" &&
          data?.reward?.discountType === "free"
            ? `${currency} ${Number(freeItemsDiscount).toFixed(2)}`
            : getDiscountValue(data.discount, data.discountType, currency)}
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
    </>
  );
}
