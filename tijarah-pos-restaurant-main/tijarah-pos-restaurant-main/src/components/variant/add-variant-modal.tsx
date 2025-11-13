import { FormikProps, useFormik } from "formik";
import {
  default as React,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import repository from "../../db/repository";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { useSubscription } from "../../store/subscription-store";
import { UNIT_OPTIONS } from "../../utils/constants";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import TabButton from "../buttons/tab-button";
import showToast from "../toast";
import BoxesPackVariant from "./boxes-packs";
import VariantDetails from "./details";
import StockVariant from "./stock";

type AddVariantProps = {
  _id: string;
  type: string;
  en_name: string;
  ar_name: string;
  variantPic: string;
  sku: string;
  code: string;
  unit: { value: string; key: string };
  locationRefs: string[];
  locations: string[];
  costPrice: string;
  price: string;
  prices: [];
  status: string;
  stockCount: string;
  expiry: Date;
  enabledAvailability: boolean;
  enabledTracking: boolean;
  enabledLowStockAlert: boolean;
  lowStockCount: string;
  boxes: any[];
  actions: any[];
  stockUpdate: boolean;
  hasMultipleVariants: boolean;
};

export default function AddEditVariantModal({
  data,
  visible = false,
  handleClose,
  handleAdd,
  handleUpdateBoxes,
  handleUpdateActions,
  handleDelete,
  productId,
  isEditing,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleAdd?: any;
  handleUpdateBoxes?: any;
  handleUpdateActions?: any;
  handleDelete?: any;
  productId?: any;
  isEditing?: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const authContext = useContext(AuthContext);
  const { hasPermission } = useSubscription();

  const { twoPaneView } = useResponsive();

  const [activeTab, setActiveTab] = useState(0);
  const [skuGenerated, setSkuGenerated] = useState(false);

  const formik: FormikProps<AddVariantProps> = useFormik<AddVariantProps>({
    initialValues: {
      _id: "",
      type: "multiple",
      en_name: "",
      ar_name: "",
      variantPic: "",
      sku: "",
      code: "",
      unit: { value: "", key: "" },
      locationRefs: [],
      locations: [],
      costPrice: "",
      price: "",
      prices: [],
      status: "active",
      stockCount: "",
      expiry: undefined as any,
      enabledAvailability: true,
      enabledTracking: false,
      enabledLowStockAlert: false,
      lowStockCount: "",
      boxes: [],
      actions: [],
      stockUpdate: false,
      hasMultipleVariants: false,
    },

    onSubmit: async (values) => {
      if (values.sku == "") {
        setActiveTab(0);
        showToast("error", t("Enter SKU"));
        return;
      } else if (values.sku.length < 3) {
        setActiveTab(0);
        showToast("error", t("SKU must be at least 8 characters"));
        return;
      } else if (!/^[0-9]+$/.test(values.sku)) {
        setActiveTab(0);
        showToast("error", t("SKU must contain only umeric values"));
        return;
      } else if (data.variant?.sku !== values.sku) {
        let skuExistInDB = false;
        const skuExistInLocal = data.sku.includes(values.sku);

        if (!skuExistInLocal) {
          const skuProd = await repository.productRepository.findBySku(
            values.sku
          );

          skuExistInDB = !!skuProd;
        }

        if (skuExistInLocal || skuExistInDB) {
          setActiveTab(0);
          showToast("error", t("SKU already exist"));
          return;
        }
      }

      if (values.code !== "" && !/^[A-Za-z0-9]+$/.test(values.code)) {
        setActiveTab(0);
        showToast("error", t("Code must contain only numeric values"));
        return;
      }

      if (values.unit.key == "") {
        setActiveTab(0);
        showToast("error", t("Please Select Unit"));
        return;
      }

      if (
        data?.productId &&
        !data?.variant?._id &&
        values.enabledTracking &&
        values.stockCount === ""
      ) {
        setActiveTab(1);
        showToast("error", t("Enter stock count"));
        return;
      }

      // if (
      //   data?.productId &&
      //   data.enabledBatching &&
      //   values.enabledTracking &&
      //   !values.expiry
      // ) {
      //   setActiveTab(1);
      //   showToast("error", t("Please select expiry date"));
      //   return;
      // }

      if (values.enabledLowStockAlert && !values.lowStockCount) {
        setActiveTab(1);
        showToast("error", t("Enter low stock count"));
        return;
      }

      const businessDetails: any = await repository.business.findByLocationId(
        authContext.user.locationRef
      );

      const dataObj = {
        _id: data.variant?._id || "",
        parentSku: data.variant?.parentSku || "",
        parentName: data.variant?.parentName,
        type: data.variant ? data.variant.type : "item",
        assignedToAll: data.variant ? data.variant.assignedToAll : false,
        en_name: values.en_name.trim(),
        ar_name: values.ar_name.trim(),
        image: data.variant?.image || "",
        variantPic: values.variantPic,
        sku: values.sku,
        code: values.code,
        unit: values.unit.key,
        noOfUnits: data.variant?.noOfUnits || 1,
        costPrice: Number(values.costPrice) > 0 ? `${values.costPrice}` : "",
        price: data.variant ? data.variant.price : values.price,
        originalPrice: data.variant ? data.variant.originalPrice : values.price,
        nonSaleable: data.variant?.nonSaleable || false,
        locationRefs: data.variant
          ? data.variant.locationRefs
          : [businessDetails.location._id],
        locations: data.variant
          ? data.variant.locations?.map((loc: any) => {
              return { name: loc.name };
            })
          : [{ name: businessDetails.location.name.en }],
        prices: [
          {
            costPrice:
              Number(values.costPrice) > 0 ? `${values.costPrice}` : "",
            price: Number(values.price) > 0 ? `${values.price}` : "",
            locationRef: businessDetails.location._id,
            location: { name: businessDetails.location.name.en },
          },
        ],
        otherPrices: data.variant?.otherPrices || [],
        stocks: [
          {
            enabledAvailability: values.enabledAvailability,
            enabledTracking: values.enabledTracking,
            stockCount:
              values.actions?.length > 0
                ? Number(values.actions[0].count)
                : values.stockCount
                ? Number(values.stockCount)
                : null,
            enabledLowStockAlert: values.enabledLowStockAlert,
            lowStockCount: Number(values.lowStockCount || 0),
            locationRef: businessDetails.location._id,
            location: { name: businessDetails.location.name.en },
          },
        ],
        otherStocks: data.variant?.otherStocks || [],
        status: values.status,
      };

      if (
        data?.productId &&
        !data?.variant?._id &&
        data.enabledBatching &&
        values.enabledTracking
      ) {
        const actionData = {
          productRef: data.productId,
          product: {
            name: { en: data.productName.en, ar: data.productName.ar },
          },
          companyRef: businessDetails.location.companyRef,
          company: { name: businessDetails.company.name.en },
          locationRef: businessDetails.location._id,
          location: { name: businessDetails.location.name.en },
          vendorRef: "",
          vendor: { name: "" },
          variant: {
            name: { en: values.en_name, ar: values.ar_name },
            type: "item",
            unit: 1,
            qty: Number(values.stockCount),
            sku: values.sku,
            costPrice: Number(values.costPrice) || 0,
            sellingPrice: Number(values.price) || 0,
          },
          sku: values.sku,
          batching: data.enabledBatching,
          hasMultipleVariants: values.hasMultipleVariants,
          action: "received",
          expiry: values.expiry,
          price: values.costPrice || 0,
          count: Number(values.stockCount || 0),
          sourceRef: "",
          destRef: businessDetails.location._id,
          available: Number(values.stockCount || 0),
          received: Number(values.stockCount || 0),
          transfer: 0,
          availableSource: 0,
          receivedSource: 0,
          transferSource: 0,
          prevValue: 0,
          previousStockCount: 0,
        };

        formik.values.actions.push({ ...actionData });
      }

      handleUpdateBoxes([...values.boxes]);
      handleUpdateActions([...values.actions]);
      handleAdd({
        ...dataObj,
        stockUpdate: values.stockUpdate,
      });

      showToast(
        "success",
        data.variant
          ? t("Variant Updated Successfully")
          : t("Variant Added Successfully")
      );
    },

    validationSchema: Yup.object().shape({
      en_name: Yup.string().when("type", {
        is: "single",
        then: Yup.string().optional(),
        otherwise: Yup.string().required(t("Variant Name is required")),
      }),
      ar_name: Yup.string().when("type", {
        is: "single",
        then: Yup.string().optional(),
        otherwise: Yup.string().required(
          t("Variant Name in Arabic is required")
        ),
      }),
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

  useEffect(() => {
    if (visible) {
      formik.resetForm();

      if (data.selectedTab === 1) {
        setActiveTab(1);
      }

      if (data.variant) {
        setSkuGenerated(true);

        const unitData: any = UNIT_OPTIONS.find(
          (unit: any) => unit?.key == data?.variant?.unit
        );

        const stocks = data.variant?.stocks?.[0];

        formik.setValues({
          _id: data.variant?._id || "",
          type: data?.type || "multiple",
          en_name: data.variant.en_name,
          ar_name: data.variant.ar_name,
          variantPic: data.variant.image,
          sku: data.variant.sku,
          code:
            data.variant?.code && data.variant?.code !== "undefined"
              ? data.variant.code
              : "",
          unit: { value: unitData?.value || "", key: unitData?.key || "" },
          locationRefs: data.variant.locationRefs,
          locations: data.variant.locations,
          costPrice: data.variant.prices?.[0]?.costPrice
            ? Number(data.variant.prices[0].costPrice)?.toFixed(2)
            : "",
          price: data.variant.prices[0]?.price
            ? Number(data.variant.prices[0].price)?.toFixed(2)
            : "",
          prices: data.variant.prices,
          status: data.variant.status,
          enabledAvailability: stocks ? stocks?.enabledAvailability : true,
          enabledTracking: stocks ? stocks?.enabledTracking : false,
          stockCount: stocks ? stocks?.stockCount || "" : "",
          expiry: undefined as any,
          enabledLowStockAlert: stocks ? stocks?.enabledLowStockAlert : false,
          lowStockCount: stocks ? stocks.lowStockCount : "",
          boxes: data?.boxes || [],
          actions: data?.actions || [],
          stockUpdate: false,
          hasMultipleVariants: data?.hasMultipleVariants,
        });
      } else {
        setSkuGenerated(false);
        formik.setFieldValue("boxes", data?.boxes || []);
        formik.setFieldValue("actions", data?.actions || []);
        formik.setFieldValue("type", data?.type || "multiple");
        formik.setFieldValue("hasMultipleVariants", data?.hasMultipleVariants);
      }
    }
  }, [visible]);

  const changeTab = useCallback(
    (tab: any) => {
      if (!isConnected && tab !== 0) {
        showToast("info", t("Please connect with internet"));
        return;
      }

      if (tab === 1 && !hasPermission("inventory")) {
        showToast("error", t("You don't have permission to view this screen"));
        return;
      }

      setActiveTab(tab);
    },
    [hasPermission]
  );

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
            title={data.variant ? data.title : t("Variant & Price Details")}
            rightBtnText={t("Done")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.setFieldValue("stockUpdate", false);
              formik.handleSubmit();

              if (!formik.values.en_name || !formik.values.ar_name) {
                setActiveTab(0);
              }
            }}
            permission={
              data.variant
                ? authContext.permission["pos:product"]?.update
                : authContext.permission["pos:product"]?.create
            }
          />

          <TabButton
            tabs={[t("Details"), t("Stock")]}
            activeTab={activeTab}
            onChange={changeTab}
          />

          {activeTab === 0 && (
            <VariantDetails
              formik={formik}
              isEditing={isEditing}
              productId={productId}
              type={data.type}
              skuGenerated={skuGenerated}
              handleDelete={handleDelete}
              handleGenerateSKU={getUniqueSKU}
            />
          )}

          {activeTab === 1 && (
            <StockVariant
              formik={formik}
              productId={productId}
              variantId={data.variant?._id}
              productName={data.productName}
              enabledBatching={data.enabledBatching}
              handleStockUpdate={() => {
                if (!isConnected) {
                  showToast("info", t("Please connect with internet"));
                  return;
                }
                formik.setFieldValue("stockUpdate", true);
                formik.handleSubmit();
              }}
            />
          )}

          {activeTab === 2 && (
            <BoxesPackVariant
              sku={data.sku}
              formik={formik}
              productName={data.productName}
              handleAddTap={() => setActiveTab(0)}
            />
          )}
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
});
