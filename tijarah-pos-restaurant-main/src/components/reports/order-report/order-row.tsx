import { format } from "date-fns";
import React from "react";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";
import { View } from "react-native";
import { currencyValue } from "../../../utils/get-value-currency";

export default function OrderRow({ data }: any) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const getItemName = () => {
    const itemName = data?.items?.map((item: any) => `${item?.name?.en}`);

    if (itemName?.length > 4) {
      return itemName.slice(0, 4).join(", ") + ` +${itemName?.length - 4}`;
    } else {
      return itemName.join(", ");
    }
  };

  const getRefundAmount = () => {
    return data.refunds[0].refundedTo.reduce(
      (prev: any, cur: any) => prev + cur.amount,
      0
    );
  };

  return (
    <>
      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: hp("2%"),
          paddingRight: hp("3%"),
          paddingVertical: hp("2.5%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        {twoPaneView ? (
          <>
            <DefaultText
              style={{ width: "15%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {`#${data?.orderNum || ""}`}
            </DefaultText>

            <DefaultText
              style={{ width: "12%" }}
              fontSize="lg"
              color="otherGrey.100"
            >
              {format(new Date(data?.createdAt), "h:mma")}
            </DefaultText>
          </>
        ) : (
          <View style={{ width: "22%", marginRight: "3%" }}>
            <DefaultText fontSize="lg" fontWeight="medium">
              {`#${data?.orderNum || ""}`}
            </DefaultText>

            <DefaultText fontSize="lg" color="otherGrey.100">
              {format(new Date(data?.createdAt), "h:mma")}
            </DefaultText>
          </View>
        )}

        <DefaultText
          style={{ width: twoPaneView ? "30%" : "45%", marginRight: "8%" }}
          fontSize="lg"
        >
          {getItemName()}
        </DefaultText>

        {twoPaneView && (
          <View style={{ width: "13%", alignItems: "flex-end" }}>
            {data.refunds?.length > 0 ? (
              <CurrencyView amount={getRefundAmount()?.toFixed(2)} />
            ) : (
              <DefaultText fontSize="lg">{"-"}</DefaultText>
            )}
          </View>
        )}

        <View style={{ width: "22%", alignItems: "flex-end" }}>
          <CurrencyView
            amount={`${currencyValue(data?.payment?.total || 0)}`}
          />
        </View>
      </View>
    </>
  );
}
