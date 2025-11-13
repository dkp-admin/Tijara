import * as ExpoPrintHelp from "expo-print-help";
import React, { useContext, useMemo, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import usePrinterStatus from "../../../../hooks/use-printer-status";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCommonApis from "../../../../hooks/useCommonApis";
import { AuthType } from "../../../../types/auth-types";
import ICONS from "../../../../utils/icons";
import { printSunmi4Inch } from "../../../../utils/printSunmi3inch";
import { transformOrderData } from "../../../../utils/transform-order-data";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../../buttons/primary-button";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import SendReceiptModal from "../../send-receipt/send-receipt";
import repository from "../../../../db/repository";
import { useCurrency } from "../../../../store/get-currency";

export const getOrderDataObj = (data: any) => {
  const itemList = data.items.map((item: any) => {
    return {
      isOpenPrice: false,
      productRef: item.productRef || "",
      categoryRef: item.categoryRef || "",
      category: { name: item?.category?.name || "" },
      name: {
        en: item.name.en || "",
        ar: item.name.ar || "",
      },
      image: item?.image,
      contains: item?.contains,
      promotionsData: item?.promotionsData || [],
      variantNameEn: item.variant.name.en,
      variantNameAr: item.variant.name.ar,
      type: item.variant.type || "item",
      sku: item.variant.sku,
      parentSku: item.variant.parentSku,
      boxSku: item.variant.boxSku,
      crateSku: item.variant.crateSku,
      boxRef: item.variant.boxRef,
      crateRef: item.variant.crateRef,
      isFree: item?.isFree,
      isQtyFree: item?.isQtyFree,
      discountedTotal: item.billing?.discountedTotal || 0,
      discountedVat: item.billing?.discountedVat || 0,
      sellingPrice: item.billing.subTotal,
      total: item.billing.total,
      amountBeforeVoidComp: item.billing?.amountBeforeVoidComp || 0,
      qty: item.quantity,
      hasMultipleVariants: item.hasMultipleVariants,
      vat: item.billing.vatAmount,
      vatPercentage: item.billing.vatPercentage,
      discount: item.billing.discountAmount,
      discountPercentage: item.billing.discountPercentage,
      promotionPercentage: item.billing?.promotionPercentage || 0,
      unit: item.variant.unit,
      costPrice: item.variant.costPrice,
      noOfUnits: item.variant.unitCount,
      void: item?.void,
      voidRef: item?.voidRef,
      voidReason: item?.voidReason,
      comp: item?.comp,
      compRef: item?.compRef,
      compReason: item?.compReason,
      kitchenName: item?.kitchenName,
      kotId: item?.kotId,
      sentToKotAt: item?.sentToKotAt,
      modifiers: item?.modifiers || [],
      availability: item?.variant?.stock?.availability || true,
      stockCount: item?.variant?.stock?.count || 0,
      tracking: item?.variant?.stock?.tracking || false,
      note: item.note || "",
      refundedQty: 0,
    };
  });

  const dataObj = {
    _id: data._id,
    company: { name: data.company.name },
    companyRef: data.companyRef,
    location: { name: data.location.name },
    locationRef: data.locationRef,
    customer: {
      name: data?.customer?.name || "",
      vat: data?.customer?.vat || "",
      phone: data?.customer?.phone || "",
    },
    customerRef: data.customerRef || "",
    cashier: { name: data.cashier.name },
    cashierRef: data.cashierRef,
    device: { deviceCode: data.device.deviceCode },
    deviceRef: data.deviceRef,
    orderNum: data.orderNum,
    orderType: data?.orderType || "",
    tokenNum: data?.tokenNumber || "",
    items: itemList,
    payment: {
      total: data.payment.total,
      subTotal: data.payment.subTotal,
      vat: data.payment.vatAmount,
      subTotalWithoutDiscount: data.payment.subTotalWithoutDiscount,
      vatWithoutDiscount: data.payment.vatWithoutDiscount,
      vatPercentage: data.payment.vatPercentage,
      discountCode: data.payment.discountCode,
      discount: data.payment.discountAmount,
      discountPercentage: data.payment.discountPercentage,
      breakup: data.payment?.breakup || [],
      charges: data.payment?.charges,
    },
    refunds: [],
    createdAt: new Date(data.createdAt),
    appliedDiscount: data.payment.discountAmount > 0,
    paymentMethod: [],
    refundAvailable: data.refunds?.length > 0,
  };

  return dataObj;
};

export default function OnlineOrderSuccessModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const { businessData, billingSettings, printTemplateData } = useCommonApis();
  const { currency } = useCurrency();
  const [showSendReceipt, setShowSendReceipt] = useState(false);

  const totalDiscount = data?.payment?.discountAmount;

  const totalPaid = useMemo(
    () =>
      data?.payment?.breakup?.reduce(
        (prev: number, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const totalCharges = useMemo(
    () =>
      data?.payment?.charges?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const total = useMemo(() => {
    if (data?.items?.length > 0) {
      return data.items.reduce(
        (prev: number, cur: any) =>
          Number((prev + Number(cur.billing.total))?.toFixed(2)),
        0
      );
    }
    return 0;
  }, [data]);

  const handlePrintReceipt = async (kickDrawer: boolean) => {
    const orderData = {
      ...getOrderDataObj(data),
      company: {
        en: businessData?.company?.name?.en,
        ar: businessData?.company?.name?.ar,
        logo: businessData?.company?.logo || "",
      },
      location: {
        en: printTemplateData?.location?.name?.en,
        ar: printTemplateData?.location?.name?.ar,
      },
      phone: businessData?.location?.phone,
      vat: printTemplateData?.location?.vat,
      address: printTemplateData?.location?.address,
      footer: printTemplateData?.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplateData?.returnPolicy,
      customText: printTemplateData?.customText,
      noOfPrints: billingSettings?.noOfReceiptPrint == "1" ? [1] : [1, 2],
      kickDrawer: kickDrawer,
    };

    const allPrinter = await repository.printerRepository.findReceiptPrinters();
    const printer = allPrinter.find((p) => p.printerType === "inbuilt");

    if (printer) {
      try {
        const orderDoc = transformOrderData({
          ...orderData,
          print: true,
        });

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            EventRegister.emit("print-sunmi-2-inch-order", orderDoc);
          } else {
            await printSunmi4Inch(orderDoc as any);
          }
        } else {
          ExpoPrintHelp.init();
          await ExpoPrintHelp.print(JSON.stringify(orderDoc));
        }
      } catch (error) {}
    } else {
      if (authContext.permission["pos:order"]?.print) {
        EventRegister.emit("print-order", orderData);
      }
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
          backgroundColor: theme.colors.transparentBg,
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
            title={""}
            handleLeftBtn={() => {
              handleClose();
            }}
            isDivider={false}
          />

          <View
            style={{
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            <DefaultText
              style={{ textAlign: "center" }}
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {"#" + data?.orderNum}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: 12,
                fontSize: 22,
                marginBottom: hp("11%"),
                textAlign: "center",
              }}
              fontWeight="medium"
            >
              {t("Completed")}
            </DefaultText>

            <DefaultText
              style={{
                fontSize: 40,
                textAlign: "center",
              }}
              fontWeight="medium"
            >
              {Number(totalPaid) -
              Number((total + totalCharges - totalDiscount)?.toFixed(2))
                ? `${currency} ${(
                    totalPaid -
                    (total + totalCharges - totalDiscount)
                  ).toFixed(2)} ${t("Change")}`
                : t("No Change")}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: hp("4%"),
                fontSize: 24,
                marginBottom: hp("20.75%"),
                textAlign: "center",
              }}
              fontWeight="normal"
            >
              {`${t("out of")} ${currency} ${totalPaid?.toFixed(2)}`}
            </DefaultText>

            <PrimaryButton
              style={{
                paddingVertical: hp("2.25%"),
              }}
              textStyle={{
                fontSize: 20,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Done")}
              onPress={() => {
                handleClose();
              }}
            />

            <View
              style={{
                marginTop: hp("3.75%"),
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  reverse
                  style={{
                    paddingVertical: hp("1.5%"),
                    backgroundColor:
                      authContext.permission["pos:order"]?.["send-receipt"] &&
                      isConnected
                        ? theme.colors.primary[200]
                        : theme.colors.dividerColor.main,
                  }}
                  textStyle={{
                    fontSize: 20,
                    marginLeft: 12,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                    color:
                      authContext.permission["pos:order"]?.["send-receipt"] &&
                      isConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200],
                  }}
                  leftIcon={
                    <ICONS.SendReceiptIcon
                      color={
                        authContext.permission["pos:order"]?.["send-receipt"] &&
                        isConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  }
                  title={t("Send Receipt")}
                  onPress={() => {
                    setShowSendReceipt(true);
                  }}
                  disabled={
                    !authContext.permission["pos:order"]?.["send-receipt"] ||
                    !isConnected
                  }
                />
              </View>

              <Spacer space={wp("2.5%")} />

              <View style={{ flex: 1 }}>
                <PrimaryButton
                  disabled={
                    !authContext.permission["pos:order"]?.print ||
                    !isPrinterConnected
                  }
                  reverse
                  textStyle={{
                    fontSize: 20,
                    marginLeft: 12,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                    color:
                      authContext.permission["pos:order"]?.print &&
                      isPrinterConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200],
                  }}
                  style={{
                    paddingVertical: hp("1.5%"),
                    backgroundColor:
                      authContext.permission["pos:order"]?.print &&
                      isPrinterConnected
                        ? theme.colors.primary[200]
                        : theme.colors.dividerColor.main,
                  }}
                  leftIcon={
                    <ICONS.ReprintReceiptIcon
                      color={
                        authContext.permission["pos:order"]?.print &&
                        isPrinterConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  }
                  title={t("Reprint Receipt")}
                  onPress={() => {
                    handlePrintReceipt(false);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {showSendReceipt && (
        <SendReceiptModal
          data={getOrderDataObj(data)}
          customer={{}}
          visible={showSendReceipt}
          handleClose={() => setShowSendReceipt(false)}
        />
      )}

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
