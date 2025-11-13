import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { UNIT_OPTIONS } from "../../utils/constants";
import ImageUploader from "../image-uploader";
import AmountInput from "../input/amount-input";
import Input from "../input/input";
import SelectInput from "../input/select-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import Label from "../text/label";
import ToolTip from "../tool-tip";
import showToast from "../toast";
import Toast from "react-native-toast-message";

export default function VariantDetails({
  formik,
  type,
  skuGenerated,
  handleDelete,
  handleGenerateSKU,
}: {
  formik: any;
  type: string;
  skuGenerated: boolean;
  handleDelete?: any;
  handleGenerateSKU: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();

  const { hp, wp, twoPaneView } = useResponsive();

  const getPriceMargin = useMemo(() => {
    const price = Number(formik.values.price || 0);
    const costPrice = Number(formik.values.costPrice || 0);

    if (price > 0 && costPrice > 0) {
      const margin = price - costPrice;
      const marginPercent = (margin / price) * 100;
      return `${t("SAR")} ${margin.toFixed(2)}, ${marginPercent.toFixed(2)}%`;
    } else {
      return "NA";
    }
  }, [formik.values.costPrice, formik.values.price]);

  return (
    <View>
      <KeyboardAvoidingView
        enabled={true}
        behavior={"height"}
        keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 120}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: hp("3%"),
            paddingHorizontal: hp("2.5%"),
          }}
        >
          {type !== "single" && (
            <View>
              {twoPaneView ? (
                <View style={styles.variantNameImgView}>
                  <View style={{ width: "68%" }}>
                    <Input
                      style={{ width: "100%" }}
                      label={`${t("VARIANT NAME")} *`}
                      autoCapitalize="words"
                      maxLength={60}
                      placeholderText={t("Enter the variant name")}
                      values={formik.values.en_name}
                      handleChange={(val: any) =>
                        formik.setFieldValue("en_name", val)
                      }
                    />
                    <ErrorText
                      errors={
                        (formik.errors.en_name &&
                          formik.touched.en_name) as Boolean
                      }
                      title={formik.errors.en_name || ""}
                    />

                    <Spacer space={hp("2.5%")} />

                    <Input
                      style={{ width: "100%" }}
                      label={`${t("VARIANT NAME IN ARABIC")} *`}
                      autoCapitalize="words"
                      maxLength={60}
                      placeholderText={t("Enter the variant name")}
                      values={formik.values.ar_name}
                      handleChange={(val: any) =>
                        formik.setFieldValue("ar_name", val)
                      }
                    />
                    <ErrorText
                      errors={
                        (formik.errors.ar_name &&
                          formik.touched.ar_name) as Boolean
                      }
                      title={formik.errors.ar_name || ""}
                    />
                  </View>

                  <View style={{ marginLeft: wp("2%"), alignItems: "center" }}>
                    <ImageUploader
                      picText={
                        !formik.values.variantPic
                          ? t("Upload Picture")
                          : t("Change Picture")
                      }
                      uploadedImage={formik.values.variantPic}
                      handleImageChange={(uri: string) => {
                        formik.setFieldValue("variantPic", uri);
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <View
                    style={{ alignItems: "center", marginBottom: hp("3%") }}
                  >
                    <ImageUploader
                      size={hp("20%")}
                      picText={
                        !formik.values.variantPic
                          ? t("Upload Picture")
                          : t("Change Picture")
                      }
                      uploadedImage={formik.values.variantPic}
                      handleImageChange={(uri: string) => {
                        formik.setFieldValue("variantPic", uri);
                      }}
                    />
                  </View>

                  <Input
                    style={{ width: "100%" }}
                    label={`${t("VARIANT NAME")} *`}
                    autoCapitalize="words"
                    maxLength={60}
                    placeholderText={t("Enter the variant name")}
                    values={formik.values.en_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("en_name", val)
                    }
                  />
                  <ErrorText
                    errors={
                      (formik.errors.en_name &&
                        formik.touched.en_name) as Boolean
                    }
                    title={formik.errors.en_name || ""}
                  />

                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={`${t("VARIANT NAME IN ARABIC")} *`}
                    autoCapitalize="words"
                    maxLength={60}
                    placeholderText={t("Enter the variant name")}
                    values={formik.values.ar_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("ar_name", val)
                    }
                  />
                  <ErrorText
                    errors={
                      (formik.errors.ar_name &&
                        formik.touched.ar_name) as Boolean
                    }
                    title={formik.errors.ar_name || ""}
                  />
                </View>
              )}

              <Spacer space={hp("3.75%")} />
            </View>
          )}

          {isConnected && !skuGenerated && (
            <TouchableOpacity
              style={{
                marginBottom: 6,
                marginRight: hp("1.5%"),
                alignSelf: "flex-end",
              }}
              onPress={handleGenerateSKU}
              disabled={skuGenerated}
            >
              <DefaultText
                fontSize="md"
                fontWeight="medium"
                color={skuGenerated ? theme.colors.placeholder : "primary.1000"}
              >
                {t("GENERATE SKU")}
              </DefaultText>
            </TouchableOpacity>
          )}

          <View>
            <View
              style={{
                ...styles.skuView,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <DefaultText fontWeight="normal">{`${t("SKU")} *`}</DefaultText>

              <Input
                containerStyle={styles.skuInputContainerView}
                maxLength={16}
                style={{
                  width: "100%",
                  textAlign: isRTL ? "left" : "right",
                }}
                keyboardType={"number-pad"}
                placeholderText={t("Enter sku")}
                values={formik.values.sku}
                handleChange={(val: any) => {
                  const skuVal = val?.trim();
                  if (skuVal) {
                    const boxes = formik.values.boxes.map((box: any) => {
                      if (box.parentSku === formik.values.sku) {
                        return { ...box, parentSku: val };
                      } else {
                        return box;
                      }
                    });

                    formik.setFieldValue("sku", val);
                    formik.setFieldValue("boxes", boxes);
                  }
                }}
                disabled={formik.values._id}
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
                ...styles.priceView,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <DefaultText fontWeight="normal">{t("Code")}</DefaultText>

              <Input
                containerStyle={styles.skuInputContainerView}
                maxLength={30}
                style={{
                  width: "100%",
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={t("Enter code")}
                values={formik.values.code}
                handleChange={(val: any) => {
                  formik.setFieldValue("code", val?.trim());
                }}
              />
            </View>

            <View
              style={{
                ...styles.dividerView,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <SelectInput
              containerStyle={{
                borderWidth: 0,
                borderRadius: 0,
              }}
              clearValues={formik.values.unit.key == ""}
              isTwoText={true}
              allowSearch={false}
              leftText={`${t("Unit")} *`}
              placeholderText={t("Select Unit")}
              options={UNIT_OPTIONS}
              values={formik.values.unit}
              handleChange={(val: any) => {
                if (val.key && val.value) {
                  formik.setFieldValue("unit", val);
                }
              }}
            />

            <View
              style={{
                ...styles.dividerView,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.stockView,
                paddingVertical: 16,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <DefaultText fontWeight="normal">{t("Stock")}</DefaultText>

              <DefaultText color={theme.colors.otherGrey[200]}>
                {formik.values.stockCount || "NA"}
              </DefaultText>
            </View>
          </View>

          <Spacer space={hp("3.75%")} />

          <Label>{t("COST & SELLING PRICE")}</Label>

          <View>
            <View
              style={{
                ...styles.skuView,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText fontWeight="normal">
                  {`${t("Cost Price")} (${t("in")} ${t("SAR")})`}
                </DefaultText>

                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <ToolTip infoMsg={t("info_cost_price")} />
                </View>
              </View>

              <AmountInput
                containerStyle={styles.amountView}
                maxLength={6}
                style={{
                  width: "100%",
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={`${t("SAR")}  0.00`}
                values={formik.values.costPrice}
                handleChange={(val: any) => {
                  if (val.length > 2) {
                    showToast("info", t("Amount exceeds 3 digits"));
                  }
                  formik.setFieldValue("costPrice", val);
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
                ...styles.priceView,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <DefaultText fontWeight="normal">{`${t("Selling Price")} (${t(
                "in"
              )} ${t("SAR")})`}</DefaultText>

              <AmountInput
                containerStyle={styles.amountView}
                maxLength={6}
                style={{
                  width: "100%",
                  textAlign: isRTL ? "left" : "right",
                }}
                placeholderText={`${t("SAR")}  0.00`}
                values={formik.values.price}
                handleChange={(val: any) => {
                  if (val.length > 2) {
                    showToast("info", t("Amount exceeds 3 digits"));
                  }
                  formik.setFieldValue("price", val);
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
                ...styles.stockView,
                paddingVertical: 16,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              <DefaultText fontWeight="normal">{t("Margin")}</DefaultText>

              <DefaultText
                fontSize="xl"
                fontWeight="normal"
                color={theme.colors.placeholder}
              >
                {getPriceMargin}
              </DefaultText>
            </View>
          </View>

          {formik.values._id && (
            <TouchableOpacity
              style={{ marginTop: hp("5%") }}
              onPress={() => {
                handleDelete(formik.values.sku);
              }}
            >
              <DefaultText
                fontSize="2xl"
                fontWeight="medium"
                color={"red.default"}
              >
                {t("Delete")}
              </DefaultText>
            </TouchableOpacity>
          )}

          <Spacer space={hp("18%")} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  variantNameImgView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skuView: {
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skuInputContainerView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
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
  priceView: {
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
});
