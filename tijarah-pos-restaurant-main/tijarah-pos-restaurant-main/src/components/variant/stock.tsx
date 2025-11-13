import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import { showAlert } from "../../utils/showAlert";
import DateInput from "../input/date-input";
import Input from "../input/input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import Label from "../text/label";
import StockAction from "./stocks/stock-action";
import StockHistory from "./stocks/stock-history";

export default function StockVariant({
  formik,
  productId = "",
  variantId = "",
  productName,
  enabledBatching = false,
  handleStockUpdate,
}: {
  formik: any;
  productId: string;
  variantId: string;
  productName: any;
  enabledBatching: boolean;
  handleStockUpdate: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();
  const isKeyboardVisible = checkKeyboardState();

  const [openStockAction, setOpenStockAction] = useState(false);
  const [openStockHistory, setOpenStockHistory] = useState(false);

  const checkStockActionable = Boolean(
    productId && formik.values.enabledTracking
  );

  const checkForBatching = Boolean(
    productId && enabledBatching && !variantId && formik.values.enabledTracking
  );

  const showAvailabilityAlert = async (val: boolean) => {
    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: `${t(
        "You won’t be able to bill this variant, regardless of the stock count"
      )}. ${t("Are you sure you want to disable it?")}`,
      btnText1: t("No"),
      btnText2: t("Yes"),
      onPressBtn1: () => {},
      onPressBtn2: () => {
        formik.setFieldValue("enabledAvailability", val);
      },
    });
  };

  return (
    <View>
      <KeyboardAvoidingView enabled={true}>
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: hp("3%"),
            paddingHorizontal: hp("2.5%"),
            marginTop: isKeyboardVisible ? "-12%" : "0%",
          }}
        >
          <View
            style={{
              ...styles.content_view,
              borderRadius: 16,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <DefaultText>{t("Availability")}</DefaultText>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText
                color={
                  formik.values.enabledAvailability
                    ? "text.1000"
                    : "red.default"
                }
              >
                {formik.values.enabledAvailability
                  ? t("Available for sale")
                  : t("Out of stock")}
              </DefaultText>

              <Switch
                style={{
                  marginLeft: 12,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  if (val) {
                    formik.setFieldValue("enabledAvailability", val);
                  } else {
                    showAvailabilityAlert(val);
                  }
                }}
                value={formik.values.enabledAvailability}
              />
            </View>
          </View>

          <Spacer space={hp("3.75%")} />

          <Label>{t("MANAGE STOCKS")}</Label>

          <View>
            <View
              style={{
                ...styles.content_view,
                borderRadius: 16,
                borderBottomLeftRadius: formik.values.enabledTracking ? 0 : 16,
                borderBottomRightRadius: formik.values.enabledTracking ? 0 : 16,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <DefaultText>{t("Tracking")}</DefaultText>

              <Switch
                style={{
                  marginHorizontal: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  if (!val) {
                    formik.setFieldValue("enabledLowStockAlert", val);
                  }
                  formik.setFieldValue("enabledTracking", val);
                }}
                value={formik.values.enabledTracking}
              />
            </View>

            {formik.values.enabledTracking && (
              <View>
                <View
                  style={{
                    ...styles.dividerView,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <View
                  style={{
                    ...styles.stockView,
                    borderBottomLeftRadius: checkForBatching ? 0 : 16,
                    borderBottomRightRadius: checkForBatching ? 0 : 16,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <DefaultText fontWeight="normal">{`${t("Stock")} ${
                    productId !== "" && formik.values.enabledTracking ? "*" : ""
                  }`}</DefaultText>

                  <Input
                    containerStyle={styles.skuInputContainerView}
                    style={{
                      width: "100%",
                      textAlign: isRTL ? "left" : "right",
                    }}
                    maxLength={10}
                    keyboardType="number-pad"
                    placeholderText={t("Enter Stock")}
                    values={
                      formik.values.stockCount || formik.values.stockCount === 0
                        ? `${formik.values.stockCount}`
                        : ""
                    }
                    handleChange={(val: any) => {
                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("stockCount", val);
                      }
                    }}
                    disabled={productId === "" || variantId !== ""}
                  />
                </View>

                {checkForBatching && (
                  <View>
                    <View
                      style={{
                        ...styles.dividerView,
                        borderColor: theme.colors.dividerColor.main,
                      }}
                    />

                    <View
                      style={{
                        ...styles.stockView,
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText fontWeight="normal">
                        {`${t("Expiry Date")} ${checkForBatching ? "*" : ""}`}
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
              </View>
            )}
          </View>

          {checkStockActionable && (
            <>
              <Spacer space={hp("3.75%")} />

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 0.5 }}>
                  <TouchableOpacity
                    style={{
                      borderRadius: 14,
                      paddingVertical: hp("2%"),
                      backgroundColor: theme.colors.white[1000],
                    }}
                    onPress={() => {
                      setOpenStockAction(true);
                    }}
                  >
                    <DefaultText
                      style={{ textAlign: "center" }}
                      fontSize="2xl"
                      fontWeight="medium"
                      color="primary.1000"
                    >
                      {t("Update Stock")}
                    </DefaultText>
                  </TouchableOpacity>
                </View>

                <Spacer space={hp("3%")} />

                <View style={{ flex: 0.5 }}>
                  <TouchableOpacity
                    style={{
                      borderRadius: 14,
                      paddingVertical: hp("2%"),
                      backgroundColor: theme.colors.white[1000],
                    }}
                    onPress={() => {
                      setOpenStockHistory(true);
                    }}
                  >
                    <DefaultText
                      style={{ textAlign: "center" }}
                      fontSize="2xl"
                      fontWeight="medium"
                      color="primary.1000"
                    >
                      {t("View Stock History")}
                    </DefaultText>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <Spacer space={hp("3.75%")} />

          {formik.values.enabledTracking && (
            <View>
              <View
                style={{
                  ...styles.content_view,
                  borderRadius: 16,
                  borderBottomLeftRadius: formik.values.enabledLowStockAlert
                    ? 0
                    : 16,
                  borderBottomRightRadius: formik.values.enabledLowStockAlert
                    ? 0
                    : 16,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText>{t("Low stock alert")}</DefaultText>

                <Switch
                  style={{
                    marginHorizontal: 8,
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={(val: any) => {
                    formik.setFieldValue("enabledLowStockAlert", val);
                  }}
                  value={formik.values.enabledLowStockAlert}
                />
              </View>

              {formik.values.enabledLowStockAlert && (
                <View>
                  <View
                    style={{
                      ...styles.dividerView,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <View
                    style={{
                      ...styles.stockView,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight="normal">
                      {`${t("Alert when the stock count goes below")} *`}
                    </DefaultText>

                    <Input
                      containerStyle={styles.skuInputContainerView}
                      style={{
                        width: "100%",
                        textAlign: isRTL ? "left" : "right",
                      }}
                      maxLength={10}
                      keyboardType="number-pad"
                      placeholderText={t("Enter Stock Count")}
                      values={`${formik.values.lowStockCount || ""}`}
                      handleChange={(val: any) => {
                        if (val === "" || /^[0-9\b]+$/.test(val)) {
                          formik.setFieldValue("lowStockCount", val);
                        }
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <StockAction
        data={{
          productId,
          productName,
          enabledBatching,
          variantFormik: formik.values,
        }}
        visible={openStockAction}
        handleClose={() => {
          setOpenStockAction(false);
        }}
        handleUpdated={(data: any) => {
          formik.setFieldValue("actions", [{ ...data }]);
          setOpenStockAction(false);
          handleStockUpdate();
        }}
      />

      <StockHistory
        data={{ variant: formik.values, productName: productName }}
        visible={openStockHistory}
        handleClose={() => {
          setOpenStockHistory(false);
        }}
        handleDone={() => {
          setOpenStockHistory(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content_view: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input_content_view: {
    opacity: 1,
    borderWidth: 0,
    borderRadius: 0,
    marginVertical: 5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  stockView: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skuInputContainerView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
  },
});
