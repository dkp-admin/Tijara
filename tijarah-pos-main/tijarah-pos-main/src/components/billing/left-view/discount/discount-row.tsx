import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import useItems from "../../../../hooks/use-items";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import cart from "../../../../utils/cart";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

export default function DiscountRowBilling({
  data,
  handleOnPress,
}: {
  data: any;
  handleOnPress: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const { totalDiscount, discountsApplied } = useItems();

  const checkDiscountApplicable = () => {
    let discount = 0;

    const totalAmount = cart.cartItems.reduce(
      (prev: any, cur: any) => Number((prev + Number(cur.total))?.toFixed(2)),
      0
    );

    const totalPercent = Number(
      ((totalDiscount * 100) / totalAmount)?.toFixed(0)
    );

    if (data.discountType === "percent") {
      const discountAmount = (totalAmount * Number(data.discount)) / 100;
      discount = Number(totalDiscount) + Number(discountAmount);
    } else if (data.discountType === "amount") {
      discount = Number(totalDiscount) + Number(data.discount);
    }

    if (totalAmount > discount) {
      if (totalPercent > 99) {
        debugLog(
          "Discount must be applied for less than 100%",
          data,
          "billing-screen",
          "handleDiscountApplicable"
        );
        showToast("info", t("Discount must be applied for less than 100%"));
      } else {
        const idx = discountsApplied.findIndex(
          (dis: any) => dis._id == data._id
        );

        if (idx === -1) {
          handleOnPress(data);
        } else {
          debugLog(
            "Discount already applied",
            data,
            "billing-screen",
            "handleDiscountApplicable"
          );
          showToast("info", t("Discount coupon already applied"));
        }
      }
    } else {
      debugLog(
        "Discount amount must be less than total amount",
        data,
        "billing-screen",
        "handleDiscountApplicable"
      );
      showToast("info", t("Discount amount must be less than total amount"));
    }
  };

  if (!data) {
    return <></>;
  }

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.75%"),
          paddingHorizontal: hp("3%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{
            width: "33%",
            marginRight: "2%",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {data.code}
        </DefaultText>

        <DefaultText
          style={{
            width: "23%",
            marginRight: "2%",
            textAlign: "right",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {data.discountType === "percent"
            ? `${data.discount}%`
            : `${t("SAR")} ${Number(data.discount)?.toFixed(2)}`}
        </DefaultText>

        <DefaultText
          style={{
            width: "28%",
            marginRight: "2%",
            textAlign: "right",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {format(new Date(data.expiry), "dd/MM/yyyy")}
        </DefaultText>

        <TouchableOpacity
          onPress={() => {
            if (cart.cartItems?.length === 0) {
              debugLog(
                "Please add item in the cart for discount",
                cart.cartItems,
                "billing-screen",
                "handleAddDiscountButton"
              );
              showToast("info", t("Please add item in the cart for discount"));
              return;
            }

            checkDiscountApplicable();
          }}
          style={{
            width: "10%",
            marginLeft: twoPaneView ? "0%" : "1.5%",
            alignItems: "flex-end",
          }}
        >
          <ICONS.AddCircleIcon
            color={
              discountsApplied.findIndex((dis: any) => dis._id == data._id) !==
              -1
                ? theme.colors.otherGrey[200]
                : theme.colors.primary[1000]
            }
          />
        </TouchableOpacity>
      </View>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
    </>
  ) as any;
}
