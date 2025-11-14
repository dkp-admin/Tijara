import { format } from "date-fns";
import React from "react";
import { TouchableOpacity } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import ItemDivider from "../action-sheet/row-divider";
import DefaultText from "../text/Text";

export default function DiscountRow({
  data,
  handleOnPress,
}: {
  data: any;
  handleOnPress: any;
}) {
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: hp("1.75%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => {
          handleOnPress(data);
        }}
      >
        <DefaultText
          style={{
            width: twoPaneView ? "33%" : "38%",
            marginRight: "2%",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {data.code}
        </DefaultText>

        {twoPaneView && (
          <DefaultText
            style={{ width: "25%" }}
            fontSize={"lg"}
            fontWeight="normal"
          >
            {data.discountType === "percent"
              ? t("Fixed Percentage")
              : t("Fixed Amount")}
          </DefaultText>
        )}

        <DefaultText
          style={{
            width: twoPaneView ? "18%" : "28%",
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
            width: twoPaneView ? "18%" : "28%",
            marginRight: "2%",
            textAlign: "right",
          }}
          fontSize={"lg"}
          fontWeight="normal"
        >
          {format(new Date(data.expiry), "dd/MM/yyyy")}
        </DefaultText>
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
  ) as any;
}
