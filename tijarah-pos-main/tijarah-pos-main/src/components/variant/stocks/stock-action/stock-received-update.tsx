import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import AmountInput from "../../../input/amount-input";
import DateInput from "../../../input/date-input";
import Input from "../../../input/input";
import DefaultText from "../../../text/Text";
import BatchesInputSheet from "../batch-input-sheet";
import { STOCK_ACTION } from "./types";
import VendorSelectInput from "./vendor-select-input";
import { debugLog } from "../../../../utils/log-patch";

export default function StockReceivedUpdate({
  formik,
  data,
}: {
  formik: any;
  data: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const receivingItemSheetRef = useRef<any>();
  const vendorSheetRef = useRef<any>();
  const { hp } = useResponsive();

  const [itemList, setItemList] = useState([
    { _id: "", name: "", sku: "", type: "", units: "", costPrice: "" },
  ]);

  useEffect(() => {
    const itemObj: any = {
      _id: data.variantFormik._id || "1",
      name: data.variantFormik.en_name,
      sku: data.variantFormik.sku,
      costPrice: data.variantFormik.costPrice,
      sellingPrice: data.variantFormik.price,
      type: "item",
      units: "",
    };

    if (data.variantFormik.boxes?.length === 0) {
      debugLog(
        "Receiving item with SKU list for stock received action",
        itemObj,
        "stock-action-modal",
        "handleReceivingItem"
      );
      formik.setFieldValue("receivingItem", itemObj);
      formik.setFieldValue("totalCost", itemObj.costPrice || "");
      setItemList([itemObj]);
    } else {
      const items = data.variantFormik.boxes?.map((box: any) => {
        if (box.parentSku === data.variantFormik.sku) {
          return {
            _id: box._id,
            name: data.variantFormik.en_name,
            sku: box.sku,
            type: box.type,
            units: box.noOfUnits,
            costPrice: box.prices?.[0]?.costPrice || "",
            sellingPrice: box.prices?.[0]?.price || "",
          };
        }
      });

      const boxList = items.filter((list: any) => {
        return list !== undefined;
      });

      debugLog(
        "Receiving item with SKU list for stock received action",
        {},
        "stock-action-modal",
        "handleReceivingItem"
      );

      setItemList([itemObj, ...boxList]);
    }
  }, [formik.values.stockAction]);

  useEffect(() => {
    const { receivingItem, quantity } = formik.values;

    if (receivingItem !== null && quantity !== "") {
      const stock =
        receivingItem.type === "item"
          ? Number(quantity)
          : Number(receivingItem.units) * Number(quantity);

      formik.setFieldValue("receivedStock", stock);
    } else {
      formik.setFieldValue("receivedStock", 0);
    }
  }, [formik.values.receivingItem, formik.values.quantity]);

  const getReceivingItemValue = useMemo(() => {
    const { receivingItem } = formik.values;

    if (receivingItem.type === "item") {
      return `${receivingItem.name}, ${receivingItem.sku}`;
    } else if (receivingItem.type === "box") {
      return `${receivingItem.name}, ${t("Box")} ${receivingItem.units} ${t(
        "Units"
      )}, ${receivingItem.sku}`;
    } else {
      return t("Select receiving item");
    }
  }, [formik.values.receivingItem]);

  return (
    <View>
      {formik.values.stockAction.key === STOCK_ACTION.STOCK_RECEIVED && (
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
              paddingVertical: 14,
              backgroundColor: theme.colors.white[1000],
            }}
            onPress={() => {
              receivingItemSheetRef?.current?.open();
            }}
          >
            <DefaultText
              style={{ width: "40%" }}
              fontWeight="normal"
              fontSize="xl"
              color={theme.colors.text.primary}
            >
              {`${t("Select the receiving item SKU")} *`}
            </DefaultText>

            <View
              style={{
                width: "60%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <DefaultText
                fontWeight="normal"
                fontSize="xl"
                color={
                  formik.values.receivingItem?._id
                    ? theme.colors.otherGrey[100]
                    : theme.colors.placeholder
                }
                style={{ marginRight: hp("2%") }}
              >
                {getReceivingItemValue}
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
            <DefaultText style={{ width: "40%" }} fontWeight="normal">
              {`${t("Enter the receiving SKU quantity")} *`}
            </DefaultText>

            <Input
              containerStyle={styles.inputContainerView}
              style={{
                width: "100%",
                textAlign: isRTL ? "left" : "right",
              }}
              maxLength={10}
              keyboardType="number-pad"
              placeholderText={t("Enter quantity")}
              values={formik.values.quantity}
              handleChange={(val: any) => {
                if (val === "" || /^[0-9\b]+$/.test(val)) {
                  const costPrice =
                    Number(formik.values.receivingItem.costPrice) * Number(val);

                  formik.setFieldValue("quantity", val);
                  formik.setFieldValue("totalCost", `${costPrice}`);
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
              ...styles.vendorView,
              backgroundColor: theme.colors.white[1000],
            }}
            onPress={() => {
              vendorSheetRef.current.open();
            }}
          >
            <DefaultText
              style={{ maxWidth: "40%" }}
              fontWeight="normal"
              color={theme.colors.text.primary}
            >
              {`${t("Vendor Name")} *`}
            </DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText
                fontWeight="normal"
                color={
                  formik.values.vendor.key
                    ? theme.colors.otherGrey[100]
                    : theme.colors.placeholder
                }
                style={{ marginRight: hp("2%") }}
              >
                {formik.values.vendor.key
                  ? formik.values.vendor.value
                  : t("Select Vendor")}
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
            <DefaultText style={{ width: "50%" }} fontWeight="normal">
              {`${t("Total cost of the receiving SKU")} (${t("in")} ${t(
                "SAR"
              )}) *`}
            </DefaultText>

            <AmountInput
              containerStyle={styles.amountView}
              maxLength={18}
              style={{
                width: "100%",
                textAlign: isRTL ? "left" : "right",
              }}
              placeholderText={`${t("SAR")}  0.00`}
              values={formik.values.totalCost}
              handleChange={(val: any) => {
                formik.setFieldValue("totalCost", val);
              }}
            />
          </View>

          <View
            style={{
              ...styles.dividerView,
              borderColor: theme.colors.dividerColor.main,
            }}
          />

          <View
            style={{
              ...styles.expiryView,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText fontWeight="nornal">
              {`${t("Expiry Date")} ${data.enabledBatching ? "*" : ""}`}
            </DefaultText>

            <DateInput
              placeholderText={t("Select date")}
              mode="date"
              dateFormat="dd/MM/yyyy"
              minimumDate={new Date()}
              values={formik.values.expiry}
              handleChange={(val: any) => {
                formik.setFieldValue("expiry", val);
              }}
            />
          </View>
        </View>
      )}

      <BatchesInputSheet
        batches={false}
        sheetRef={receivingItemSheetRef}
        options={itemList}
        values={formik.values.receivingItem}
        label={t("Select the receiving item SKU")}
        onSearch={() => {}}
        handleSelected={(data: any) => {
          formik.setFieldValue("receivingItem", data);
          formik.setFieldValue("totalCost", data.costPrice || "");

          if (receivingItemSheetRef?.current != null) {
            receivingItemSheetRef.current.close();
          }
        }}
      />

      <VendorSelectInput
        sheetRef={vendorSheetRef}
        values={formik.values.vendor}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("vendor", val);
            vendorSheetRef.current.close();
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
  amountView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
    alignSelf: "flex-end",
  },
  vendorView: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  expiryView: {
    paddingVertical: 2,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
