import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import { checkInternet } from "../../../hooks/check-internet";
import { checkKeyboardState } from "../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import SelectInput from "../../input/select-input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import Label from "../../text/label";
import showToast from "../../toast";
import StockBatchUpdate from "./stock-action/stock-batch-update";
import StockReceivedUpdate from "./stock-action/stock-received-update";
import StockReduceRecountUpdate from "./stock-action/stock-reduce-recount-update";
import {
  STOCK_ACTION,
  StockActionModalProps,
  StockActionProps,
  stockActionOptions,
  stockActionOptionsWithBatch,
} from "./stock-action/types";
import UpdatedStockOnHand from "./stock-action/updated-stock-on-hand";

const initialValues = {
  previousStock: 0,
  stockAction: { value: "", key: "" },
  receivingItem: {},
  quantity: "",
  vendor: { value: "", key: "" },
  totalCost: "",
  expiry: undefined as any,
  stockCount: "",
  fromBatch: {},
  toBatch: {},
  receivedStock: 0,
};

export default function StockAction({
  data,
  visible = false,
  handleClose,
  handleUpdated,
}: StockActionModalProps) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();
  const context = useContext(DeviceContext) as any;
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext(AuthContext);

  const [batchList, setBatchList] = useState<any>([]);

  const formik: FormikProps<StockActionProps> = useFormik<StockActionProps>({
    initialValues,
    validationSchema: Yup.object().shape({}),

    onSubmit: async (values) => {
      if (!values.stockAction.key) {
        showToast("error", t("Please select stock action"));
        return;
      }

      const batchShiftAction =
        values.stockAction.key === STOCK_ACTION.BATCH_SHIFT;
      const addStockAction =
        values.stockAction.key === STOCK_ACTION.STOCK_RECEIVED;
      const recountStockAction =
        values.stockAction.key === STOCK_ACTION.INVENTORY_RECOUNT;
      const reduceStockAction =
        values.stockAction.key === STOCK_ACTION.DAMAGED ||
        values.stockAction.key === STOCK_ACTION.THEFT ||
        values.stockAction.key === STOCK_ACTION.LOSS;

      console.log("LOGGIN", values.expiry);

      if (addStockAction) {
        if (!values.receivingItem?._id) {
          showToast("error", t("Please select receiving item SKU"));
          return;
        }

        if (!values.quantity) {
          showToast("error", t("Enter receiving SKU quantity"));
          return;
        } else if (Number(values.quantity) === 0) {
          showToast("error", t("Receiving quantity must be greater than 0"));
          return;
        }

        if (!values.vendor.key) {
          showToast("error", t("Please select vendor"));
          return;
        }

        if (!values.totalCost) {
          showToast("error", t("Enter total cost of receiving SKU"));
          return;
        } else if (Number(values.totalCost) === 0) {
          showToast("error", t("Total cost must be greater than 0"));
          return;
        }

        // if (!values.expiry && data.enabledBatching) {
        //   showToast("error", t("Please select expiry date"));
        //   return;
        // }
      } else if (batchShiftAction) {
        if (!values.stockCount) {
          showToast("error", t("Enter stock count"));
          return;
        } else if (Number(values.stockCount) === 0) {
          showToast("error", t("Stock count must be greater than 0"));
          return;
        }

        if (!data.enabledBatching) {
          showToast(
            "error",
            t("Please enable batching from product to batch shift")
          );
          return;
        }

        if (!values.fromBatch?._id) {
          showToast("error", t("Please select from batch"));
          return;
        }

        if (!values.toBatch?._id) {
          showToast("error", t("Please select to batch"));
          return;
        }

        if (Number(values.stockCount) > Number(values.fromBatch?.available)) {
          showToast(
            "error",
            `${t("Stock shift count should be less than")} ${
              values.fromBatch?.available + 1
            }`
          );
          return;
        }
      } else if (recountStockAction || reduceStockAction) {
        if (!values.stockCount) {
          showToast("error", t("Enter stock count"));
          return;
        } else if (Number(values.stockCount) === 0 && reduceStockAction) {
          showToast("error", t("Stock count must be greater than 0"));
          return;
        } else if (
          Number(values.stockCount) > Number(values.fromBatch?.available) &&
          reduceStockAction
        ) {
          showToast(
            "error",
            `${t("Stock shift count should be less than")} ${
              values.fromBatch?.available + 1
            }`
          );
          return;
        }

        if (!values.fromBatch?._id && data.enabledBatching) {
          showToast("error", t("Select batch expiry date"));
          return;
        }
      }

      const businessDetails: any = await repository.business.findByLocationId(
        context.user.locationRef
      );

      let totalStockCount,
        sourceRef,
        destRef,
        totalReceived,
        totalTransfer,
        totalStockCountSource,
        totalReceivedSource,
        totalTransferSource,
        prevValue,
        availableCount,
        updatedCost;

      if (addStockAction) {
        totalStockCount = values.previousStock + values.receivedStock;
        prevValue = values.previousStock;
        totalReceived = values.receivedStock;
        availableCount = values.receivedStock;
        totalTransfer = 0;
        updatedCost = Number(values.totalCost || 0);
      } else if (reduceStockAction) {
        destRef = data.enabledBatching ? values.fromBatch._id : "";
        totalStockCount = values.previousStock - Number(values.stockCount || 0);
        prevValue = values.previousStock;
        availableCount =
          Number(values.fromBatch.available || 0) -
          Number(values.stockCount || 0);
        totalReceived = Number(values.fromBatch.received || 0);
        updatedCost =
          Number(values.stockCount || 0) *
          Number(data.variantFormik?.costPrice || 0);
      } else if (batchShiftAction) {
        sourceRef = values.fromBatch._id;
        destRef = values.toBatch._id;
        totalStockCount = 0;
        prevValue = 0;
        updatedCost =
          Number(values.stockCount || 0) *
          Number(data.variantFormik?.costPrice || 0);
        totalTransfer =
          Number(values.toBatch.transfer || 0) + Number(values.stockCount || 0);
        totalReceived = Number(values.toBatch.received || 0);
        totalReceivedSource = Number(values.fromBatch.received || 0);
        availableCount =
          Number(values.toBatch.available || 0) +
          Number(values.stockCount || 0);
        totalStockCountSource =
          Number(values.fromBatch.available || 0) -
          Number(values.stockCount || 0);
        totalTransferSource =
          Number(values.fromBatch.transfer || 0) -
          Number(values.stockCount || 0);
      } else {
        destRef = data.enabledBatching ? values.fromBatch._id : "";
        totalStockCount = data.enabledBatching
          ? values.previousStock -
            Number(values.fromBatch.available || 0) +
            Number(values.stockCount || 0)
          : Number(values.stockCount || 0);
        prevValue = values.previousStock;
        availableCount = Number(values.stockCount || 0);
        totalReceived = Number(values.fromBatch.received || 0);
        updatedCost =
          Number(values.stockCount || 0) *
          Number(data.variantFormik?.costPrice || 0);
      }

      const dataObj = {
        productRef: data.productId,
        product: { name: { en: data.productName.en, ar: data.productName.ar } },
        companyRef: businessDetails.location.companyRef,
        company: { name: businessDetails.company.name.en },
        locationRef: businessDetails.location._id,
        location: { name: businessDetails.location.name.en },
        vendorRef: values.vendor.key,
        vendor: { name: values.vendor.value },
        variant: {
          name: {
            en: data.variantFormik.en_name,
            ar: data.variantFormik.ar_name,
          },
          type: values.receivingItem?.type || "item",
          unit: values.receivingItem?.units || 1,
          qty:
            Number(values.quantity || values.stockCount || 0) *
            Number(values.receivingItem?.units || 1),
          sku: data.variantFormik.sku,
          costPrice: Number(
            (
              (values.receivingItem?.costPrice
                ? values.receivingItem?.costPrice || 0
                : data.variantFormik?.costPrice || 0) /
              (Number(values.quantity || 1) *
                Number(values.receivingItem?.units || 1))
            )?.toFixed(2)
          ),
          sellingPrice: values.receivingItem?.sellingPrice
            ? Number(values.receivingItem?.sellingPrice || 0)
            : Number(data.variantFormik?.price || 0),
        },
        sku: values.receivingItem?.sku || data.variantFormik.sku,
        batching: data.enabledBatching,
        hasMultipleVariants: data.variantFormik.hasMultipleVariants,
        action: values.stockAction.key,
        expiry: values.expiry,
        price: Number(
          (
            Number(updatedCost || 0) /
            (Number(values.quantity || values.stockCount || 1) *
              Number(values.receivingItem?.units || 1))
          )?.toFixed(2)
        ),
        count: totalStockCount,
        sourceRef: sourceRef,
        destRef: destRef,
        received: totalReceived,
        available: availableCount,
        transfer: totalTransfer,
        availableSource: totalStockCountSource,
        transferSource: totalTransferSource,
        receivedSource: totalReceivedSource,
        prevValue: prevValue,
        previousStockCount: prevValue,
      };

      formik.resetForm();
      handleUpdated(dataObj);

      showToast("success", t("Stock Action Updated"));
    },
  });

  useEffect(() => {
    if (visible) {
      formik.resetForm();

      setBatchList([]);

      if (data) {
        formik.setFieldValue(
          "previousStock",
          Number(data.variantFormik?.stockCount || 0)
        );

        repository.batchRepository
          .findBySKU(data.variantFormik.sku)
          .then((res) => {
            console.log("BATCH LIST", res);
            setBatchList(res);
          });
      }
    }
  }, [visible]);

  const clearOtherFormikValues = (action: string) => {
    if (action === STOCK_ACTION.STOCK_RECEIVED) {
      formik.setFieldValue("quantity", "");
      formik.setFieldValue("vendor", { value: "", key: "" });
      formik.setFieldValue("totalCost", "");
      formik.setFieldValue("expiry", undefined as any);
      formik.setFieldValue("receivedStock", 0);
    } else {
      formik.setFieldValue("stockCount", "");
      formik.setFieldValue("fromBatch", {});
      formik.setFieldValue("toBatch", {});
    }
  };

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
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            isClose={false}
            title={t("Stock Action")}
            rightBtnText={t("Update")}
            handleLeftBtn={() => {
              formik.resetForm();
              handleClose();
            }}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.handleSubmit();
            }}
            permission={authContext.permission["pos:product"]?.update}
          />

          <View>
            <KeyboardAvoidingView enabled={true}>
              <ScrollView
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: hp("3%"),
                  paddingHorizontal: hp("2.5%"),
                  marginTop: isKeyboardVisible ? "-7.5%" : "0%",
                }}
              >
                <Label>{t("UPDATE STOCK")}</Label>

                <View
                  style={{
                    ...styles.itemView,
                    backgroundColor: theme.colors.white[1000],
                  }}
                >
                  <DefaultText fontWeight="normal">
                    {t("Item Name")}
                  </DefaultText>

                  <DefaultText
                    style={{
                      width: "80%",
                      paddingRight: twoPaneView ? hp("0%") : hp("1.5%"),
                      textAlign: "right",
                    }}
                    color={theme.colors.otherGrey[200]}
                  >
                    {`${data.productName?.en} - ${data.variantFormik.en_name}`}
                  </DefaultText>
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
                    borderBottomLeftRadius:
                      formik.values.stockAction.key === "" ? 16 : 0,
                    borderBottomRightRadius:
                      formik.values.stockAction.key === "" ? 16 : 0,
                  }}
                  clearValues={formik.values.stockAction.key == ""}
                  isTwoText={true}
                  allowSearch={false}
                  leftText={`${t("Stock Action")} *`}
                  placeholderText={t("Select stock action")}
                  options={
                    data.enabledBatching
                      ? stockActionOptionsWithBatch
                      : stockActionOptions
                  }
                  values={formik.values.stockAction}
                  handleChange={(val: any) => {
                    if (val.key && val.value) {
                      formik.setFieldValue("stockAction", val);
                      clearOtherFormikValues(val.value);
                    }
                  }}
                />

                <StockReceivedUpdate formik={formik} data={data} />

                <StockBatchUpdate formik={formik} batchList={batchList} />

                <StockReduceRecountUpdate
                  formik={formik}
                  data={data}
                  batchList={batchList}
                />

                <UpdatedStockOnHand
                  data={formik.values}
                  enabledBatching={data.enabledBatching}
                />

                <Spacer space={hp("15%")} />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
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
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  itemView: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
