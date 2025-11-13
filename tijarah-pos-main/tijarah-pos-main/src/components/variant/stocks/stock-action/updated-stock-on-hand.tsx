import React from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import { STOCK_ACTION } from "./types";

export default function UpdatedStockOnHand({
  data,
  enabledBatching,
}: {
  data: any;
  enabledBatching: boolean;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const receivedStock =
    data.stockAction.key === STOCK_ACTION.STOCK_RECEIVED &&
    data.receivingItem?._id &&
    data.quantity &&
    data.totalCost;

  const batchShiftStock =
    data.stockAction.key === STOCK_ACTION.BATCH_SHIFT &&
    data.fromBatch?._id &&
    data.toBatch?._id &&
    data.stockCount;

  const inventoryReduceStock =
    (data.stockAction.key === STOCK_ACTION.DAMAGED ||
      data.stockAction.key === STOCK_ACTION.THEFT ||
      data.stockAction.key === STOCK_ACTION.LOSS ||
      data.stockAction.key === STOCK_ACTION.INVENTORY_RECOUNT) &&
    data.stockCount;

  const getPerUnitCost = () => {
    const { receivedStock, totalCost } = data;

    if (Number(totalCost) > 0 && receivedStock > 0) {
      const unitCost = Number(totalCost) / receivedStock;
      return `${t("SAR")} ${(unitCost || 0).toFixed(2)}`;
    } else {
      return "NA";
    }
  };

  return (
    <View>
      {receivedStock && (
        <View>
          <Spacer space={hp("4%")} />

          <Label>{t("UPDATED STOCK")}</Label>

          <View
            style={{
              ...styles.stockView,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">{t("Stock on hand")}</DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText color={theme.colors.otherGrey[200]}>
                {`${data.previousStock} + ${data.receivedStock} = `}
              </DefaultText>

              <DefaultText
                fontSize="3xl"
                fontWeight="medium"
                color={theme.colors.otherGrey[200]}
              >
                {`${data.previousStock + data.receivedStock}`}
              </DefaultText>
            </View>
          </View>

          <View
            style={{
              ...styles.dividerView,
              borderColor: theme.colors.dividerColor.main,
            }}
          />

          <View
            style={{
              ...styles.unitCostView,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">{t("Per unit cost")}</DefaultText>

            <DefaultText color={theme.colors.otherGrey[200]}>
              {getPerUnitCost()}
            </DefaultText>
          </View>
        </View>
      )}

      {batchShiftStock && (
        <View>
          <Spacer space={hp("4%")} />

          <Label>{t("UPDATED STOCK")}</Label>

          <View
            style={{
              ...styles.stockView,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">
              {t("Stock on hand (From Batch)")}
            </DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText color={theme.colors.otherGrey[200]}>
                {`${data.fromBatch?.available} - ${data.stockCount} = `}
              </DefaultText>

              <DefaultText
                fontSize="3xl"
                fontWeight="medium"
                color={theme.colors.otherGrey[200]}
              >
                {`${
                  Number(data?.fromBatch?.available || 0) -
                  Number(data.stockCount || 0)
                }`}
              </DefaultText>
            </View>
          </View>

          <View
            style={{
              ...styles.dividerView,
              borderColor: theme.colors.dividerColor.main,
            }}
          />

          <View
            style={{
              ...styles.unitCostView,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">
              {t("Stock on hand (To Batch)")}
            </DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText color={theme.colors.otherGrey[200]}>
                {`${data.toBatch?.available} + ${data.stockCount} = `}
              </DefaultText>

              <DefaultText
                fontSize="3xl"
                fontWeight="medium"
                color={theme.colors.otherGrey[200]}
              >
                {`${
                  Number(data?.toBatch?.available || 0) +
                  Number(data.stockCount || 0)
                }`}
              </DefaultText>
            </View>
          </View>
        </View>
      )}

      {inventoryReduceStock && (
        <View>
          <Spacer space={hp("4%")} />

          <Label>{t("UPDATED STOCK")}</Label>

          <View
            style={{
              ...styles.stockView,
              borderRadius: 16,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">{t("Stock on hand")}</DefaultText>

            {data.stockAction.key === STOCK_ACTION.INVENTORY_RECOUNT ? (
              <DefaultText
                fontSize="3xl"
                fontWeight="medium"
                color={theme.colors.otherGrey[200]}
              >
                {`${
                  enabledBatching
                    ? data.previousStock +
                      Number(data.stockCount) -
                      Number(data.fromBatch?.available || 0)
                    : Number(data.stockCount)
                }`}
              </DefaultText>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <DefaultText color={theme.colors.otherGrey[200]}>
                  {`${data.fromBatch?.available || data.previousStock} - ${
                    data.stockCount || "0"
                  } = `}
                </DefaultText>

                <DefaultText
                  fontSize="3xl"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[200]}
                >
                  {`${
                    (data.fromBatch?.available || data.previousStock) -
                    Number(data.stockCount)
                  }`}
                </DefaultText>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  stockView: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unitCostView: {
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
