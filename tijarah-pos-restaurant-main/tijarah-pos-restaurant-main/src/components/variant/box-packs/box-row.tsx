import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";

export default function BoxPackRow({ data, handleOnPress }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: hp("2.5%"),
          paddingHorizontal: hp("1.75%"),
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.white[1000],
        }}
        // onPress={() => handleOnPress(data)}
      >
        {twoPaneView ? (
          <>
            <DefaultText
              style={{ width: "19%", marginRight: "3%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.sku}
            </DefaultText>

            <DefaultText
              style={{ width: "15%", marginRight: "3%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.noOfUnits}
            </DefaultText>

            <View
              style={{
                width: "27%",
                marginRight: "3%",
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <CurrencyView
                amount={Number(
                  data?.prices?.[0]?.costPrice || data?.costPrice || 0
                )?.toFixed(2)}
                amountFontsize={18}
                decimalFontsize={18}
              />
            </View>

            <View
              style={{
                width: "22%",
                marginRight: "3%",
                flexDirection: isRTL ? "row" : "row-reverse",
                alignSelf: "flex-end",
              }}
            >
              <CurrencyView
                amount={Number(
                  data?.prices?.[0]?.price || data?.price || 0
                )?.toFixed(2)}
                amountFontsize={18}
                decimalFontsize={18}
              />
            </View>
          </>
        ) : (
          <>
            <DefaultText
              style={{
                width: "32%",
                marginRight: "3%",
              }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.sku}
            </DefaultText>

            <DefaultText
              style={{ width: "7%", marginRight: "3%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.noOfUnits}
            </DefaultText>

            <View
              style={{
                width: "47%",
                marginRight: "3%",
                alignItems: "flex-end",
              }}
            >
              <View
                style={{
                  flexDirection: isRTL ? "row" : "row-reverse",
                  alignSelf: "flex-end",
                }}
              >
                <CurrencyView
                  amount={Number(
                    data?.prices?.[0]?.costPrice || data?.costPrice || 0
                  )?.toFixed(2)}
                  amountFontsize={18}
                  decimalFontsize={18}
                />
              </View>

              <View
                style={{
                  flexDirection: isRTL ? "row" : "row-reverse",
                  alignSelf: "flex-end",
                }}
              >
                <CurrencyView
                  amount={Number(
                    data?.prices?.[0]?.price || data?.price || 0
                  )?.toFixed(2)}
                  amountFontsize={18}
                  decimalFontsize={18}
                />
              </View>
            </View>
          </>
        )}

        {/* <View
          style={{
            width: "5%",
            marginLeft: wp("1.75%"),
            marginRight: wp("2%"),
            transform: [
              {
                rotate: isRTL ? "180deg" : "0deg",
              },
            ],
          }}
        >
          <ICONS.RightContentIcon />
        </View> */}
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
