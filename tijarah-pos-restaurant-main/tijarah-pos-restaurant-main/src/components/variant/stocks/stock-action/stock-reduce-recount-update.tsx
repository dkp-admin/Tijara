import { format } from "date-fns";
import React, { useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import Input from "../../../input/input";
import DefaultText from "../../../text/Text";
import BatchesInputSheet from "../batch-input-sheet";
import { STOCK_ACTION } from "./types";

export default function StockReduceRecountUpdate({
  formik,
  data,
  batchList,
}: {
  formik: any;
  data: any;
  batchList: any[];
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const fromBatchSheetRef = useRef<any>();
  const { hp } = useResponsive();

  const reduceRecountStock =
    formik.values.stockAction.key === STOCK_ACTION.LOSS ||
    formik.values.stockAction.key === STOCK_ACTION.THEFT ||
    formik.values.stockAction.key === STOCK_ACTION.DAMAGED ||
    formik.values.stockAction.key === STOCK_ACTION.INVENTORY_RECOUNT;

  return (
    <View>
      {reduceRecountStock && (
        <View>
          <View
            style={{
              ...styles.dividerView,
              borderColor: theme.colors.dividerColor.main,
            }}
          />

          <View
            style={{
              ...styles.amountContainerView,
              borderBottomLeftRadius: batchList.length > 0 ? 0 : 16,
              borderBottomRightRadius: batchList.length > 0 ? 0 : 16,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">
              {formik.values.stockAction.key === STOCK_ACTION.INVENTORY_RECOUNT
                ? `${t("Recount stock")} *`
                : `${t("Reduce stock")} *`}
            </DefaultText>

            <Input
              containerStyle={styles.inputContainerView}
              style={{
                width: "100%",
                textAlign: isRTL ? "left" : "right",
              }}
              maxLength={10}
              keyboardType="number-pad"
              placeholderText={t("Enter stock count")}
              values={formik.values.stockCount}
              handleChange={(val: any) => {
                if (val === "" || /^[0-9\b]+$/.test(val)) {
                  formik.setFieldValue("stockCount", val);
                }
              }}
            />
          </View>

          {batchList.length > 0 && (
            <View>
              <View
                style={{
                  ...styles.dividerView,
                  borderColor: theme.colors.dividerColor.main,
                }}
              />

              <TouchableOpacity
                style={{
                  ...styles.amountContainerView,
                  paddingVertical: 16,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  fromBatchSheetRef?.current?.open();
                }}
              >
                <DefaultText
                  style={{ width: "35%" }}
                  fontWeight="normal"
                  fontSize="xl"
                  color={theme.colors.text.primary}
                >
                  {`${t("Expiry Date")} ${data.enabledBatching ? "*" : ""}`}
                </DefaultText>

                <View style={styles.expiryView}>
                  <DefaultText
                    fontWeight="normal"
                    fontSize="xl"
                    color={
                      formik.values.fromBatch?._id
                        ? theme.colors.otherGrey[100]
                        : theme.colors.placeholder
                    }
                    style={{ marginRight: hp("2%") }}
                  >
                    {formik.values.fromBatch?._id
                      ? `${t("Batch")}: ${format(
                          new Date(formik?.values?.fromBatch?.expiry),
                          "dd/MM/yyyy"
                        )}, ${t("Quantity")}: ${
                          formik?.values?.fromBatch?.available || 0
                        }`
                      : t("Select batch")}
                  </DefaultText>

                  <View
                    style={{
                      transform: [
                        {
                          rotate: isRTL ? "180deg" : "0deg",
                        },
                      ],
                    }}
                  >
                    <ICONS.RightContentIcon />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <BatchesInputSheet
        sheetRef={fromBatchSheetRef}
        options={batchList}
        values={formik.values.fromBatch}
        label={t("Select batch")}
        onSearch={() => {}}
        handleSelected={(data: any) => {
          formik.setFieldValue("fromBatch", data);

          if (fromBatchSheetRef?.current != null) {
            fromBatchSheetRef.current.close();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  inputContainerView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
  },
  amountContainerView: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expiryView: {
    width: "65%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
