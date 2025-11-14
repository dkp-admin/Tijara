import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { getCartItemUnit } from "../../../utils/constants";
import ImageView from "../../billing/left-view/catalogue/image-view";
import DefaultText from "../../text/Text";
import { useCurrency } from "../../../store/get-currency";

const getQty = (data: any) => {
  console.log(JSON.stringify(data, null, 2));
  if (
    data?.variant?.unit === "perItem" ||
    data?.variant?.type === "box" ||
    data.variant?.type === "crate"
  ) {
    return `x ${data.quantity}`;
  } else {
    return `(${data.quantity} ${getCartItemUnit?.[data?.variant?.unit]})`;
  }
};

const getModifierName = (data: any) => {
  let name = "";

  data?.modifiers?.map((mod: any) => {
    name += `${name === "" ? "" : ", "}${mod.optionName}`;
  });

  return name;
};

const getPrice = (data: any, currency: string) => {
  return `${currency} ${Number(data.billing?.total)?.toFixed(2)}`;
};

export default function ItemRowOrders({ data, isLast }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { currency } = useCurrency();
  const { wp, hp, twoPaneView } = useResponsive();

  const getItemVariantName = () => {
    const box =
      data?.variant?.type === "box"
        ? `(${t("Box")} - ${data?.variant.unitCount} ${t("Units")})`
        : data?.variant?.type === "crate"
        ? `(${t("Crate")} - ${data?.variant.unitCount} ${t("Units")})`
        : "";

    if (isRTL) {
      return (
        (data?.hasMultipleVariants ? data?.variant.name?.ar : "") +
        `${data?.hasMultipleVariants && box ? ", " : ""}` +
        box
      );
    } else {
      return (
        (data?.hasMultipleVariants ? data?.variant.name?.en : "") +
        `${data?.hasMultipleVariants && box ? ", " : ""}` +
        box
      );
    }
  };

  return (
    <>
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ImageView data={data} />

          <View
            style={{
              width: twoPaneView ? "60%" : "50%",
              marginHorizontal: 10,
            }}
          >
            <DefaultText>
              {`${isRTL ? data.name.ar : data.name.en} ${getQty(data)}`}
            </DefaultText>

            {getItemVariantName() && (
              <DefaultText fontSize="lg" color={theme.colors.otherGrey[200]}>
                {getItemVariantName()}
              </DefaultText>
            )}

            {data?.modifiers?.length > 0 && (
              <DefaultText fontSize="lg" color={theme.colors.otherGrey[200]}>
                {getModifierName(data)}
              </DefaultText>
            )}

            {data?.note && (
              <DefaultText fontSize="lg" color={theme.colors.otherGrey[200]}>
                {data?.note}
              </DefaultText>
            )}

            {data?.void && (
              <DefaultText fontSize="lg" color={theme.colors.otherGrey[200]}>
                {`${t("Void")}: ${
                  isRTL ? data.voidReason.ar : data.voidReason.en
                }`}
              </DefaultText>
            )}

            {data?.comp && (
              <DefaultText fontSize="lg" color={theme.colors.otherGrey[200]}>
                {`${t("Comp")}  ${
                  isRTL ? data.compReason.ar : data.compReason.en
                }`}
              </DefaultText>
            )}
          </View>
        </View>

        <View
          style={{
            width: twoPaneView ? "30%" : "25%",
          }}
        >
          {data?.isFree ? (
            <>
              <DefaultText
                style={{ textAlign: "right" }}
                color={theme.colors.otherGrey[200]}
              >{`FREE`}</DefaultText>
              <DefaultText
                style={{
                  textDecorationLine: "line-through" as any,
                  textAlign: "right",
                }}
                color={theme.colors.otherGrey[200]}
              >
                {`${currency} ${Number(data?.total)?.toFixed(2)}`}
              </DefaultText>
            </>
          ) : data?.isQtyFree ? (
            <>
              <DefaultText
                style={{ textAlign: "right" }}
                color={theme.colors.otherGrey[200]}
              >
                {`${currency} ${Number(
                  data?.discountedTotal || data?.total
                )?.toFixed(2)}`}
              </DefaultText>
              <DefaultText
                style={{
                  textDecorationLine: "line-through" as any,
                  textAlign: "right",
                }}
                color={theme.colors.otherGrey[200]}
              >
                {`${currency} ${Number(data?.total + data?.discount)?.toFixed(
                  2
                )}`}
              </DefaultText>
            </>
          ) : data?.void || data?.comp ? (
            <>
              <DefaultText
                style={{ textAlign: "right" }}
                color={theme.colors.otherGrey[200]}
              >
                {`${currency} ${Number(0)?.toFixed(2)}`}
              </DefaultText>
              <DefaultText
                style={{
                  textDecorationLine: "line-through" as any,
                  textAlign: "right",
                }}
                color={theme.colors.otherGrey[200]}
              >
                {`${currency} ${Number(data?.amountBeforeVoidComp)?.toFixed(
                  2
                )}`}
              </DefaultText>
            </>
          ) : (
            <>
              {data?.discountedTotal > 0 ? (
                <>
                  <DefaultText
                    style={{
                      textAlign: "right",
                    }}
                    color={theme.colors.otherGrey[200]}
                  >
                    {getPrice(data, currency)}
                  </DefaultText>
                  <DefaultText
                    style={{
                      textDecorationLine: "line-through" as any,
                      textAlign: "right",
                    }}
                    color={theme.colors.otherGrey[200]}
                  >
                    {`${currency} ${Number(
                      data?.total + data?.discount
                    )?.toFixed(2)}`}
                  </DefaultText>
                </>
              ) : (
                <DefaultText
                  style={{ textAlign: "right" }}
                  color={theme.colors.otherGrey[200]}
                >
                  {getPrice(data, currency)}
                </DefaultText>
              )}
            </>
          )}
        </View>
      </View>

      {!isLast && (
        <View
          style={{
            borderWidth: 0.5,
            marginLeft: wp("2%"),
            borderColor: theme.colors.dividerColor.secondary,
          }}
        />
      )}
    </>
  );
}
