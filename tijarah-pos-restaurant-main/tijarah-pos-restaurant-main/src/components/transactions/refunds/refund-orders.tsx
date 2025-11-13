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
import { printSunmRefundi4Inch } from "../../../utils/printRefundSunmi3inch";
import { transformRefundData } from "../../../utils/transform-refund-data";
import { PrimaryButton } from "../../buttons/primary-button";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText from "../../text/Text";
import CommonRow from "../common-row";
import RefundHeader from "./refund-header";
import repository from "../../../db/repository";
import { useCurrency } from "../../../store/get-currency";

export default function RefundsOrders({ data, origin = "transaction" }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();
  const deviceContext = useContext(DeviceContext) as any;
  const authContext = useContext<AuthType>(AuthContext);
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const { currency } = useCurrency();

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
          item?.sku
            ? (items.productRef === item._id &&
                items?.variant?.sku === item?.sku) ||
              item?.variant?.sku === "Open Item"
            : items.productRef === item._id
            ? item?.variant?.unit === "perItem" ||
              items?.variant?.type === "box" ||
              items?.variant?.type === "crate"
            : items.quantity === item.quantity
        );

        console.log(JSON.stringify(item, null, 2));

        if (orderItem) {
          const box =
            orderItem?.variant?.type === "box"
              ? `, (${t("Box")} - ${orderItem?.variant?.unitCount} ${t(
                  "Units"
                )})`
              : orderItem?.variant?.type === "crate"
              ? `, (${t("Crate")} - ${orderItem?.variant?.unitCount} ${t(
                  "Units"
                )})`
              : "";

          const name = isRTL
            ? item.name?.ar || item?.nameAr + box
            : item.name?.en || item?.nameEn + box;

          list.push({
            title: name,
            info: "",
            value: `${currency} -${(item.amount - item.vat)?.toFixed(2)}`,
            color: "",
          });
        }
      });

      refund?.charges?.forEach((charge: any) => {
        chargesVAT += Number(charge.totalVatOnCharge || 0);

        list.push({
          title: isRTL ? charge.name?.ar : charge.name?.en,
          info: "",
          value: `${currency} -${(
            Number(charge?.totalCharge || 0) -
            Number(charge?.totalVatOnCharge || 0)
          )?.toFixed(2)}`,
        });
      });

      if (refund.vat != 0) {
        list.push({
          title: t("VAT"),
          info: `${t("Items VAT")}: ${currency} -${(
            refund?.vat - chargesVAT
          )?.toFixed(2)}\n${t(
            "Charges VAT"
          )}: ${currency} -${chargesVAT?.toFixed(2)}`,
          value: `${currency} -${refund?.vat?.toFixed(2)}`,
          color: "",
        });
      }

      refund.refundedTo.forEach((data: any) => {
        console.log(data);
        if (data.amount != 0) {
          total += Number(data.amount || 0);

          payment.push({
            title: data.refundedTo || data?.refundTo || "",
            value: `${currency}  -${Number(data.amount || 0)?.toFixed(2)}`,
            color: theme.colors.placeholder,
          });
        }
      });

      list.push({
        title: t("Total"),
        info: "",
        value: `${currency} -${total?.toFixed(2)}`,
        color: "",
      });

      setRefunds(list);
      setRefundPayment(payment);
    }
  }, [data?.refunds, origin]);

  const handlePrintRefund = async () => {
    const businessDetails: any = await repository.business.findById(
      deviceContext?.user?.locationRef
    );

    const printTemplates: any =
      await repository.printTemplateRepository.findByLocation(
        deviceContext?.user?.locationRef
      );

    const printTemplate = printTemplates?.[0];

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

    const allprinter = await repository.printerRepository.findByType("inbuilt");
    const printer = allprinter.find((t) => t.enableReceipts);

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
            await printSunmRefundi4Inch(orderDoc as any);
          }
        } else {
          ExpoPrintHelp.init();
          await ExpoPrintHelp.printRefund(JSON.stringify(orderDoc), currency);
        }
      } catch (error) {}
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

          <View>
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
          </View>

          {origin !== "transaction" && (
            <View style={{ height: hp("35%"), marginTop: hp("5%") }}></View>
          )}

          {origin === "transaction" && (
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
          )}
        </ScrollView>
      ) : (
        <View style={{ marginHorizontal: 16 }}>
          <NoDataPlaceholder title={t("No Refunds!")} marginTop={hp("30%")} />
        </View>
      )}
    </View>
  );
}
