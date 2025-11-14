import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

const EventTypeName: any = {
  "set-fixed-price": "Set Fixed Price",
  "reduce-price-by-fixed-amount": "Reduce Price by Fixed Amount",
  "reduce-price-by-percentage-amount": "Reduce Price by Percentage Amount",
  "increase-price-by-fixed-amount": "Increase Price by Fixed Amount",
  "increase-price-by-percentage-amount": "Increase Price by Percentage Amount",
  "activate-products": "Activate Products",
  "deactivate-products": "Deactivate Products",
};

export default function TimeEventRow({ data }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  return (
    <View
      style={{
        paddingVertical: hp("2.5%"),
        paddingHorizontal: hp("1.75%"),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      {twoPaneView ? (
        <>
          <DefaultText
            style={{ width: "20%", marginRight: "3%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {isRTL ? data.name.ar : data.name.en}
          </DefaultText>

          <DefaultText
            style={{ width: "24%", marginRight: "3%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {EventTypeName[data.eventType]}
          </DefaultText>

          <DefaultText
            style={{ width: "30%", marginRight: "3%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {`${format(new Date(data.dateRange.from), "dd/MM/yyyy")} - ${format(
              new Date(data.dateRange.to),
              "dd/MM/yyyy"
            )}`}
          </DefaultText>

          <DefaultText
            style={{ width: "17%", textAlign: "right" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data.status === "active" ? "Active" : "In-Active"}
          </DefaultText>
        </>
      ) : (
        <>
          <View style={{ width: "37%", marginRight: "3%" }}>
            <DefaultText fontSize="lg" fontWeight="medium">
              {isRTL ? data.name.ar : data.name.en}
            </DefaultText>

            <DefaultText
              style={{ marginTop: 5 }}
              fontSize="lg"
              fontWeight="medium"
            >
              {EventTypeName[data.eventType]}
            </DefaultText>
          </View>

          <View style={{ width: "60%", alignItems: "flex-end" }}>
            <DefaultText fontSize="lg" fontWeight="medium">
              {`${format(
                new Date(data.dateRange.from),
                "dd/MM/yyyy"
              )} - ${format(new Date(data.dateRange.to), "dd/MM/yyyy")}`}
            </DefaultText>

            <DefaultText
              style={{ marginTop: 5 }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.status === "active" ? "Active" : "In-Active"}
            </DefaultText>
          </View>
        </>
      )}
    </View>
  );
}
