import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import endpoint from "../../../api/endpoints";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import { checkDirection } from "../../../hooks/check-direction";
import { checkInternet } from "../../../hooks/check-internet";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { useCurrency } from "../../../store/get-currency";
import { AuthType } from "../../../types/auth-types";
import { objectId } from "../../../utils/bsonObjectIdTransformer";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import AmountInput from "../../input/amount-input";
import Input from "../../input/input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";

type AddBoxProps = {
  _id: string;
  sku: string;
  noOfUnits: string;
  locationRefs: string[];
  locations: string[];
  costPrice: string;
  price: string;
  prices: [];
  status: string;
};

export default function AddBoxPack({
  data,
  visible = false,
  handleClose,
  handleAdd,
  handleCreateAnother,
  handleDelete,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleAdd: any;
  handleCreateAnother?: any;
  handleDelete?: any;
}) {
  const theme = useTheme();

  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const [addAnother, setAddAnother] = useState(false);
  const [skuGenerated, setSkuGenerated] = useState(false);
  const { currency } = useCurrency();
  const { hp, twoPaneView } = useResponsive();

  const formik: FormikProps<AddBoxProps> = useFormik<AddBoxProps>({
    initialValues: {
      _id: "",
      sku: "",
      noOfUnits: "",
      locationRefs: [],
      locations: [],
      costPrice: "",
      price: "",
      prices: [],
      status: "active",
    },

    onSubmit: async (values) => {
      if (values.sku == "") {
        setAddAnother(false);
        showToast("error", t("Enter SKU"));
        return;
      } else if (values.sku.length < 3) {
        setAddAnother(false);
        showToast("error", t("SKU must be at least 8 characters"));
        return;
      } else if (!/^[0-9]+$/.test(values.sku)) {
        setAddAnother(false);
        showToast("error", t("SKU must contain only umeric values"));
        return;
      } else if (data.box?.sku !== values.sku) {
        let skuExistInDB = false;
        const skuExistInLocal = data.sku.includes(values.sku);

        if (!skuExistInLocal) {
          const skuProd = await repository.productRepository.findBySku(
            values.sku
          );
          skuExistInDB = !!skuProd;
        }

        if (skuExistInLocal || skuExistInDB || values.sku === data.variantSku) {
          setAddAnother(false);
          showToast("error", t("SKU already exist"));
          return;
        }
      }

      if (values.noOfUnits == "") {
        setAddAnother(false);
        showToast("error", t("Enter number of units"));
        return;
      }

      if (values.costPrice == "") {
        setAddAnother(false);
        showToast("error", t("Enter cost price"));
        return;
      } else if (Number(values.costPrice) <= 0) {
        setAddAnother(false);
        showToast("error", t("Cost price must be greater than 0"));
        return;
      }

      if (values.price == "") {
        setAddAnother(false);
        showToast("error", t("Enter price"));
        return;
      } else if (Number(values.price) <= 0) {
        setAddAnother(false);
        showToast("error", t("Price must be greater than 0"));
        return;
      }

      const businessDetails: any = await repository.business.findByLocationId(
        authContext.user.locationRef
      );

      const dataObj = {
        _id: data.box ? data.box._id : objectId(),
        parentSku: data.box ? data.box.parentSku : data.variant.sku,
        parentName: data.box
          ? data.box.parentName
          : { en: data.variant.en_name, ar: data.variant.ar_name },
        type: data.box ? data.box.type : "box",
        assignedToAll: data.box ? data.box.assignedToAll : false,
        en_name: data.variant.en_name,
        ar_name: data.variant.ar_name,
        image: data.box?.image || "",
        variantPic: data.box?.variantPic,
        sku: values.sku,
        unit: data.variant?.unit?.key || "perItem",
        noOfUnits: values.noOfUnits,
        locationRefs: data.box
          ? data.box.locationRefs
          : [businessDetails.location._id],
        locations: data.box
          ? data.box.locations?.map((loc: any) => {
              return { name: loc.name };
            })
          : [{ name: businessDetails.location.name.en }],
        costPrice: data.box ? data.box.costPrice : values.costPrice,
        price: data.box ? data.box.price : values.price,
        prices: [
          {
            costPrice: values.costPrice,
            price: values.price,
            locationRef: businessDetails.location._id,
            location: { name: businessDetails.location.name.en },
          },
        ],
        otherPrices: data.box?.otherPrices || [],
        stocks: data.box?.stocks || [],
        otherStocks: data.box?.otherStocks || [],
        status: values.status,
      };

      if (addAnother) {
        handleCreateAnother(dataObj);
        formik.resetForm();
        setAddAnother(false);
      } else {
        handleAdd(dataObj);
      }

      showToast(
        "success",
        data.box ? t("Box/Pack Updated") : t("Box/Pack Added")
      );
    },

    validationSchema: Yup.object().shape({}),
  });

  const getUniqueSKU = async () => {
    try {
      const res = await serviceCaller(endpoint.generateUniqueSKU.path, {
        method: endpoint.generateUniqueSKU.method,
      });

      if (res?.sku) {
        setSkuGenerated(true);
        formik.setFieldValue("sku", res.sku);
      }
    } catch (error: any) {
      formik.setFieldValue("sku", "");
    }
  };

  useEffect(() => {
    if (data) {
      formik.resetForm();

      if (data.box) {
        setSkuGenerated(true);

        formik.setValues({
          _id: data.box._id,
          sku: data.box.sku,
          noOfUnits: `${data.box.noOfUnits}`,
          locationRefs: data.box.locationRefs,
          locations: data.box.locations,
          costPrice: data.box.prices[0]?.costPrice || "0",
          price: data.box.prices[0]?.price || "0",
          prices: data.box.prices,
          status: data.box.status,
        });
      } else {
        setSkuGenerated(false);
      }
    }
  }, [data]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: "transparent",
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", left: 100000 }}
          onPress={(e) => {
            e.preventDefault();
          }}
        >
          <Text>PRESS</Text>
        </TouchableOpacity>

        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            isClose={false}
            title={data.box ? data.title : t("Add a Box/Pack")}
            rightBtnText={data.box ? t("Done") : t("Add")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.handleSubmit();
            }}
            permission={
              data.box
                ? authContext.permission["pos:product"]?.update
                : authContext.permission["pos:product"]?.create
            }
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              {isConnected && !skuGenerated && (
                <TouchableOpacity
                  style={{
                    marginBottom: 6,
                    marginRight: hp("1.5%"),
                    alignSelf: "flex-end",
                  }}
                  onPress={() => {
                    getUniqueSKU();
                  }}
                  disabled={skuGenerated}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color={
                      skuGenerated ? theme.colors.placeholder : "primary.1000"
                    }
                  >
                    {t("GENERATE SKU")}
                  </DefaultText>
                </TouchableOpacity>
              )}

              <View
                style={{
                  ...styles.skuView,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText fontWeight="normal">{t("Item Name")}</DefaultText>

                <DefaultText color={theme.colors.otherGrey[200]}>
                  {isRTL
                    ? `${data.productName?.ar} - ${data.variant?.ar_name}`
                    : `${data.productName?.en} - ${data.variant?.en_name}`}
                </DefaultText>
              </View>

              <View
                style={{
                  ...styles.dividerView,
                  borderColor: theme.colors.dividerColor.main,
                }}
              />

              <View
                style={{
                  ...styles.noOfUnitsView,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText fontWeight={"normal"}>{`${t(
                  "Box SKU"
                )} *`}</DefaultText>

                <Input
                  containerStyle={styles.inputContainerView}
                  maxLength={16}
                  style={{
                    width: "100%",
                    textAlign: isRTL ? "left" : "right",
                  }}
                  placeholderText={t("Enter sku")}
                  values={formik.values.sku}
                  handleChange={(val: any) => {
                    formik.setFieldValue("sku", val?.trim());
                  }}
                  disabled={data.box?._id}
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
                  ...styles.noOfUnitsView,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText fontWeight={"normal"}>
                  {`${t("No")}. ${t("of units in the box")} *`}
                </DefaultText>

                <Input
                  containerStyle={styles.inputContainerView}
                  style={{
                    width: "100%",
                    textAlign: isRTL ? "left" : "right",
                  }}
                  keyboardType="number-pad"
                  placeholderText={t("Enter number of units")}
                  values={formik.values.noOfUnits}
                  handleChange={(val: any) => {
                    if (val === "" || /^[0-9\b]+$/.test(val)) {
                      formik.setFieldValue("noOfUnits", val);
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

              <View
                style={{
                  ...styles.noOfUnitsView,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText fontWeight="normal">
                  {`${t("Cost of the box")} (${t("in")} ${currency}) *`}
                </DefaultText>

                <AmountInput
                  containerStyle={styles.amountView}
                  maxLength={6}
                  style={{
                    width: "100%",
                    textAlign: isRTL ? "left" : "right",
                  }}
                  placeholderText={`${currency}  0.00`}
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
                  ...styles.sellingPriceView,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText fontWeight="normal">
                  {`${t("Selling price of the box")} (${t(
                    "in"
                  )} ${currency}) *`}
                </DefaultText>

                <AmountInput
                  containerStyle={styles.amountView}
                  maxLength={6}
                  style={{
                    width: "100%",
                    textAlign: isRTL ? "left" : "right",
                  }}
                  placeholderText={`${currency}  0.00`}
                  values={formik.values.price}
                  handleChange={(val: any) => {
                    if (val.length > 2) {
                      showToast("info", t("Amount exceeds 3 digits"));
                    }
                    formik.setFieldValue("price", val);
                  }}
                />
              </View>

              {formik.values._id ? (
                <TouchableOpacity
                  style={{ marginTop: hp("5%") }}
                  onPress={() => {
                    handleDelete(formik.values._id);
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
              ) : (
                <TouchableOpacity
                  style={{ marginTop: hp("5%") }}
                  onPress={() => {
                    setAddAnother(true);
                    formik.handleSubmit();
                  }}
                >
                  <DefaultText
                    fontSize="3xl"
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {t("Create and add another")}
                  </DefaultText>
                </TouchableOpacity>
              )}

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  skuView: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputContainerView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
  },
  dividerView: {
    marginLeft: 16,
    borderBottomWidth: 0.5,
  },
  selectInputView: {
    borderWidth: 0,
    borderRadius: 0,
  },
  noOfUnitsView: {
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
  sellingPriceView: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
