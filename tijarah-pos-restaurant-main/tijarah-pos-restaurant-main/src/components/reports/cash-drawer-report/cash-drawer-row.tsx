import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import DefaultText from "../../text/Text";
import { useCurrency } from "../../../store/get-currency";

export default function CashDrawerRow({ data, handleRowPress }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();

  if (!data) {
    return;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: hp("2%"),
          paddingRight: hp("3%"),
          paddingVertical: hp("1.75%"),
          backgroundColor: theme.colors.white[1000],
        }}
        disabled={twoPaneView}
        onPress={() => handleRowPress(data)}
      >
        <View style={{ width: twoPaneView ? "15%" : "42%", marginRight: "3%" }}>
          <DefaultText fontSize="lg">{data?.userName}</DefaultText>
        </View>

        <View style={{ width: twoPaneView ? "10%" : "25%" }}>
          <DefaultText fontSize="md" color="otherGrey.100">
            {format(new Date(data?.shiftIn), "do MMM, hh:mma")}
          </DefaultText>

          {data?.type === "day-start" && (
            <View
              style={{
                width: "80%",
                marginTop: 3,
                borderRadius: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primary[1000],
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium" color="white.1000">
                {t("Day Start")}
              </DefaultText>
            </View>
          )}
        </View>

        <View style={{ width: twoPaneView ? "10%" : "25%" }}>
          <DefaultText fontSize="md" color="otherGrey.100">
            {format(new Date(data?.shiftOut), "do MMM, hh:mma")}
          </DefaultText>

          {data?.type === "day-end" && (
            <View
              style={{
                width: "80%",
                marginTop: 3,
                borderRadius: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.red.default,
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium" color="white.1000">
                {t("Day End")}
              </DefaultText>
            </View>
          )}
        </View>

        {twoPaneView ? (
          <>
            <View style={{ width: "10%" }}>
              {data?.openExpected ? (
                <>
                  <DefaultText style={{ fontSize: 10 }}>{currency}</DefaultText>

                  <DefaultText fontSize="lg">
                    {data.openExpected?.toFixed(2)}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">{"-"}</DefaultText>
              )}
            </View>

            <View style={{ width: "10%" }}>
              {data?.openActual ? (
                <>
                  <DefaultText style={{ fontSize: 10 }}>{currency}</DefaultText>

                  <DefaultText fontSize="lg">
                    {data.openActual?.toFixed(2)}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">{"-"}</DefaultText>
              )}
            </View>

            <View style={{ width: "10%" }}>
              {data?.closeExpected ? (
                <>
                  <DefaultText style={{ fontSize: 10 }}>{currency}</DefaultText>

                  <DefaultText fontSize="lg">
                    {data.closeExpected?.toFixed(2)}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">{"-"}</DefaultText>
              )}
            </View>

            <View style={{ width: "10%" }}>
              {data?.closeActual ? (
                <>
                  <DefaultText style={{ fontSize: 10 }}>{currency}</DefaultText>

                  <DefaultText fontSize="lg">
                    {data.closeActual?.toFixed(2)}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">{"-"}</DefaultText>
              )}
            </View>

            <View style={{ width: "10%" }}>
              {data?.closeDifference ? (
                <>
                  <DefaultText
                    style={{ fontSize: 10 }}
                    fontWeight="medium"
                    color={
                      data.closeDifference < 0
                        ? theme.colors.red.default
                        : theme.colors.text.primary
                    }
                  >
                    {currency}
                  </DefaultText>

                  <DefaultText
                    fontSize="lg"
                    fontWeight="medium"
                    color={
                      data.closeDifference < 0
                        ? theme.colors.red.default
                        : theme.colors.text.primary
                    }
                  >
                    {data.closeDifference?.toFixed(2)}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">{"-"}</DefaultText>
              )}
            </View>

            <View style={{ width: "12%", alignItems: "flex-end" }}>
              {data?.totalSales ? (
                <>
                  <DefaultText style={{ fontSize: 10 }}>{currency}</DefaultText>

                  <DefaultText fontSize="lg">
                    {data.totalSales?.toFixed(2)}
                  </DefaultText>
                </>
              ) : (
                <DefaultText fontSize="lg">{"-"}</DefaultText>
              )}
            </View>
          </>
        ) : (
          <View
            style={{
              width: "5%",
              marginLeft: wp("2.5%"),
              marginRight: wp("2%"),
              alignItems: isRTL ? "flex-end" : "flex-start",
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.RightArrowBoldIcon />
          </View>
        )}
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
