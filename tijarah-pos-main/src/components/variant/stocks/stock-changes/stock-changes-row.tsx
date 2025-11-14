import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ItemDivider from "../../../action-sheet/row-divider";
import CurrencyView from "../../../modal/currency-view-modal";
import DefaultText from "../../../text/Text";
import { STOCK_ACTION } from "../stock-action/types";
import { t } from "../../../../../i18n";

const STOCK_ACTION_NAME: any = {
  received: "Stock Received",
  "inventory-re-count": "Inventory Re-Count",
  damaged: "Damaged",
  theft: "Theft",
  loss: "Loss",
  transfer: "Batch Shift",
  "restock-return": "Restock Return",
  "transfer-internal": "Transfer Internal",
  "received-internal": "Received Internal",
  billing: "Billing",
};

const STOCK_ACTION_COLOR: any = {
  received: "primary.1000",
  "inventory-re-count": "text.primary",
  damaged: "red.default",
  theft: "red.default",
  loss: "red.default",
  transfer: "text.primary",
  "restock-return": "primary.1000",
  "transfer-internal": "text.primary",
  "received-internal": "text.primary",
  billing: "red.default",
};

const getStockCount = (stockCount: number, action: string) => {
  if (
    action === STOCK_ACTION.STOCK_RECEIVED ||
    action === STOCK_ACTION.RESTOCK_RETURN
  ) {
    return `+${stockCount}`;
  } else if (
    action === STOCK_ACTION.BATCH_SHIFT ||
    action === STOCK_ACTION.INVENTORY_RECOUNT ||
    action === STOCK_ACTION.TRANSFER_INTERNAL ||
    action === STOCK_ACTION.RECEIVED_INTERNAL
  ) {
    return `${stockCount}`;
  } else {
    return `${stockCount > 0 ? "-" : ""}${stockCount}`;
  }
};

export default function StockChangesRow({ data }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
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
            <DefaultText
              style={{ width: "14%", marginRight: "2%" }}
              fontSize="md"
            >
              {format(new Date(data.createdAt), "dd/MM/yyyy, h:mm a")}
            </DefaultText>

            <View style={{ width: "18%", marginRight: "2%" }}>
              <DefaultText fontSize="lg">
                {data.variant.type === "box" || data.variant.type === "crate"
                  ? isRTL
                    ? data.variant.name.ar
                    : data.variant.name.en
                  : "-"}
              </DefaultText>

              <DefaultText fontSize="md">
                {data.variant.type === "box" || data.variant.type === "crate"
                  ? data.sku
                  : ""}
              </DefaultText>
            </View>

            <DefaultText
              style={{ width: "12%", marginRight: "2%" }}
              fontSize="lg"
            >
              {data.variant.type === "box"
                ? t("Box")
                : data.variant.type === "crate"
                ? t("Crate")
                : t("Item")}
            </DefaultText>

            <DefaultText
              style={{ width: "16%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.vendor?.name || "-"}
            </DefaultText>

            <View
              style={{
                width: "13%",
                marginRight: "2%",
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              {data?.price &&
              Number(data?.price) > 0 &&
              Number(data?.variant?.costPrice) > 0 ? (
                <View>
                  <DefaultText fontSize="md">{t("SAR")}</DefaultText>

                  <DefaultText fontSize="lg" fontWeight="medium">
                    {Number(
                      (data.price || Number(data.variant.costPrice || 0)) *
                        data.variant.qty
                    )?.toFixed(2)}
                  </DefaultText>
                </View>
              ) : (
                <DefaultText fontSize="xl" fontWeight="medium">
                  {"-"}
                </DefaultText>
              )}
            </View>

            <View style={{ width: "16%", marginRight: "1%" }}>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                fontWeight="medium"
                color={STOCK_ACTION_COLOR[data.stockAction]}
              >
                {getStockCount(data.stockCount, data.stockAction)}
              </DefaultText>

              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                color={STOCK_ACTION_COLOR[data.stockAction]}
              >
                {STOCK_ACTION_NAME[data.stockAction]}
              </DefaultText>

              {data?.auto && (
                <View
                  style={{
                    marginTop: 5,
                    borderRadius: 50,
                    paddingVertical: 2,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    alignSelf: "flex-end",
                    backgroundColor: "#0E70901A",
                  }}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color="#0E7090"
                  >
                    {t("Auto")}
                  </DefaultText>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "17%", marginRight: "3%" }}
              fontSize="md"
            >
              {format(new Date(data.createdAt), "dd/MM/yyyy, h:mm a")}
            </DefaultText>

            <View style={{ width: "32%", marginRight: "3%" }}>
              <DefaultText fontSize="lg">
                {data.variant.type === "box" || data.variant.type === "crate"
                  ? isRTL
                    ? data.variant.name.ar
                    : data.variant.name.en
                  : "-"}
              </DefaultText>

              <DefaultText fontSize="md">
                {data.variant.type === "box" || data.variant.type === "crate"
                  ? data.sku
                  : ""}
              </DefaultText>
            </View>

            <View style={{ width: "44%", marginRight: "1%" }}>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                fontWeight="medium"
                color={STOCK_ACTION_COLOR[data.stockAction]}
              >
                {getStockCount(data.stockCount, data.stockAction)}
              </DefaultText>

              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                color={STOCK_ACTION_COLOR[data.stockAction]}
              >
                {STOCK_ACTION_NAME[data.stockAction]}
              </DefaultText>
            </View>
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
