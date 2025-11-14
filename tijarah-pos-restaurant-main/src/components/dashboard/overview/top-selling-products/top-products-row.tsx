import React from "react";
import { Image, View } from "react-native";
import i18n from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import CurrencyView from "../../../modal/currency-view-modal";
import DefaultText from "../../../text/Text";
import { useCurrency } from "../../../../store/get-currency";

export default function TopProductsRow({ index, data }: any) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: hp("1.25%"),
        paddingHorizontal: wp("1.7%"),
      }}
    >
      <View style={{ width: "12%" }}>
        {index == 1 || index == 2 || index == 3 ? (
          <ICONS.TopSellingIcon />
        ) : (
          <DefaultText
            style={{ fontSize: 13, color: "#06152B" }}
            fontWeight="normal"
          >
            {index}
          </DefaultText>
        )}
      </View>

      <View
        style={{
          width: twoPaneView ? "70%" : "65%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {twoPaneView && (
          <View
            style={{
              width: hp("5%"),
              height: hp("5%"),
              padding: hp("1%"),
              borderRadius: hp("6%"),
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.primary[200],
            }}
          >
            <Image
              key={"product-logo"}
              resizeMode="stretch"
              style={{
                width: hp("5%"),
                height: hp("5%"),
                borderRadius: 16,
              }}
              source={
                data?.image
                  ? {
                      uri: data.image,
                    }
                  : PRODUCT_PLACEHOLDER
              }
            />
          </View>
        )}

        <DefaultText
          style={{ marginLeft: twoPaneView ? 10 : 0, marginRight: 10 }}
          fontSize="sm"
        >
          {i18n.currentLocale() == "ar"
            ? data?.name?.ar || "NA"
            : data?.name?.en || "NA"}
        </DefaultText>
      </View>

      <View style={{ width: "25%" }}>
        {twoPaneView ? (
          <CurrencyView
            amount={Number(data?.totalSales || 0)?.toFixed(2)}
            symbolFontsize={10}
            amountFontsize={14}
            decimalFontsize={14}
            symbolColor="primary.1000"
            amountColor="primary.1000"
            decimalColor="primary.1000"
          />
        ) : (
          <View>
            <DefaultText style={{ fontSize: 10 }} color="primary.1000">
              {currency}
            </DefaultText>

            <DefaultText fontSize="md" color="primary.1000">
              {Number(data?.totalSales || 0)?.toFixed(2)}
            </DefaultText>
          </View>
        )}
      </View>
    </View>
  );
}
