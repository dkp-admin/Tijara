import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";
import useItemsDineIn from "../../../../hooks/use-items-dinein";
import dineinCart from "../../../../utils/dinein-cart";
import showToast from "../../../toast";
import { getItemVAT } from "../../../../utils/get-price";
import { useCurrency } from "../../../../store/get-currency";

const getChargeValue = (data: any, currency: string) => {
  const maxText = data.chargeType === "custom" ? `${t("Max")}. ` : "";

  if (data.type === "percentage") {
    return maxText + `${data.value}%`;
  } else {
    return maxText + `${currency} ${Number(data.value)?.toFixed(2)}`;
  }
};

export default function CustomChargeRowDinein({
  data,
  handleOnPress,
}: {
  data: any;
  handleOnPress: any;
}) {
  const theme = useTheme();
  const { businessData } = useCommonApis();
  const { hp, twoPaneView } = useResponsive();
  const { chargesApplied, subTotalWithoutDiscount } = useItemsDineIn();
  const { currency } = useCurrency();
  if (!data) {
    return;
  }

  const handleAddButtonPress = () => {
    if (dineinCart.getCartItems()?.length === 0) {
      showToast("info", t("Please add item in the cart for custom charge"));
      return;
    }

    const idx = chargesApplied.findIndex(
      (charge: any) => charge.chargeId === data._id
    );

    if (idx === -1) {
      const vat = businessData.company.vat.percentage;

      const price =
        data.type === "percentage"
          ? (subTotalWithoutDiscount * data.value) / 100
          : data.value;

      const chargeData = {
        name: { en: data.name.en, ar: data.name.ar },
        total: Number(price?.toFixed(2)),
        vat: getItemVAT(price, data?.taxRef ? data.tax?.percentage || 0 : vat),
        type: data.type,
        chargeType: data.chargeType,
        value: data.value,
        chargeId: data._id,
      };

      handleOnPress(chargeData);
    } else {
      showToast("info", t("Charge already applied"));
    }
  };

  return (
    <View>
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
          {data.name.en}
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
          {getChargeValue(data, currency)}
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
          {data.type}
        </DefaultText>

        <TouchableOpacity
          onPress={() => {
            handleAddButtonPress();
          }}
          style={{
            width: "10%",
            marginLeft: twoPaneView ? "0%" : "1.5%",
            alignItems: "flex-end",
          }}
        >
          <ICONS.AddCircleIcon
            color={
              chargesApplied.findIndex(
                (charge: any) => charge.chargeId === data._id
              ) !== -1
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
    </View>
  ) as any;
}
