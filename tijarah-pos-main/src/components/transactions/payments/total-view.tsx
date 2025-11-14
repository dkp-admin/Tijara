import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import Spacer from "../../spacer";
import Label from "../../text/label";
import ToolTip from "../../tool-tip";
import CommonRow from "../common-row";
import { checkDirection } from "../../../hooks/check-direction";

export default function TotalView({ payment, data }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  const freeItemsDiscount: any = data?.items?.reduce((prev: any, cur: any) => {
    if (cur?.isFree) return prev + Number(cur?.total);
    else return prev;
  }, 0);

  const freeQtyItemsDiscount: any = data?.items?.reduce(
    (prev: any, cur: any) => {
      if (cur?.isQtyFree) return prev + Number(cur?.discount);
      else return prev;
    },
    0
  );

  const itemsTotal = () => {
    const data = [
      {
        title: t("Items Total"),
        info: "",
        value: `${t("SAR")} ${Number(
          payment?.subTotalWithoutDiscount || 0
        )?.toFixed(2)}`,
      },
    ];

    data.push({
      title: t("Discount"),
      info: t("info_msg_discount_order_details_payment"),
      value: `${t("SAR")} ${Number(
        payment?.discount + freeItemsDiscount + freeQtyItemsDiscount || 0
      )?.toFixed(2)}`,
    });

    return data;
  };

  const totalData = () => {
    let vatCharges = 0;

    const data = [
      {
        title: t("Subtotal"),
        info: "",
        value: `${t("SAR")} ${Number(payment?.subTotal || 0)?.toFixed(2)}`,
      },
    ];

    payment?.charges?.forEach((charge: any) => {
      vatCharges += Number(charge.vat || 0);

      data.push({
        title: isRTL ? charge.name?.ar : charge.name?.en,
        info: "",
        value: `${t("SAR")} ${(
          Number(charge.total || 0) - Number(charge.vat || 0)
        )?.toFixed(2)}`,
      });
    });

    data.push({
      title: t("VAT"),
      info: `${t("Items VAT")}: ${t("SAR")} ${(
        Number(payment?.vat || 0) - vatCharges
      )?.toFixed(2)}\n${t("Charges VAT")}: ${t("SAR")} ${vatCharges?.toFixed(
        2
      )}`,
      value: `${t("SAR")} ${Number(payment?.vat || 0)?.toFixed(2)}`,
    });

    data.push({
      title: t("Total"),
      info: "",
      value: `${t("SAR")} ${Number(payment?.total || 0)?.toFixed(2)}`,
    });

    return data;
  };

  return (
    <View style={{ marginTop: hp("5%") }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Label marginLeft={hp("2%")}>{t("DETAILS")}</Label>

        <View style={{ marginLeft: 8, marginBottom: 5 }}>
          <ToolTip infoMsg={t("info_msg_payment_details")} />
        </View>
      </View>

      {itemsTotal().map((data: any, index: number) => {
        return (
          <CommonRow
            key={data.title}
            data={data}
            isLast={index == itemsTotal().length - 1}
          />
        );
      })}

      <Spacer space={hp("3.5%")} />

      {totalData().map((data: any, index: number) => {
        return (
          <CommonRow
            key={data.title}
            data={data}
            valueFontWeight={
              index == totalData().length - 1 ? "medium" : "normal"
            }
            styleTitle={
              index === totalData().length - 1 && {
                fontWeight: "700",
                fontFamily: theme.fonts.circulatStd,
              }
            }
            styleValue={
              index === totalData().length - 1 && {
                fontWeight: "700",
                fontFamily: theme.fonts.circulatStd,
              }
            }
            isLast={index == totalData().length - 1}
          />
        );
      })}
    </View>
  );
}
