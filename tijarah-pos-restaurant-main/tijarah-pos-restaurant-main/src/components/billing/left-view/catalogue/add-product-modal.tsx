import { FormikProps, useFormik } from "formik";
import React, { useContext, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";

import { Product } from "../../../../db/schema/product/product";
import { checkDirection } from "../../../../hooks/check-direction";
import { checkInternet } from "../../../../hooks/check-internet";
import { useBusinessDetails } from "../../../../hooks/use-business-details";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { AuthType } from "../../../../types/auth-types";
import EntityNames from "../../../../types/entity-name";
import {
  ChannelsName,
  ContainsName,
  ContainsOptions,
  UNIT_OPTIONS,
} from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import AddEditCategoryModal from "../../../categories/add-category-modal";
import AmountInput from "../../../input/amount-input";
import Input from "../../../input/input";
import SelectInput from "../../../input/select-input";
import BrandSelectInput from "../../../products/brand-select-input";
import CategorySelectInput from "../../../products/category-select-input";
import ChannelsSelectInput from "../../../products/channels-select-input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import ErrorText from "../../../text/error-text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import ToolTip from "../../../tool-tip";
import { useCurrency } from "../../../../store/get-currency";

type AddBillingProductProps = {
  isRestaurant: boolean;
  en_name: string;
  ar_name: string;
  category: { value: string; key: string };
  contains: string;
  channels: string[];
  brand: { value: string; key: string };
  tax: { value: string; key: string };
  enabledBatching: boolean;
  sku: string;
  code: string;
  unit: { value: string; key: string };
  costPrice: string;
  price: string;
};

export default function AddBillingProductModal({
  visible = false,
  handleClose,
  handleAddProduct,
  dinein = false,
}: {
  visible: boolean;
  handleClose: any;
  handleAddProduct?: any;
  dinein?: boolean;
}) {
  const theme = useTheme();
  const { currency } = useCurrency();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const categorySelectInputRef = useRef<any>();
  const channelsSelectInputRef = useRef<any>();
  const brandSelectInputRef = useRef<any>();
  const authContext = useContext<AuthType>(AuthContext);
  const { hp, twoPaneView } = useResponsive();
  const { businessDetails } = useBusinessDetails();

  const [channels, setChannels] = useState<any[]>([]);
  const [callCatApi, setCallCatAPi] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [skuGenerated, setSkuGenerated] = useState(false);

  const formik: FormikProps<AddBillingProductProps> =
    useFormik<AddBillingProductProps>({
      initialValues: {
        isRestaurant: false,
        en_name: "",
        ar_name: "",
        category: { value: "", key: "" },
        brand: { value: "", key: "" },
        tax: { value: "", key: "" },
        contains: "",
        channels: [],
        enabledBatching: false,
        sku: "",
        code: "",
        unit: { value: "", key: "" },
        costPrice: "",
        price: "",
      },

      onSubmit: async (values) => {
        const validateFields = () => {
          if (!values.brand.key || !values.unit.key) {
            showToast("error", t("Please fill in all required fields"));
            return false;
          }
          return true;
        };

        if (!validateFields()) {
          return;
        }

        if (values.sku == "") {
          showToast("error", t("Enter SKU"));
          return;
        } else if (values.sku.length < 3) {
          showToast("error", t("SKU must be at least 8 characters"));
          return;
        } else if (!/^[0-9]+$/.test(values.sku)) {
          showToast("error", t("SKU must contain only umeric values"));
          return;
        }

        if (values.code !== "" && !/^[A-Za-z0-9]+$/.test(values.code)) {
          showToast("error", t("Code must contain only numeric values"));
          return;
        }

        try {
          const dataObj = {
            image: "",
            name: {
              en: values.en_name.trim(),
              ar: values.ar_name.trim(),
            },
            contains: values.contains,
            description: "",
            companyRef: businessDetails.location.companyRef,
            company: { name: businessDetails.company.name.en },
            brandRef: values.brand.key,
            brand: { name: values.brand.value },
            categoryRef: values.category.key,
            category: { name: values.category.value },
            restaurantCategoryRefs: [],
            restaurantCategories: [],
            collectionRefs: [],
            collections: [],
            taxRef: values.tax.key,
            tax: { percentage: Number(values.tax.value) },
            batching: values.enabledBatching,
            bestSeller: false,
            channel: values.channels,
            selfOrdering: true,
            onlineOrdering: true,
            isLooseItem: false,
            variants: [
              {
                assignedToAll: false,
                locations: [{ name: businessDetails.location.name.en }],
                locationRefs: [businessDetails.location._id],
                image: "",
                name: { en: "Regular", ar: "عادي" },
                type: "item",
                sku: values.sku,
                code: values.code || "",
                unit: values.unit.key,
                unitCount: 1,
                costPrice: Number(values.costPrice || 0),
                price: Number(values.price || 0),
                status: "active",
                nonSaleable: false,
                prices: [
                  {
                    price: Number(values.price || 0),
                    costPrice: Number(values.costPrice || 0),
                    locationRef: businessDetails.location._id,
                    location: { name: businessDetails.location.name.en },
                  },
                ],
                stockConfiguration: [
                  {
                    availability: true,
                    tracking: false,
                    count: 0,
                    lowStockAlert: false,
                    lowStockCount: 0,
                    locationRef: businessDetails.location._id,
                    location: { name: businessDetails.location.name.en },
                  },
                ],
              },
            ],
            boxes: [],
            nutritionalInformation: {
              calorieCount: null,
              preference: [],
              contains: [],
            },
            status: "active",
          };

          const res = await serviceCaller(endpoint.createProduct.path, {
            method: endpoint.createProduct.method,
            body: { ...dataObj },
          });

          if (res !== null) {
            EventRegister.emit("sync:enqueue", {
              entityName: EntityNames.ProductsPull,
            });

            const variantData: any = {
              _id: res.variants?.[0]?._id,
              parentSku: "",
              parentName: { en: "", ar: "" },
              type: "item",
              assignedToAll: false,
              name: { en: "Regular", ar: "عادي" },
              image: "",
              localImage: "",
              sku: values.sku,
              code: values?.code || "",
              unit: values.unit.key,
              noOfUnits: 1,
              costPrice: values.costPrice,
              sellingPrice: values.price,
              originalPrice: values.price,
              locationRefs: [businessDetails.location._id],
              locations: [{ name: businessDetails.location.name.en }],
              prices: [
                {
                  price: values.price,
                  costPrice: values.costPrice,
                  locationRef: businessDetails.location._id,
                  location: { name: businessDetails.location.name.en },
                },
              ],
              otherPrices: [],
              stocks: [
                {
                  enabledAvailability: true,
                  enabledTracking: false,
                  stockCount: 0,
                  enabledLowStockAlert: false,
                  lowStockCount: 0,
                  locationRef: businessDetails.location._id,
                  location: { name: businessDetails.location.name.en },
                },
              ],
              otherStocks: [],
              nonSaleable: false,
              status: "active",
            };

            const productData: Product = {
              _id: res._id,
              parent: "",
              name: { en: res.name.en, ar: res.name.ar },
              kitchenFacingName: { en: "", ar: "" },
              contains: res.contains,
              image: res.image,
              localImage: res.image,
              companyRef: res.companyRef,
              company: { name: res.company.name },
              categoryRef: res.categoryRef,
              category: { name: res.category.name },
              kitchenRefs: [],
              kitchens: [],
              restaurantCategoryRefs: res.restaurantCategoryRefs,
              restaurantCategories: res.restaurantCategories,
              collectionsRefs: res.collectionRefs,
              collections: res.collections,
              description: res.description,
              brandRef: res.brandRef,
              brand: { name: res.brand.name },
              taxRef: res.taxRef,
              tax: { percentage: res.tax.percentage },
              status: res.status,
              source: "server",
              enabledBatching: res.batching,
              bestSeller: res.bestSeller,
              channels: res.channel,
              selfOrdering: res.selfOrdering,
              onlineOrdering: res.onlineOrdering,
              variants: [variantData],
              otherVariants: [],
              boxes: [],
              otherBoxes: [],
              nutritionalInformation: res.nutritionalInformation,
              modifiers: res.modifiers,
              sortOrder: 0,
              sku: [values.sku],
              code: [values?.code || ""],
              boxRefs: [],
              crateRefs: [],
            };

            handleAddProduct(productData);
            showToast("success", t("Product Added Successfully"));
          }
        } catch (error: any) {
          if (error?.code === "sku_exists") {
            showToast("error", t("SKU already exist"));
          } else {
            showToast("error", error?.code || error?.messaage);
          }
        }
      },
      validationSchema: Yup.object().shape({
        en_name: Yup.string().required(t("Product Name is required")),
        ar_name: Yup.string().required(t("Product Name in Arabic is required")),
        contains: Yup.string().when("isRestaurant", {
          is: true,
          then: Yup.string().required(t("Please Select Contains")),
          otherwise: Yup.string().optional(),
        }),
        category: Yup.object().when("isRestaurant", {
          is: true,
          then: Yup.object({
            value: Yup.string().required(t("Please Select Reporting Category")),
            key: Yup.string().required(t("Please Select Reporting Category")),
          })
            .required(t("Please Select Reporting Category"))
            .nullable(),
          otherwise: Yup.object({
            value: Yup.string().required(t("Please Select Product Category")),
            key: Yup.string().required(t("Please Select Product Category")),
          })
            .required(t("Please Product Select Category"))
            .nullable(),
        }),
        channels: Yup.array()
          .required(t("Please select channels"))
          .min(1, t("At least one channel should be selected"))
          .nullable(),
      }),
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

  useMemo(() => {
    if (visible) {
      formik.resetForm();
      setOpenCategory(false);
      setSkuGenerated(false);

      const channel = businessDetails?.location?.channel?.map((type: any) => {
        return {
          label: ChannelsName[type.name] || type.name,
          value: type.name,
        };
      });

      setChannels(channel);

      formik.setFieldValue(
        "isRestaurant",
        businessDetails?.company?.industry?.toLowerCase() === "restaurant"
      );

      formik.setFieldValue(
        "channels",
        businessDetails?.location?.channel?.map((type: any) => {
          return type.name;
        })
      );

      if (businessDetails) {
        formik.setFieldValue("tax", {
          value: businessDetails.company.vat.percentage,
          key: businessDetails.company.vat.vatRef,
        });
      }
    }
  }, [visible, businessDetails]);

  const mainContainerStyle = useMemo(() => {
    return {
      ...styles.container,
      backgroundColor: theme.colors.transparentBg,
    };
  }, []);

  const containerStyle = useMemo(() => {
    return {
      ...styles.container,
      marginHorizontal: twoPaneView ? "20%" : "0%",
      backgroundColor: theme.colors.bgColor,
    };
  }, []);

  const channelsOpt = useMemo(() => {
    return formik.values.channels?.length > 0 ? (
      <ScrollView
        horizontal
        contentContainerStyle={{
          width: "95%",
          display: "flex",
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
        }}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {(channels?.length === formik.values.channels?.length
          ? ["all"]
          : formik.values.channels
        )?.map((channel: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                marginRight: 10,
                borderRadius: 50,
                paddingVertical: 6,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E9EC",
              }}
            >
              <DefaultText fontSize="md" fontWeight="medium">
                {channel === "all" ? "All" : ChannelsName[channel] || channel}
              </DefaultText>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  handleChannels(channel);
                }}
              >
                <ICONS.CloseCircleIcon />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    ) : (
      <DefaultText fontWeight="normal" color={theme.colors.placeholder}>
        {t("Select Channels")}
      </DefaultText>
    );
  }, [formik.values.channels, formik.values.isRestaurant, channels]);

  const handleChannels = (val: string) => {
    if (formik.values.channels.includes(val)) {
      const names = formik.values.channels.filter((channel) => channel !== val);
      formik.setFieldValue("channels", names);
    } else {
      formik.setFieldValue("channels", [...formik.values.channels, val]);
    }
  };

  const renderSheet = useMemo(
    () => (
      <>
        {openCategory && (
          <AddEditCategoryModal
            visible={openCategory}
            handleClose={() => {
              setOpenCategory(false);
            }}
          />
        )}
      </>
    ),
    [openCategory]
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View style={mainContainerStyle}>
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
            title={t("Add new product")}
            rightBtnText={t("Add")}
            handleLeftBtn={handleClose}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.handleSubmit();
            }}
            permission={authContext.permission["pos:product"]?.create}
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={Keyboard.dismiss}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <Input
                style={{ width: "100%" }}
                label={`${t("PRODUCT NAME")} *`}
                autoCapitalize="words"
                maxLength={60}
                placeholderText={t("Enter the product name")}
                values={formik.values.en_name}
                handleChange={(val: any) =>
                  formik.setFieldValue("en_name", val)
                }
              />
              <ErrorText
                errors={
                  (formik.errors.en_name && formik.touched.en_name) as Boolean
                }
                title={formik.errors.en_name || ""}
              />

              <Spacer space={hp("2.5%")} />

              <Input
                style={{ width: "100%" }}
                label={`${t("PRODUCT NAME IN ARABIC")} *`}
                autoCapitalize="words"
                maxLength={60}
                placeholderText={t("Enter the product name")}
                values={formik.values.ar_name}
                handleChange={(val: any) =>
                  formik.setFieldValue("ar_name", val)
                }
              />
              <ErrorText
                errors={
                  (formik.errors.ar_name && formik.touched.ar_name) as Boolean
                }
                title={formik.errors.ar_name || ""}
              />

              {formik.values.isRestaurant && (
                <View>
                  <Spacer space={hp("3.5%")} />

                  <SelectInput
                    label={`${t("CONTAINS")} *`}
                    placeholderText={t("Select Contains")}
                    options={ContainsOptions}
                    allowSearch={false}
                    values={{
                      key: formik.values.contains,
                      value: ContainsName[formik.values.contains],
                    }}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue("formChanged", true);
                        formik.setFieldValue("contains", val.key);
                      }
                    }}
                    containerStyle={{ borderWidth: 0 }}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.contains &&
                        formik.touched.contains) as Boolean
                    }
                    title={formik.errors.contains || ""}
                  />
                </View>
              )}

              <Spacer space={hp("3.5%")} />

              <View style={styles.labelTextView}>
                <Label>
                  {`${
                    formik.values.isRestaurant
                      ? t("REPORTING CATEGORY")
                      : t("PRODUCT CATEGORY")
                  } *`}
                </Label>

                <TouchableOpacity
                  style={{ marginRight: hp("1.5%") }}
                  onPress={() => {
                    setCallCatAPi(false);
                    setOpenCategory(true);
                  }}
                >
                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {t("ADD NEW")}
                  </DefaultText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  ...styles.drop_down_view,
                  height: hp("7.5%"),
                  borderRadius: 16,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  categorySelectInputRef.current.open();
                }}
              >
                <DefaultText
                  fontWeight="normal"
                  color={
                    formik.values.category.key
                      ? theme.colors.otherGrey[100]
                      : theme.colors.placeholder
                  }
                >
                  {formik.values.category.key
                    ? formik.values.category.value
                    : t("Select Product Category")}
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
              </TouchableOpacity>
              <ErrorText
                errors={
                  (formik.errors.category?.value &&
                    formik.touched.category?.value) as Boolean
                }
                title={formik.errors.category?.value || ""}
              />

              <Spacer space={hp("3.75%")} />

              <View>
                <TouchableOpacity
                  style={{
                    ...styles.drop_down_view,
                    height: hp("7.5%"),
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    backgroundColor: theme.colors.white[1000],
                  }}
                  onPress={() => {
                    brandSelectInputRef.current.open();
                  }}
                >
                  <DefaultText
                    style={{ maxWidth: "40%" }}
                    fontWeight="normal"
                    color={theme.colors.text.primary}
                  >
                    {`${t("Brand")} *`}
                  </DefaultText>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText
                      fontWeight="normal"
                      color={
                        formik.values.brand.key
                          ? theme.colors.otherGrey[100]
                          : theme.colors.placeholder
                      }
                      style={{ marginRight: hp("2%") }}
                    >
                      {formik.values.brand.key
                        ? formik.values.brand.value
                        : t("Select Brand")}
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
                    ...styles.batchView,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText>{t("Batching")}</DefaultText>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip infoMsg={t("Please update batching from web")} />
                    </View>
                  </View>

                  <Switch
                    style={{
                      opacity: authContext.permission["pos:product"]?.batching
                        ? 1
                        : 0.5,
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
                      formik.setFieldValue("enabledBatching", val);
                    }}
                    value={formik.values.enabledBatching}
                    disabled={!authContext.permission["pos:product"]?.batching}
                  />
                </View>
              </View>

              <Spacer space={hp("4.25%")} />

              <View style={styles.labelTextView}>
                <Label>{t("DETAILS")}</Label>

                {isConnected && !skuGenerated && (
                  <TouchableOpacity
                    style={{
                      marginBottom: 6,
                      marginRight: hp("1.5%"),
                    }}
                    onPress={getUniqueSKU}
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
              </View>

              <View>
                <View
                  style={{
                    ...styles.skuView,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <DefaultText fontWeight="normal">{`${t(
                    "SKU"
                  )} *`}</DefaultText>

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
                      formik.setFieldValue("sku", val?.trim());
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
                    ...styles.priceView,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText fontWeight="normal">
                      {`${t("Cost Price")} (${t("in")} ${currency})`}
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
                    ...styles.priceView,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <DefaultText fontWeight="normal">{`${t("Selling Price")} (${t(
                    "in"
                  )} ${currency})`}</DefaultText>

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
              </View>

              <Spacer space={hp("4.75%")} />

              <Label>{`${t("CHANNELS")} *`}</Label>

              <TouchableOpacity
                style={{
                  ...styles.collection_view,
                  paddingVertical: formik.values.channels?.length > 0 ? 13 : 19,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  channelsSelectInputRef.current.open();
                }}
              >
                {channelsOpt}

                <View
                  style={{
                    right: 0,
                    paddingLeft: 4,
                    paddingRight: 16,
                    position: "absolute",
                    transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
              <ErrorText
                errors={
                  (formik.errors.channels && formik.touched.channels) as Boolean
                }
                title={formik.errors.channels as any}
              />

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <CategorySelectInput
        callApi={callCatApi}
        sheetRef={categorySelectInputRef}
        values={formik.values.category}
        reportingCategory={formik.values.isRestaurant}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("category", val);
            categorySelectInputRef.current.close();
          }
        }}
      />

      <ChannelsSelectInput
        sheetRef={channelsSelectInputRef}
        selectedIds={formik.values.channels}
        channelOptions={channels}
        handleSelected={(channels: string[]) => {
          if (channels?.length > 0) {
            formik.setFieldValue("channels", channels);
          } else {
            formik.setFieldValue("channels", []);
          }

          channelsSelectInputRef.current.close();
        }}
      />

      <BrandSelectInput
        sheetRef={brandSelectInputRef}
        values={formik.values.brand}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("brand", val);
            brandSelectInputRef.current.close();
          }
        }}
      />

      {renderSheet}

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  labelTextView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drop_down_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  collection_view: {
    width: "100%",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  batchView: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
