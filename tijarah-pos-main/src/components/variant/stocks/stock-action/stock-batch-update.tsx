import { format } from "date-fns";
import React, { useMemo, useRef } from "react";
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

export default function StockBatchUpdate({
  formik,
  batchList,
}: {
  formik: any;
  batchList: any[];
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const fromBatchSheetRef = useRef<any>();
  const toBatchSheetRef = useRef<any>();
  const { hp } = useResponsive();

  const fromBatchOptions = useMemo(() => {
    if (formik.values.toBatch?._id) {
      return (
        batchList?.filter(
          (batch: any) =>
            !formik.values.toBatch._id?.includes(batch._id) ||
            Number(batch?.available) > 0
        ) || []
      );
    } else {
      return (
        batchList?.filter((batch: any) => Number(batch?.available) > 0) || []
      );
    }
  }, [batchList, formik.values.toBatch]);

  const toBatchOptions = useMemo(() => {
    if (formik.values.fromBatch?._id) {
      return (
        batchList?.filter(
          (batch: any) => !formik.values.fromBatch._id?.includes(batch._id)
        ) || []
      );
    } else {
      return batchList;
    }
  }, [batchList, formik.values.fromBatch]);

  return (
    <View>
      {formik.values.stockAction.key === STOCK_ACTION.BATCH_SHIFT && (
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
              paddingVertical: 15,
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
              {`${t("From batch Expiry date")} *`}
            </DefaultText>

            <View
              style={{
                width: "65%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
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
                      new Date(formik.values.fromBatch?.expiry),
                      "dd/MM/yyyy"
                    )}, ${t("Quantity")}: ${
                      formik.values.fromBatch?.available || 0
                    }`
                  : t("Select from batch")}
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

          <View
            style={{
              ...styles.dividerView,
              borderColor: theme.colors.dividerColor.main,
            }}
          />

          <View
            style={{
              ...styles.amountContainerView,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="normal">
              {`${t("Shift stock")} *`}
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

          <View
            style={{
              ...styles.dividerView,
              borderColor: theme.colors.dividerColor.main,
            }}
          />

          <TouchableOpacity
            style={{
              ...styles.expiryView,
              backgroundColor: theme.colors.white[1000],
            }}
            onPress={() => {
              toBatchSheetRef?.current?.open();
            }}
          >
            <DefaultText
              style={{ width: "35%" }}
              fontWeight="normal"
              fontSize="xl"
              color={theme.colors.text.primary}
            >
              {`${t("To batch Expiry date")} *`}
            </DefaultText>

            <View
              style={{
                width: "65%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <DefaultText
                fontWeight="normal"
                fontSize="xl"
                color={
                  formik.values.toBatch?._id
                    ? theme.colors.otherGrey[100]
                    : theme.colors.placeholder
                }
                style={{ marginRight: hp("2%") }}
              >
                {formik.values.toBatch?._id
                  ? `${t("Batch")}: ${format(
                      new Date(formik.values.toBatch?.expiry),
                      "dd/MM/yyyy"
                    )}, ${t("Quantity")}: ${
                      formik.values.toBatch?.available || 0
                    }`
                  : t("Select to batch")}
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

      <BatchesInputSheet
        sheetRef={fromBatchSheetRef}
        options={fromBatchOptions}
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

      <BatchesInputSheet
        sheetRef={toBatchSheetRef}
        options={toBatchOptions}
        values={formik.values.toBatch}
        label={t("Select batch")}
        onSearch={() => {}}
        handleSelected={(data: any) => {
          formik.setFieldValue("toBatch", data);

          if (toBatchSheetRef?.current != null) {
            toBatchSheetRef.current.close();
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
