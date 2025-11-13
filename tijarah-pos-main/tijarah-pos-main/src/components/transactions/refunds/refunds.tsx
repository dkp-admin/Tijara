import * as ExpoPrintHelp from "expo-print-help";
import { default as React, useContext, useMemo, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import usePrinterStatus from "../../../hooks/use-printer-status";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { repo } from "../../../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../../../utils/log-patch";
import { printSunmRefundi4Inch } from "../../../utils/printRefundSunmi3inch";
import { transformRefundData } from "../../../utils/transform-refund-data";
import { PrimaryButton } from "../../buttons/primary-button";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText from "../../text/Text";
import CommonRow from "../common-row";
import RefundHeader from "./refund-header";

export default function Refunds({ data }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();
  const deviceContext = useContext(DeviceContext) as any;
  const authContext = useContext<AuthType>(AuthContext);
  const { isConnected: isPrinterConnected } = usePrinterStatus();

  const refundPrintActionable =
    authContext.permission["pos:order"]?.print && isPrinterConnected;

  const [refunds, setRefunds] = useState<any>([]);
  const [refundPayment, setRefundPayment] = useState<any>([]);

  useMemo(() => {
    if (data?.refunds?.length > 0) {
      let total = 0;
      let chargesVAT = 0;
      const refund = data.refunds[0];

      const list: any[] = [];
      const payment: any[] = [];

      if (refund?.referenceNumber) {
        payment.push({
          title: t("Refund Receipt No"),
          value: `#${refund?.referenceNumber}`,
          color: "",
        });
      }

      payment.push({
        title: t("Invoice Refernce No"),
        value: `#${data?.orderNum}`,
        color: "",
      });

      payment.push({ title: t("Reason"), value: refund.reason, color: "" });

      refund.items.forEach((item: any) => {
        const orderItem = data.items.find((items: any) =>
          item.sku
            ? (items.productRef === item._id && items.sku === item.sku) ||
              item.sku === "Open Item"
            : items.productRef === item._id
            ? item.unit === "perItem" ||
              items.type === "box" ||
              items.type === "crate"
            : items.qty === item.qty
        );

        if (orderItem) {
          const box =
            orderItem.type === "box"
              ? `, (${t("Box")} - ${orderItem.noOfUnits} ${t("Units")})`
              : orderItem.type === "crate"
              ? `, (${t("Crate")} - ${orderItem.noOfUnits} ${t("Units")})`
              : "";

          const name = isRTL ? item.nameAr + box : item.nameEn + box;

          list.push({
            title: name,
            info: "",
            value: `${t("SAR")} -${(item.amount - item.vat)?.toFixed(2)}`,
            color: "",
          });
        }
      });

      refund?.charges?.forEach((charge: any) => {
        chargesVAT += Number(charge.totalVatOnCharge || 0);

        list.push({
          title: isRTL ? charge.name?.ar : charge.name?.en,
          info: "",
          value: `${t("SAR")} -${(
            Number(charge?.totalCharge || 0) -
            Number(charge?.totalVatOnCharge || 0)
          )?.toFixed(2)}`,
        });
      });

      if (refund.vat != 0) {
        list.push({
          title: t("VAT"),
          info: `${t("Items VAT")}: ${t("SAR")} -${(
            refund?.vat - chargesVAT
          )?.toFixed(2)}\n${t("Charges VAT")}: ${t(
            "SAR"
          )} -${chargesVAT?.toFixed(2)}`,
          value: `${t("SAR")} -${refund?.vat?.toFixed(2)}`,
          color: "",
        });
      }

      refund.refundedTo.forEach((data: any) => {
        if (data.amount != 0) {
          total += Number(data.amount || 0);

          payment.push({
            title: data.refundTo || "",
            value: `${t("SAR")}  -${Number(data.amount || 0)?.toFixed(2)}`,
            color: theme.colors.placeholder,
          });
        }
      });

      list.push({
        title: t("Total"),
        info: "",
        value: `${t("SAR")} -${total?.toFixed(2)}`,
        color: "",
      });

      setRefunds(list);
      setRefundPayment(payment);
    }
  }, [data?.refunds]);

  const handlePrintRefund = async () => {
    const businessDetails: any = await repo.business.findOne({
      where: { _id: deviceContext.user.locationRef },
    });

    const printTemplate: any = await repo.printTemplate.findOne({
      where: { locationRef: deviceContext.user.locationRef },
    });

    const refundPrintData = {
      ...data,
      showToken: printTemplate?.showToken,
      showOrderType: printTemplate?.showOrderType,
      company: {
        en: businessDetails.company.name.en,
        ar: businessDetails.company.name.ar,
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
      noteTitle: "Note:",
      note:
        Number(data?.payment?.discount) > 0
          ? "The item prices listed are after any discounts given during billing"
          : "",
    };

    const printer = await repo.printer.findOneBy({
      enableReceipts: true,
      printerType: "inbuilt",
    });

    if (printer) {
      try {
        const orderDoc = transformRefundData({
          ...refundPrintData,
          print: isPrinterConnected,
        });

        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            EventRegister.emit("refund-sunmi-2-inch-order", orderDoc);
          } else {
            debugLog(
              "Inbuilt Sunmi 3 inch refund print started",
              orderDoc,
              "refunds-order-tab",
              "handlePrintRefundFunction"
            );

            await printSunmRefundi4Inch(orderDoc as any);

            debugLog(
              "Inbuilt Sunmi 3 inch refund print completed",
              {},
              "refunds-order-tab",
              "handlePrintRefundFunction"
            );
          }
        } else {
          debugLog(
            "Inbuilt NeoLeap refund print started",
            orderDoc,
            "refunds-order-tab",
            "handlePrintRefundFunction"
          );

          ExpoPrintHelp.init();
          await ExpoPrintHelp.printRefund(JSON.stringify(orderDoc));

          debugLog(
            "Inbuilt NeoLeap refund print completed",
            {},
            "refunds-order-tab",
            "handlePrintRefundFunction"
          );
        }
      } catch (error) {
        errorLog(
          "Inbuilt refund print failed",
          {},
          "refunds-order-tab",
          "handlePrintRefundFunction",
          error
        );
      }
    } else {
      EventRegister.emit("print-refund", refundPrintData);
    }
  };

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: theme.colors.bgColor,
      }}
    >
      {data?.refunds?.length > 0 ? (
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <RefundHeader
            data={{
              cashier: `${data.refunds[0].cashier.name} (${data.refunds[0].device.deviceCode})`,
              date: data.refunds[0].date,
            }}
          />

          {refunds.map((data: any, index: number) => {
            return (
              <CommonRow
                key={index}
                data={data}
                // styleTitle={{ width: "60%" }}
                valueColor={data.color}
                isLast={index == refunds.length - 1}
              />
            );
          })}

          <DefaultText
            style={{
              marginBottom: 6,
              marginTop: hp("5%"),
              paddingHorizontal: wp("1.5%"),
            }}
            fontSize="md"
            fontWeight="medium"
            color={theme.colors.text.primary}
          >
            {t("DETAILS")}
          </DefaultText>

          {refundPayment.map((data: any, index: number) => {
            return (
              <CommonRow
                key={index}
                data={data}
                styleTitle={{ width: "60%", textTransform: "capitalize" }}
                valueColor={data.color}
                isLast={index == refundPayment.length - 1}
                titleFontWeight={
                  index == refundPayment.length - 1 ? "medium" : "normal"
                }
                valueFontWeight={
                  index == refundPayment.length - 1 ? "medium" : "normal"
                }
              />
            );
          })}

          <View style={{ height: hp("35%"), marginTop: hp("5%") }}>
            {refunds.length > 0 && (
              <PrimaryButton
                reverse
                style={{
                  borderRadius: 10,
                  marginHorizontal: hp("3%"),
                  paddingVertical: hp("2%"),
                  paddingHorizontal: wp("2.15%"),
                  backgroundColor: refundPrintActionable
                    ? theme.colors.primary[200]
                    : theme.colors.dividerColor.main,
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.normal,
                  fontFamily: theme.fonts.circulatStd,
                  color: refundPrintActionable
                    ? theme.colors.primary[1000]
                    : theme.colors.otherGrey[200],
                }}
                title={t("Print Refund Receipt")}
                onPress={() => {
                  handlePrintRefund();
                }}
                disabled={!refundPrintActionable}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={{ marginHorizontal: 16 }}>
          <NoDataPlaceholder title={t("No Refunds!")} marginTop={hp("30%")} />
        </View>
      )}
    </View>
  );
}
