import { format } from "date-fns";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useFindOne } from "../../hooks/use-find-one";
import usePrinterStatus from "../../hooks/use-printer-status";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useReportStore from "../../store/report-filter";
import { AuthType } from "../../types/auth-types";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";
import { printTransactionSunmi2Inch } from "../../utils/printTransactionSunmi-2inch-str";
import { printTransactionSunmi3Inch } from "../../utils/printTransactionSunmi3inch";
import { PrimaryButton } from "../buttons/primary-button";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import SeparatorVerticalView from "../common/separator-vertical-view";
import Loader from "../loader";
import PermissionPlaceholderComponent from "../permission-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import Label from "../text/label";
import ToolTip from "../tool-tip";
import CommonRow from "../transactions/common-row";
import ReportCommonCard from "./report-common-card";
import SendTransactionReceiptModal from "./send-receipt/send-receipt";

export default function SalesReport() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { businessData } = useCommonApis();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const { reportFilter } = useReportStore() as any;
  const { isConnected: isPrinterConnected } = usePrinterStatus();

  const [showSendReceipt, setShowSendReceipt] = useState(false);

  const restaurant =
    deviceContext.user.company.industry?.toLowerCase() === "restaurant";

  const {
    findOne: findSalesSummary,
    entity: salesSummary,
    loading,
    dataUpdatedAt,
  } = useFindOne("report/sale-summary");

  const salesRowData = [
    {
      title: t("TOTAL SALES"),
      amount: `${(
        (salesSummary?.netSales || 0) +
        (salesSummary?.totalVat || 0) +
        (salesSummary?.chargesWithoutVat || 0) -
        (salesSummary?.refundedCharges || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("NET SALES"),
      amount: `${(
        (salesSummary?.netSales || 0) +
        (salesSummary?.chargesWithoutVat || 0) -
        (salesSummary?.refundedCharges || 0) +
        (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("TAXES"),
      amount: `${(
        (salesSummary?.totalVat || 0) - (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2)}`,
    },
  ];

  const shiftRowData = [
    {
      title: t("TOTAL ORDERS"),
      value: `${salesSummary?.totalOrder || 0}`,
    },
    {
      title: t("TOTAL SHIFTS"),
      value: `${salesSummary?.totalShift || 0}`,
    },
    {
      title: t("NUMBER OF CASHIERS"),
      value: `${salesSummary?.cashiers?.length || 0}`,
    },
  ];

  const paymentCashCardRowData = [
    {
      title: t("CASH PAYMENT"),
      amount: `${(salesSummary?.txnWithCash || 0)?.toFixed(2)}`,
      desc: `${t("CASH COUNT")}: ${salesSummary?.txnCountInCash || 0}`,
    },
    {
      title: t("CARD PAYMENT"),
      amount: `${(salesSummary?.txnWithCard || 0)?.toFixed(2)}`,
      desc: `${t("CARD COUNT")}: ${salesSummary?.txnCountInCard || 0}`,
    },
  ];

  const paymentWalletCreditRowData = [
    {
      title: t("WALLET PAYMENT"),
      amount: `${(salesSummary?.txnWithWallet || 0)?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${salesSummary?.txnCountInWallet || 0}`,
    },
    {
      title: t("CREDIT PAYMENT"),
      amount: `${(salesSummary?.txnWithCredit || 0)?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${salesSummary?.txnCountInCredit || 0}`,
    },
  ];

  const refundCashCardRowData = [
    {
      title: t("CASH REFUND"),
      amount: `${(salesSummary?.refundInCash || 0)?.toFixed(2)}`,
      desc: `${t("CASH COUNT")}: ${salesSummary?.refundCountInCash || 0}`,
    },
    {
      title: t("CARD REFUND"),
      amount: `${(salesSummary?.refundInCard || 0)?.toFixed(2)}`,
      desc: `${t("CARD COUNT")}: ${salesSummary?.refundCountInCard || 0}`,
    },
  ];

  const refundWalletCreditRowData = [
    {
      title: t("WALLET REFUND"),
      amount: `${(salesSummary?.refundInWallet || 0)?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${salesSummary?.refundCountInWallet || 0}`,
    },
    {
      title: t("CREDIT REFUND"),
      amount: `${(salesSummary?.refundInCredit || 0)?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${salesSummary?.refundCountInCredit || 0}`,
    },
  ];

  const detailsData = [
    // {
    //   title: t("Gross Sale"),
    //   info: t("info_msg_gross_sale_in_sales_summary_report"),
    //   value: `${t("SAR")} ${(
    //     (salesSummary?.totalRevenue || 0) + salesSummary?.discount || 0
    //   )?.toFixed(2)}`,
    // },
    {
      title: t("Discounts"),
      value: `${t("SAR")} ${(salesSummary?.discount || 0)?.toFixed(2)}`,
    },
    {
      title: t("Refunds"),
      value: `${t("SAR")} ${(
        (salesSummary?.refundInCash || 0) +
        (salesSummary?.refundInCard || 0) +
        (salesSummary?.refundInWallet || 0) +
        (salesSummary?.refundInCredit || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("Charges"),
      info: t("info_msg_charges_in_sales_summary_report"),
      value: `${t("SAR")} ${(
        (salesSummary?.charges || 0) - (salesSummary?.refundedCharges || 0)
      )?.toFixed(2)}`,
    },
  ];

  const salesData = [
    {
      title: t("Net Sales"),
      value: `${t("SAR")} ${(
        (salesSummary?.netSales || 0) +
        (salesSummary?.chargesWithoutVat || 0) -
        (salesSummary?.refundedCharges || 0) +
        (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("VAT"),
      value: `${t("SAR")} ${(
        (salesSummary?.totalVat || 0) - (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("Total Sales"),
      value: `${t("SAR")} ${(
        (salesSummary?.netSales || 0) +
        (salesSummary?.totalVat || 0) +
        (salesSummary?.chargesWithoutVat || 0) -
        (salesSummary?.refundedCharges || 0)
      )?.toFixed(2)}`,
    },
  ];

  const otherOrderTypesData = [
    {
      title: salesSummary?.walkin?.name,
      value: `${t("SAR")} ${(salesSummary?.walkin?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.walkin?.count || 0}`,
    },
    {
      title: salesSummary?.pickup?.name,
      value: `${t("SAR")} ${(salesSummary?.pickup?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.pickup?.count || 0}`,
    },
    {
      title: salesSummary?.delivery?.name,
      value: `${t("SAR")} ${(salesSummary?.delivery?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.delivery?.count || 0}`,
    },
  ];

  const restaurantOrderTypesData = [
    {
      title: salesSummary?.pickup?.name,
      value: `${t("SAR")} ${(salesSummary?.pickup?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.pickup?.count || 0}`,
    },
    {
      title: salesSummary?.["dine-in"]?.name,
      value: `${t("SAR")} ${(salesSummary?.["dine-in"]?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.["dine-in"]?.count || 0}`,
    },
    {
      title: salesSummary?.delivery?.name,
      value: `${t("SAR")} ${(salesSummary?.delivery?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.delivery?.count || 0}`,
    },
    {
      title: salesSummary?.takeaway?.name,
      value: `${t("SAR")} ${(salesSummary?.takeaway?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.takeaway?.count || 0}`,
    },
  ];

  const paymentData = [
    {
      title: t("Cash"),
      value: `${t("SAR")} ${(salesSummary?.txnWithCash || 0)?.toFixed(2)}`,
    },
    {
      title: t("Card"),
      value: `${t("SAR")} ${(salesSummary?.txnWithCard || 0)?.toFixed(2)}`,
    },
    {
      title: t("Wallet"),
      value: `${t("SAR")} ${(salesSummary?.txnWithWallet || 0)?.toFixed(2)}`,
    },
    {
      title: t("Credit"),
      value: `${t("SAR")} ${(salesSummary?.txnWithCredit || 0)?.toFixed(2)}`,
    },
    {
      title: t("Total Payments"),
      value: `${t("SAR")} ${(
        (salesSummary?.txnWithCash || 0) +
        (salesSummary?.txnWithCard || 0) +
        (salesSummary?.txnWithWallet || 0) +
        (salesSummary?.txnWithCredit || 0)
      )?.toFixed(2)}`,
    },
  ];

  const refundData = [
    {
      title: t("Cash"),
      value: `${t("SAR")} ${(salesSummary?.refundInCash || 0)?.toFixed(2)}`,
    },
    {
      title: t("Card"),
      value: `${t("SAR")} ${(salesSummary?.refundInCard || 0)?.toFixed(2)}`,
    },
    {
      title: t("Wallet"),
      value: `${t("SAR")} ${(salesSummary?.refundInWallet || 0)?.toFixed(2)}`,
    },
    {
      title: t("Credit"),
      value: `${t("SAR")} ${(salesSummary?.refundInCredit || 0)?.toFixed(2)}`,
    },
    {
      title: t("Total Refunds"),
      value: `${t("SAR")} ${(
        (salesSummary?.refundInCash || 0) +
        (salesSummary?.refundInCard || 0) +
        (salesSummary?.refundInWallet || 0) +
        (salesSummary?.refundInCredit || 0)
      )?.toFixed(2)}`,
    },
  ];

  const printReceipt = async () => {
    const fromDate = new Date(reportFilter.dateRange.from);
    const toDate = new Date(reportFilter.dateRange.to);

    const printData = {
      user: { name: authContext.user.company.name },
      location: { name: authContext.user.location.name },
      startDate: format(new Date(fromDate), "dd-MM-yyyy, h:mm a"),
      endDate: format(new Date(toDate), "dd-MM-yyyy, h:mm a"),
      refundInCash: Number(salesSummary?.refundInCash || 0)?.toFixed(2),
      refundInCard: Number(salesSummary?.refundInCard || 0)?.toFixed(2),
      refundInWallet: Number(salesSummary?.refundInWallet || 0)?.toFixed(2),
      refundInCredit: Number(salesSummary?.refundInCredit || 0)?.toFixed(2),
      refundCountInCash: salesSummary?.refundCountInCash || 0,
      refundCountInCard: salesSummary?.refundCountInCard || 0,
      refundCountInWallet: salesSummary?.refundCountInWallet || 0,
      refundCountInCredit: salesSummary?.refundCountInCredit || 0,
      discount: Number(salesSummary?.discount || 0)?.toFixed(2),
      charges: Number(salesSummary?.chargesWithoutVat || 0)?.toFixed(2),
      totalVat: Number(
        (salesSummary?.totalVat || 0) - (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2),
      totalOrder: salesSummary?.totalOrder || 0,
      noOfDiscount: salesSummary?.noOfDiscount || 0,
      totalRevenue: Number(
        (salesSummary?.netSales || 0) +
          (salesSummary?.totalVat || 0) +
          (salesSummary?.chargesWithoutVat || 0) -
          (salesSummary?.refundedCharges || 0)
      )?.toFixed(2),
      showPickup: true,
      showWalkin: !restaurant,
      showTakeaway: restaurant,
      showDinein: restaurant,
      pickup: {
        name: salesSummary?.pickup?.name,
        amount: Number(salesSummary?.pickup?.amount || 0)?.toFixed(2),
        count: salesSummary?.pickup?.count || 0,
      },
      delivery: {
        name: salesSummary?.delivery?.name,
        amount: Number(salesSummary?.delivery?.amount || 0)?.toFixed(2),
        count: salesSummary?.delivery?.count || 0,
      },
      walkin: {
        name: salesSummary?.walkin?.name,
        amount: Number(salesSummary?.walkin?.amount || 0)?.toFixed(2),
        count: salesSummary?.walkin?.count || 0,
      },
      takeaway: {
        name: salesSummary?.takeaway?.name,
        amount: Number(salesSummary?.takeaway?.amount || 0)?.toFixed(2),
        count: salesSummary?.takeaway?.count || 0,
      },
      dinein: {
        name: salesSummary?.["dine-in"]?.name,
        amount: Number(salesSummary?.["dine-in"]?.amount || 0)?.toFixed(2),
        count: salesSummary?.["dine-in"]?.count || 0,
      },
      netSales: Number(
        (salesSummary?.netSales || 0) +
          (salesSummary?.chargesWithoutVat || 0) -
          (salesSummary?.refundedCharges || 0) +
          (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2),
      totalShift: salesSummary?.totalShift || 0,
      txnWithCard: Number(salesSummary?.txnWithCard || 0)?.toFixed(2),
      txnWithCash: Number(salesSummary?.txnWithCash || 0)?.toFixed(2),
      txnWithWallet: Number(salesSummary?.txnWithWallet || 0)?.toFixed(2),
      txnWithCredit: Number(salesSummary?.txnWithCredit || 0)?.toFixed(2),
      txnCountInCard: salesSummary?.txnCountInCard || 0,
      txnCountInCash: salesSummary?.txnCountInCash || 0,
      txnCountInWallet: salesSummary?.txnCountInWallet || 0,
      txnCountInCredit: salesSummary?.txnCountInCredit || 0,
      cashiers:
        !salesSummary?.cashiers || salesSummary?.cashiers?.length === 0
          ? "-"
          : salesSummary?.cashiers
              ?.map((cashier: string) => `${cashier}`)
              ?.join(", "),
      printedOn: format(new Date(), "dd-MM-yyyy, h:mm a"),
      printedBy: authContext.user.name,
      printedFrom: `${deviceContext.user.name}, (${deviceContext.user.phone})`,
      footer: "Thank You",
    };

    const printer = await repo.printer.findOneBy({
      enableReceipts: true,
      printerType: "inbuilt",
    });

    if (printer) {
      try {
        if (printer.device_id === "sunmi") {
          debugLog(
            "Inbuilt transaction print started",
            {},
            "sales-summary-screen",
            "handlePrintTransactionReceipt"
          );

          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            await printTransactionSunmi2Inch(printData as any);
          } else {
            await printTransactionSunmi3Inch(printData as any);
          }

          debugLog(
            "Inbuilt transaction print completed",
            {},
            "sales-summary-screen",
            "handlePrintTransactionReceipt"
          );
        }
      } catch (error) {
        errorLog(
          "Inbuilt transaction print failed",
          {},
          "sales-summary-screen",
          "handlePrintTransactionReceipt",
          error
        );
      }
    } else {
      EventRegister.emit("print-transaction", printData);
    }
  };

  const getReportNote = () => {
    const businessHour =
      businessData?.location?.businessClosureSetting?.businessTime;
    const endStartReporting =
      businessData?.location?.businessClosureSetting?.endStartReporting;

    if (businessHour && !reportFilter?.reportingHours?._id) {
      return `${t(
        "The report being shown is based on location business hours"
      )}`;
    } else if (endStartReporting && !reportFilter?.reportingHours?._id) {
      return `${t(
        "The report being shown is based on End at business day settings"
      )}`;
    } else if (reportFilter?.reportingHours?._id) {
      return `${t("The report being shown is based on Reporting hours")}`;
    } else {
      return `${t(
        "The report being shown is based on Company time zone (12:00 - 11:59)"
      )}`;
    }
  };

  useEffect(() => {
    (async () => {
      if (isConnected) {
        const fromDate = new Date(reportFilter.dateRange.from);
        const toDate = new Date(reportFilter.dateRange.to);

        findSalesSummary({
          page: 0,
          limit: 10,
          sort: "desc",
          companyRef: authContext.user.companyRef,
          locationRef: authContext.user.locationRef,
          dateRange: { from: fromDate, to: toDate },
        });
      }
    })();
  }, [authContext, reportFilter]);

  if (loading) {
    return (
      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <Loader style={{ marginTop: hp("35%") }} />
      </View>
    );
  }

  if (!isConnected || !authContext.permission["pos:report"]?.sales) {
    let text = "";

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        { tab: "Sales summary" },
        "reports-sales-screen",
        "handleInternet"
      );
      text = `${t("Reports are not available on offline mode")}. ${t(
        "Please go online"
      )}.`;
    } else {
      infoLog(
        "Permission denied to view this screen",
        { tab: "Sales summary" },
        "reports-sales-screen",
        "handlePermission"
      );
      text = t("You don't have permissions to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} marginTop="-15%" />;
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
    >
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingVertical: hp("1%"),
            paddingHorizontal: hp("3%"),
            backgroundColor: theme.colors.yellow.default,
          }}
        >
          <DefaultText
            fontSize="lg"
            fontWeight="medium"
            color={theme.colors.white[1000]}
          >
            {`${t("Note")}: ${t("sales_summary_note")}`}
          </DefaultText>
        </View>

        <View
          style={{
            marginLeft: hp("4%"),
            marginTop: hp("3.5%"),
            marginRight: hp("3%"),
            marginBottom: hp("2.5%"),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DefaultText
            style={{ width: "70%" }}
            fontSize="lg"
            fontWeight="medium"
            color={theme.colors.otherGrey[100]}
          >
            {`${t("Note")}: ${getReportNote()}. ${t(
              "Stats last updated on"
            )} ${format(new Date(dataUpdatedAt), "dd/MM/yyyy, h:mm a")}.`}
          </DefaultText>

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
                  backgroundColor: isPrinterConnected
                    ? theme.colors.primary[200]
                    : theme.colors.dividerColor.main,
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.normal,
                  fontFamily: theme.fonts.circulatStd,
                  color: isPrinterConnected
                    ? theme.colors.primary[1000]
                    : theme.colors.otherGrey[200],
                }}
                title={t("Print")}
                onPress={() => {
                  printReceipt();
                }}
                disabled={!isPrinterConnected}
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
                  <ICONS.PrinterOrderIcon
                    color={
                      isPrinterConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200]
                    }
                  />
                }
                title={""}
                onPress={() => {
                  printReceipt();
                }}
                disabled={!isPrinterConnected}
              />
            )}

            {twoPaneView ? (
              <PrimaryButton
                reverse
                style={{
                  borderRadius: 10,
                  marginLeft: hp("2.5%"),
                  paddingVertical: hp("2%"),
                  paddingHorizontal: wp("2.15%"),
                  backgroundColor: theme.colors.primary[200],
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.normal,
                  fontFamily: theme.fonts.circulatStd,
                  color: theme.colors.primary[1000],
                }}
                title={t("Send")}
                onPress={() => {
                  setShowSendReceipt(true);
                }}
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
                  <ICONS.SendOrderIcon color={theme.colors.primary[1000]} />
                }
                title={""}
                onPress={() => {
                  setShowSendReceipt(true);
                }}
              />
            )}
          </View>
        </View>

        <View
          style={{
            borderRadius: 8,
            marginBottom: hp("3%"),
            marginHorizontal: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {salesRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "33%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < salesRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>

          <SeparatorHorizontalView />

          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {shiftRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "33%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < shiftRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View
          style={{
            borderRadius: 8,
            marginTop: hp("1%"),
            marginBottom: hp("3%"),
            marginHorizontal: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {paymentCashCardRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < paymentCashCardRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>

          <SeparatorHorizontalView />

          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {paymentWalletCreditRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < paymentWalletCreditRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View
          style={{
            borderRadius: 8,
            marginTop: hp("1%"),
            marginBottom: hp("3%"),
            marginHorizontal: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {refundCashCardRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < refundCashCardRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>

          <SeparatorHorizontalView />

          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {refundWalletCreditRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < refundWalletCreditRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <Spacer space={hp("3.5%")} />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Label marginLeft={hp("2%")}>{t("DETAILS")}</Label>

          <View style={{ marginLeft: 8, marginBottom: 5 }}>
            <ToolTip
              infoMsg={t("info_msg_details_data_sales_summary_report")}
            />
          </View>
        </View>

        {detailsData.map((sales, index) => {
          return (
            <CommonRow
              key={index}
              data={sales}
              isLast={index === detailsData.length - 1}
            />
          );
        })}

        <Spacer space={hp("5%")} />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Label marginLeft={hp("2%")}>{t("TOTAL")}</Label>

          <View style={{ marginLeft: 8, marginBottom: 5 }}>
            <ToolTip infoMsg={t("info_msg_total_data_sales_summary_report")} />
          </View>
        </View>

        {salesData.map((sales, index) => {
          return (
            <CommonRow
              key={index}
              data={sales}
              isLast={index === salesData.length - 1}
              titleFontWeight={
                index == salesData.length - 1 ? "medium" : "normal"
              }
              valueFontWeight={
                index == salesData.length - 1 ? "medium" : "normal"
              }
            />
          );
        })}

        <Spacer space={hp("5%")} />

        <Label marginLeft={hp("2%")}>{t("ORDER TYPES")}</Label>

        {(restaurant ? restaurantOrderTypesData : otherOrderTypesData).map(
          (types, index) => {
            return (
              <CommonRow
                key={index}
                data={types}
                isLast={
                  index ===
                  (restaurant ? restaurantOrderTypesData : otherOrderTypesData)
                    .length -
                    1
                }
              />
            );
          }
        )}

        <Spacer space={hp("5%")} />

        <Label marginLeft={hp("2%")}>{t("PAYMENT")}</Label>

        {paymentData.map((payment, index) => {
          return (
            <CommonRow
              key={index}
              data={payment}
              titleFontWeight={
                index == paymentData.length - 1 ? "medium" : "normal"
              }
              valueFontWeight={
                index == paymentData.length - 1 ? "medium" : "normal"
              }
              isLast={index === paymentData.length - 1}
            />
          );
        })}

        <Spacer space={hp("5%")} />

        <Label marginLeft={hp("2%")}>{t("REFUND")}</Label>

        {refundData.map((refund, index) => {
          return (
            <CommonRow
              key={index}
              data={refund}
              titleFontWeight={
                index == refundData.length - 1 ? "medium" : "normal"
              }
              valueFontWeight={
                index == refundData.length - 1 ? "medium" : "normal"
              }
              isLast={index === refundData.length - 1}
            />
          );
        })}

        <Spacer space={hp("12%")} />
      </ScrollView>

      <SendTransactionReceiptModal
        salesSummary={salesSummary}
        dateRange={reportFilter.dateRange}
        visible={showSendReceipt}
        handleClose={() => {
          setShowSendReceipt(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
