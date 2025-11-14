import * as ExpoPrintHelp from "expo-print-help";
import React, { useContext, useState } from "react";
import { View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import usePrinterStatus from "../../hooks/use-printer-status";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import ICONS from "../../utils/icons";
import { printSunmi4Inch } from "../../utils/printSunmi3inch";
import { transformOrderData } from "../../utils/transform-order-data";
import SendReceiptModal from "../billing/send-receipt/send-receipt";
import { PrimaryButton } from "../buttons/primary-button";
import CurrencyView from "../modal/currency-view-modal";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";
import repository from "../../db/repository";
import { useCurrency } from "../../store/get-currency";

export default function TransactionHeaderOrders({
  order,
  selectedOrder,
  amount,
  handleIssueRefund,
  origin = "transaction",
}: any) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);

  const refundSinglePaneActionable =
    authContext.permission["pos:order"]?.update &&
    isConnected &&
    order?.orderStatus !== "cancelled" &&
    order?.refunds?.length == 0;

  const refundTwoPaneActionable = refundSinglePaneActionable && selectedOrder;

  const printSinglePaneActionable =
    authContext.permission["pos:order"]?.print && isPrinterConnected;

  const printTwoPaneActionable = printSinglePaneActionable && selectedOrder;

  const receiptSinglePaneActionable =
    authContext.permission["pos:order"]?.["send-receipt"] && isConnected;

  const receiptTwoPaneActionable = receiptSinglePaneActionable && selectedOrder;

  const [showSendReceipt, setShowSendReceipt] = useState(false);

  const printReceipt = async () => {
    const businessDetails: any = await repository.business.findByLocationId(
      deviceContext?.user?.locationRef
    );

    const printTemplates: any =
      await repository.printTemplateRepository.findByLocation(
        deviceContext?.user?.locationRef
      );

    const printTemplate = printTemplates?.[0];

    const printData = {
      ...order,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      company: {
        en: businessDetails.company.name.en,
        ar: businessDetails.company.name.ar,
        logo: businessDetails.company?.logo || "",
      },
      location: {
        en: printTemplate.location.name.en,
        ar: printTemplate.location.name.ar,
      },
      phone: businessDetails.location.phone,
      vat: printTemplate.location.vat,
      address: printTemplate.location.address,
      footer: printTemplate.footer,
      returnPolicyTitle: "Return Policy",
      returnPolicy: printTemplate.returnPolicy,
      customText: printTemplate.customText,
      noOfPrints: [1],
      kickDrawer: false,
    };

    const allprinter = await repository.printerRepository.findByType("inbuilt");
    const printer = allprinter.find((t) => t.enableReceipts);

    if (printer) {
      try {
        const orderDoc = transformOrderData({
          ...printData,
          print: isPrinterConnected,
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
          await ExpoPrintHelp.print(JSON.stringify(orderDoc), currency);
        }
      } catch (error) {}
    } else {
      EventRegister.emit("print-order", printData);
    }
  };

  const checkOrderServerSync = async () => {
    if (!isConnected) {
      return showToast("info", t("Please connect with internet"));
    }

    if (
      selectedOrder?.qrOrdering &&
      selectedOrder?.orderStatus !== "completed"
    ) {
      return showToast(
        "error",
        t("Refund will be initiated after order completion")
      );
    }

    setLoading(true);

    try {
      const res = await serviceCaller(`/order/${order._id}/refund/status`, {
        method: "GET",
      });

      if (res.activate) {
        handleIssueRefund();
      } else {
        showToast("error", t("Order was not synced to the server"));
      }
    } catch (error: any) {
      showToast("error", error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          height: twoPaneView ? hp("9.5%") : hp("7%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: hp("1.4%"),
          paddingRight: hp("1.85%"),
          borderBottomWidth: 1,
          borderColor: theme.colors.dividerColor.secondary,
          backgroundColor: theme.colors.primary[100],
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <DefaultText style={{ fontSize: 22 }} fontWeight="medium">
            {t("Sale")}
          </DefaultText>

          <Spacer space={hp("1.75%")} />

          <CurrencyView
            amount={amount}
            symbolFontsize={16}
            amountFontsize={24}
            decimalFontsize={24}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {twoPaneView ? (
            <PrimaryButton
              reverse
              style={{
                borderRadius: 10,
                marginLeft: hp("2.5%"),
                paddingVertical: hp("2%"),
                paddingHorizontal: wp("2.15%"),
                backgroundColor: refundTwoPaneActionable
                  ? theme.colors.primary[200]
                  : theme.colors.dividerColor.main,
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.normal,
                fontFamily: theme.fonts.circulatStd,
                color: refundTwoPaneActionable
                  ? theme.colors.primary[1000]
                  : theme.colors.otherGrey[200],
              }}
              loading={loading}
              title={t("Issue Refund")}
              onPress={() => {
                checkOrderServerSync();
              }}
              disabled={!refundTwoPaneActionable}
            />
          ) : (
            <PrimaryButton
              reverse
              style={{
                marginLeft: hp("0.5%"),
                paddingVertical: hp("1.5%"),
                paddingHorizontal: wp("1%"),
                backgroundColor: "transparent",
              }}
              leftIcon={
                <ICONS.RefundOrderIcon
                  color={
                    refundSinglePaneActionable
                      ? theme.colors.primary[1000]
                      : theme.colors.otherGrey[200]
                  }
                />
              }
              title={""}
              loading={loading}
              onPress={() => {
                checkOrderServerSync();
              }}
              disabled={!refundSinglePaneActionable}
            />
          )}

          {twoPaneView ? (
            <>
              {origin === "transaction" ? (
                <PrimaryButton
                  reverse
                  style={{
                    borderRadius: 10,
                    marginLeft: hp("2.5%"),
                    paddingVertical: hp("2%"),
                    paddingHorizontal: wp("2.15%"),
                    backgroundColor: printTwoPaneActionable
                      ? theme.colors.primary[200]
                      : theme.colors.dividerColor.main,
                  }}
                  textStyle={{
                    fontSize: 16,
                    fontWeight: theme.fontWeights.normal,
                    fontFamily: theme.fonts.circulatStd,
                    color: printTwoPaneActionable
                      ? theme.colors.primary[1000]
                      : theme.colors.otherGrey[200],
                  }}
                  title={t("Print Receipt")}
                  onPress={() => {
                    printReceipt();
                  }}
                  disabled={!printTwoPaneActionable}
                />
              ) : (
                <></>
              )}
            </>
          ) : origin === "transaction" ? (
            <PrimaryButton
              reverse
              style={{
                marginLeft: hp("0.5%"),
                paddingVertical: hp("1.5%"),
                paddingHorizontal: wp("1%"),
                backgroundColor: "transparent",
              }}
              leftIcon={
                <ICONS.PrinterOrderIcon
                  color={
                    printSinglePaneActionable
                      ? theme.colors.primary[1000]
                      : theme.colors.otherGrey[200]
                  }
                />
              }
              title={""}
              onPress={() => {
                printReceipt();
              }}
              disabled={!printSinglePaneActionable}
            />
          ) : (
            <></>
          )}

          {twoPaneView ? (
            <>
              {origin === "transaction" ? (
                <PrimaryButton
                  reverse
                  style={{
                    borderRadius: 10,
                    marginLeft: hp("2.5%"),
                    paddingVertical: hp("2%"),
                    paddingHorizontal: wp("2.15%"),
                    backgroundColor: receiptTwoPaneActionable
                      ? theme.colors.primary[200]
                      : theme.colors.dividerColor.main,
                  }}
                  textStyle={{
                    fontSize: 16,
                    fontWeight: theme.fontWeights.normal,
                    fontFamily: theme.fonts.circulatStd,
                    color: receiptTwoPaneActionable
                      ? theme.colors.primary[1000]
                      : theme.colors.otherGrey[200],
                  }}
                  title={t("Send Receipt")}
                  onPress={() => {
                    setShowSendReceipt(true);
                  }}
                  disabled={!receiptTwoPaneActionable}
                />
              ) : (
                <></>
              )}
            </>
          ) : origin === "transaction" ? (
            <PrimaryButton
              reverse
              style={{
                marginLeft: hp("0.5%"),
                paddingVertical: hp("1.5%"),
                paddingHorizontal: wp("1%"),
                backgroundColor: "transparent",
              }}
              leftIcon={
                <ICONS.SendOrderIcon
                  color={
                    receiptSinglePaneActionable
                      ? theme.colors.primary[1000]
                      : theme.colors.otherGrey[200]
                  }
                />
              }
              title={""}
              onPress={() => {
                setShowSendReceipt(true);
              }}
              disabled={!receiptSinglePaneActionable}
            />
          ) : (
            <></>
          )}
        </View>
      </View>

      <SendReceiptModal
        data={order}
        visible={showSendReceipt}
        handleClose={() => {
          setShowSendReceipt(false);
        }}
      />
    </>
  );
}
