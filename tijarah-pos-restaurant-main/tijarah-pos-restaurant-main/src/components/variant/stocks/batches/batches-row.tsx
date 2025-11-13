import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";

export default function BatchesRow({ data }: any) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("2.5%"),
          paddingHorizontal: hp("1.75%"),
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        {twoPaneView ? (
          <>
            <View style={{ width: "12%", marginRight: "2%" }}>
              <DefaultText fontSize="md">
                {format(new Date(data?.expiry), "dd/MM/yyyy")}
              </DefaultText>

              {data?.status === "inactive" && (
                <DefaultText fontSize="md" color="red.default">
                  {t("Deleted")}
                </DefaultText>
              )}
            </View>

            <DefaultText
              style={{ width: "34%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.vendor?.name || ""}
            </DefaultText>

            <DefaultText
              style={{ width: "15%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.received}
            </DefaultText>

            <DefaultText
              style={{ width: "15%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.transfer || 0}
            </DefaultText>

            <DefaultText
              style={{ width: "15%", marginRight: "1%", textAlign: "right" }}
              fontSize="lg"
              color={data.available > 0 ? "primary.1000" : "red.default"}
            >
              {data.available}
            </DefaultText>
          </>
        ) : (
          <>
            <View style={{ width: "17%", marginRight: "3%" }}>
              <DefaultText fontSize="md">
                {format(new Date(data?.expiry), "dd/MM/yyyy")}
              </DefaultText>

              {data?.status === "inactive" && (
                <DefaultText fontSize="md" color="red.default">
                  {t("Deleted")}
                </DefaultText>
              )}
            </View>

            <DefaultText
              style={{ width: "38%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.received}
            </DefaultText>

            <DefaultText
              style={{ width: "44%", marginRight: "1%", textAlign: "right" }}
              fontSize="lg"
              color={data.available > 0 ? "primary.1000" : "red.default"}
            >
              {data.available}
            </DefaultText>
          </>
        )}
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
  );
}
