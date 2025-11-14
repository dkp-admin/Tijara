import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import cart from "../../../../utils/cart";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import dineinCart from "../../../../utils/dinein-cart";
import useItems from "../../../../hooks/use-items";
import useItemsDineIn from "../../../../hooks/use-items-dinein";

export default function DiscountRowDinein({
  data,
  handleOnPress,
  dinein = false,
}: {
  data: any;
  handleOnPress: any;
  dinein?: boolean;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const { discountsApplied } = useItemsDineIn();

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
            if (dinein && dineinCart.getCartItems()?.length === 0) {
              debugLog(
                "Please add item in the cart for discount",
                dineinCart.getCartItems(),
                "billing-screen",
                "handleAddDiscountButton"
              );
              showToast("info", t("Please add item in the cart for discount"));
              return;
            }

            handleOnPress(data);
          }}
          style={{
            width: "10%",
            marginLeft: twoPaneView ? "0%" : "1.5%",
            alignItems: "flex-end",
          }}
        >
          <ICONS.AddCircleIcon
            color={
              discountsApplied?.findIndex((dis: any) => dis._id == data._id) !==
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
