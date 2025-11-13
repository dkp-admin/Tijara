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
import ICONS from "../../utils/icons";
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
import { queryClient } from "../../query-client";
import repository from "../../db/repository";
import { useCurrency } from "../../store/get-currency";

const getCountAndTotal = (data: any, type: string) => {
  const doc = data?.find(
    (d: any) => d?.paymentName?.toLowerCase() === type?.toLowerCase()
  );
  return doc;
};

const getRefundCountAndTotal = (data: any, type: string) => {
  const doc = data?.find(
    (d: any) => d?.refundType?.toLowerCase() === type?.toLowerCase()
  );
  return doc;
};

export default function SalesReport() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { businessData } = useCommonApis();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const { reportFilter } = useReportStore() as any;
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const [loader, setLoader] = useState(true);
  const { currency } = useCurrency();
  const [showSendReceipt, setShowSendReceipt] = useState(false);

  const restaurant =
    deviceContext.user.company.industry?.toLowerCase() === "restaurant";

  const {
    findOne: findSalesSummary,
    entity: salesSummary,
    loading,
    dataUpdatedAt,
    isFetching,
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
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "cash")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("CASH COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "cash")?.noOfPayments || 0
      }`,
    },
    {
      title: t("CARD PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "card")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("CARD COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "card")?.noOfPayments || 0
      }`,
    },
  ];

  const paymentWalletCreditRowData = [
    {
      title: t("WALLET PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "wallet")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "wallet")?.noOfPayments || 0
      }`,
    },
    {
      title: t("CREDIT PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "credit")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "credit")?.noOfPayments ||
        0 ||
        0
      }`,
    },
  ];

  const paymentJahezNinja = [
    {
      title: t("JAHEZ PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "jahez")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("JAHEZ COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "jahez")?.noOfPayments || 0
      }`,
    },
    {
      title: t("NINJA PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "ninja")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("NINJA COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "ninja")?.noOfPayments || 0
      }`,
    },
  ];

  const paymentTypeToYouBarakah = [
    {
      title: t("TOYOU PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "toyou")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("TOYOU COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "toyou")?.noOfPayments || 0
      }`,
    },
    {
      title: t("BARAKAH PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "barakah")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("BARAKAH COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "barakah")?.noOfPayments || 0
      }`,
    },
  ];

  const paymentTypeCareemTheChef = [
    {
      title: t("CAREEM PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "careem")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("CAREEM COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "careem")?.noOfPayments || 0
      }`,
    },
    {
      title: t("THE CHEF PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "thechef")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("THE CHEF COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "thechef")?.noOfPayments || 0
      }`,
    },
  ];
  const paymentTypeHungerStation = [
    {
      title: t("HUNGER STATION PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "hungerstation")
          ?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("HUNGER STATION COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "hungerstation")
          ?.noOfPayments || 0
      }`,
    },
    {
      title: t("NEARPAY PAYMENT"),
      amount: `${(
        getCountAndTotal(salesSummary?.txnStats, "nearpay")?.totalPayments || 0
      )?.toFixed(2)}`,
      desc: `${t("NEARPAY COUNT")}: ${
        getCountAndTotal(salesSummary?.txnStats, "nearpay")?.noOfPayments || 0
      }`,
    },
  ];

  const refundCashCardRowData = [
    {
      title: t("CASH REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "cash")?.totalRefund ||
        0
      )?.toFixed(2)}`,
      desc: `${t("CASH COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "cash")?.refundCount ||
        0
      }`,
    },
    {
      title: t("CARD REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "card")?.totalRefund ||
        0
      )?.toFixed(2)}`,
      desc: `${t("CARD COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "card")?.refundCount ||
        0
      }`,
    },
  ];

  const refundWalletCreditRowData = [
    {
      title: t("WALLET REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "wallet")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "wallet")
          ?.refundCount || 0
      }`,
    },
    {
      title: t("CREDIT REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "credit")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("WALLET COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "credit")
          ?.refundCount || 0
      }`,
    },
  ];

  const refundJahezNinjaRowData = [
    {
      title: t("JAHEZ REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "jahez")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("JAHEZ COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "jahez")
          ?.refundCount || 0
      }`,
    },
    {
      title: t("NINJA REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "ninja")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("NINJA COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "ninja")
          ?.refundCount || 0
      }`,
    },
  ];

  const refundCareemChefRowData = [
    {
      title: t("CAREEM REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "careem")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("CAREEM COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "careem")
          ?.refundCount || 0
      }`,
    },
    {
      title: t("THE CHEF REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "thechef")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("THE CHEF COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "thechef")
          ?.refundCount || 0
      }`,
    },
  ];

  const refundToYouBarakahRowData = [
    {
      title: t("TOYOU REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "toyou")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("TOYOU COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "toyou")
          ?.refundCount || 0
      }`,
    },
    {
      title: t("BARAKAH REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "barakah")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("BARAKAH COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "barakah")
          ?.refundCount || 0
      }`,
    },
  ];

  const refundHungerSation = [
    {
      title: t("HUNGER STATION REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "hungerstation")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("HUNGER STATION COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "hungerstation")
          ?.refundCount || 0
      }`,
    },
    {
      title: t("NEARPAY REFUND"),
      amount: `${(
        getRefundCountAndTotal(salesSummary?.refundData, "nearpay")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
      desc: `${t("NEARPAY COUNT")}: ${
        getRefundCountAndTotal(salesSummary?.refundData, "nearpay")
          ?.refundCount || 0
      }`,
    },
  ];

  const detailsData = [
    {
      title: t("Discounts"),
      value: `${currency} ${(salesSummary?.discount || 0)?.toFixed(2)}`,
    },
    {
      title: t("Refunds"),
      value: `${currency} ${(
        (salesSummary?.refundInCash || 0) +
        (salesSummary?.refundInCard || 0) +
        (salesSummary?.refundInWallet || 0) +
        (salesSummary?.refundInCredit || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("Charges"),
      info: t("info_msg_charges_in_sales_summary_report"),
      value: `${currency} ${(
        (salesSummary?.charges || 0) - (salesSummary?.refundedCharges || 0)
      )?.toFixed(2)}`,
    },
  ];

  const salesData = [
    {
      title: t("Net Sales"),
      value: `${currency} ${(
        (salesSummary?.netSales || 0) +
        (salesSummary?.chargesWithoutVat || 0) -
        (salesSummary?.refundedCharges || 0) +
        (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("VAT"),
      value: `${currency} ${(
        (salesSummary?.totalVat || 0) - (salesSummary?.refundedVatOnCharge || 0)
      )?.toFixed(2)}`,
    },
    {
      title: t("Total Sales"),
      value: `${currency} ${(
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
      value: `${currency} ${(salesSummary?.walkin?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.walkin?.count || 0}`,
    },
    {
      title: salesSummary?.pickup?.name,
      value: `${currency} ${(salesSummary?.pickup?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.pickup?.count || 0}`,
    },
    {
      title: salesSummary?.delivery?.name,
      value: `${currency} ${(salesSummary?.delivery?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.delivery?.count || 0}`,
    },
  ];

  const restaurantOrderTypesData = [
    {
      title: salesSummary?.pickup?.name,
      value: `${currency} ${(salesSummary?.pickup?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.pickup?.count || 0}`,
    },
    {
      title: salesSummary?.["dine-in"]?.name,
      value: `${currency} ${(salesSummary?.["dine-in"]?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.["dine-in"]?.count || 0}`,
    },
    {
      title: salesSummary?.delivery?.name,
      value: `${currency} ${(salesSummary?.delivery?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.delivery?.count || 0}`,
    },
    {
      title: salesSummary?.takeaway?.name,
      value: `${currency} ${(salesSummary?.takeaway?.amount || 0)?.toFixed(
        2
      )}, ${t("Orders")}: ${salesSummary?.takeaway?.count || 0}`,
    },
  ];

  const paymentData = [
    {
      title: t("Cash"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "cash")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Card"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "card")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Wallet"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "wallet")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Credit"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "credit")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("HungerStation"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "hungerstation")
          ?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Jahez"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "jahez")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Ninja"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "ninja")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Careem"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "careem")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("The Chef"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "thechef")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("ToYou"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "toyou")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Barakah"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "barakah")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Nearpay"),
      value: `${currency} ${(
        getCountAndTotal(salesSummary?.txnStats, "nearpay")?.totalPayments || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Total Payments"),
      value: `${currency} ${(
        (getCountAndTotal(salesSummary?.txnStats, "cash")?.totalPayments || 0) +
          (getCountAndTotal(salesSummary?.txnStats, "card")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "wallet")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "credit")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "hungerstation")
            ?.totalPayments || 0) +
          (getCountAndTotal(salesSummary?.txnStats, "toyou")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "barakah")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "ninja")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "jahez")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "thechef")?.totalPayments ||
            0) +
          (getCountAndTotal(salesSummary?.txnStats, "careem")?.totalPayments ||
            0) +
          getCountAndTotal(salesSummary?.txnStats, "nearpay")?.totalPayments ||
        0
      )?.toFixed(2)}`,
    },
  ];

  const refundData = [
    {
      title: t("Cash"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "cash")?.totalRefund ||
        0
      )?.toFixed(2)}`,
    },
    {
      title: t("Card"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "card")?.totalRefund ||
        0
      )?.toFixed(2)}`,
    },
    {
      title: t("Wallet"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "wallet")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Credit"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "credit")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("HungerStation"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "hungerstation")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Jahez"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "jahez")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Ninja"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "ninja")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Careem"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "careem")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("The Chef"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "thechef")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("ToYou"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "toyou")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Barakah"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "barakah")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Nearpay"),
      value: `${currency} ${(
        getRefundCountAndTotal(salesSummary?.refundData, "nearpay")
          ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
    {
      title: t("Total Refunds"),
      value: `${currency} ${(
        (getRefundCountAndTotal(salesSummary?.refundData, "cash")
          ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "card")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "wallet")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "credit")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "hungerstation")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "toyou")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "barakah")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "ninja")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "jahez")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "thechef")
            ?.totalRefund || 0) +
          (getRefundCountAndTotal(salesSummary?.refundData, "careem")
            ?.totalRefund || 0) +
          getRefundCountAndTotal(salesSummary?.refundData, "nearpay")
            ?.totalRefund || 0
      )?.toFixed(2)}`,
    },
  ];

  const printReceipt = async () => {
    console.log("printing");
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
      refundInNearpay: (
        getRefundCountAndTotal(salesSummary?.refundData, "nearpay")
          ?.totalRefund || 0
      ).toFixed(2),
      refundCountInNearpay:
        getRefundCountAndTotal(salesSummary?.refundData, "nearpay")
          ?.refundCount || 0,
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
      txnWithNearpay: Number(
        getCountAndTotal(salesSummary?.txnStats, "nearpay")?.totalPayments || 0
      )?.toFixed(2),
      txnCountInNearpay:
        getCountAndTotal(salesSummary?.txnStats, "nearpay")?.noOfPayments || 0,
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
      txnStats: salesSummary?.txnStats || [],
      refundData: salesSummary?.refundData || [],
    };

    const allprinter = await repository.printerRepository.findByType("inbuilt");
    const printer = allprinter.find((t) => t.enableReceipts);

    if (printer) {
      try {
        if (printer.device_id === "sunmi") {
          if (
            printer?.printerSize === "2 Inch" ||
            printer?.printerSize === "2-inch"
          ) {
            await printTransactionSunmi2Inch(printData as any);
          } else {
            await printTransactionSunmi3Inch(printData as any);
          }
        }
      } catch (error) {}
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

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`sales-summary-report`);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoader(!loader);
    }, 3000);
  }, []);

  if (!salesSummary && !loading && !isFetching && !loader) {
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DefaultText style={{ fontSize: 24 }}>
          {t(
            "We're having trouble reaching our servers, Please check your internet connection"
          )}
        </DefaultText>
      </View>
    );
  }

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
      text = `${t("Reports are not available on offline mode")}. ${t(
        "Please go online"
      )}.`;
    } else {
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
                title={t("Printer")}
                onPress={() => {
                  try {
                    printReceipt();
                  } catch (error) {
                    console.log("error", error);
                  }
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
                  try {
                    printReceipt();
                  } catch (error) {
                    console.log("error", error);
                  }
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
          <SeparatorHorizontalView />

          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {paymentJahezNinja.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < paymentJahezNinja.length - 1 &&
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
            {paymentTypeCareemTheChef.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < paymentTypeCareemTheChef.length - 1 &&
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
            {paymentTypeToYouBarakah.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < paymentTypeToYouBarakah.length - 1 &&
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
            {paymentTypeHungerStation.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < paymentTypeHungerStation.length - 1 &&
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
          <SeparatorHorizontalView />

          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {refundJahezNinjaRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < refundJahezNinjaRowData.length - 1 &&
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
            {refundCareemChefRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < refundCareemChefRowData.length - 1 &&
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
            {refundToYouBarakahRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < refundToYouBarakahRowData.length - 1 &&
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
            {refundHungerSation.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < refundHungerSation.length - 1 &&
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
