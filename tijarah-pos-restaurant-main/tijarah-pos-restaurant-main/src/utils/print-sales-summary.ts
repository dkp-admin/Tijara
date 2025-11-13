import { endOfDay, format, startOfDay } from "date-fns";
import { EventRegister } from "react-native-event-listeners";
import repository from "../db/repository";
import { printTransactionSunmi2Inch } from "./printTransactionSunmi-2inch-str";
import { printTransactionSunmi3Inch } from "./printTransactionSunmi3inch";

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

export const printReceipt = async (
  salesSummary: any,
  reportFilter: any,
  authContext: any,
  deviceContext: any,
  billingSettings: any
) => {
  const restaurant =
    deviceContext.user.company.industry?.toLowerCase() === "restaurant";

  let fromDate = reportFilter?.dateRange?.from
    ? new Date(reportFilter.dateRange.from)
    : startOfDay(new Date());
  let toDate = reportFilter?.dateRange?.to
    ? new Date(reportFilter.dateRange.to)
    : endOfDay(new Date());

  if (isNaN(fromDate.getTime())) fromDate = startOfDay(new Date());
  if (isNaN(toDate.getTime())) toDate = endOfDay(new Date());

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
    refundInStcPay: (
      getRefundCountAndTotal(salesSummary?.refundData, "stcpay")?.totalRefund ||
      0
    ).toFixed(2),
    refundCountInStcPay:
      getRefundCountAndTotal(salesSummary?.refundData, "stcpay")?.refundCount ||
      0,
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
    txnWithCard: Number(
      getCountAndTotal(salesSummary?.txnStats, "card")?.balanceAmount || 0
    )?.toFixed(2),
    txnWithCash: Number(
      getCountAndTotal(salesSummary?.txnStats, "cash")?.balanceAmount || 0
    )?.toFixed(2),
    txnWithWallet: Number(
      getCountAndTotal(salesSummary?.txnStats, "wallet")?.balanceAmount || 0
    )?.toFixed(2),
    txnWithCredit: Number(
      getCountAndTotal(salesSummary?.txnStats, "credit")?.balanceAmount || 0
    )?.toFixed(2),
    txnWithNearpay: Number(
      getCountAndTotal(salesSummary?.txnStats, "nearpay")?.balanceAmount || 0
    )?.toFixed(2),
    txnCountInNearpay:
      getCountAndTotal(salesSummary?.txnStats, "nearpay")?.noOfPayments || 0,
    txnWithStcPay: Number(
      getCountAndTotal(salesSummary?.txnStats, "stcpay")?.balanceAmount || 0
    )?.toFixed(2),
    txnCountInStcPay:
      getCountAndTotal(salesSummary?.txnStats, "stcpay")?.noOfPayments || 0,
    txnCountInCard:
      getCountAndTotal(salesSummary?.txnStats, "card")?.noOfPayments || 0,
    txnCountInCash:
      getCountAndTotal(salesSummary?.txnStats, "cash")?.noOfPayments || 0,
    txnCountInWallet:
      getCountAndTotal(salesSummary?.txnStats, "wallet")?.noOfPayments || 0,
    txnCountInCredit:
      getCountAndTotal(salesSummary?.txnStats, "credit")?.noOfPayments || 0,
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

  const printer = (await repository.printerRepository.findByType(
    "inbuilt"
  )) as any;

  if (printer.length > 0) {
    try {
      if (printer.device_id === "sunmi") {
        if (
          printer?.printerSize === "2 Inch" ||
          printer?.printerSize === "2-inch"
        ) {
          await printTransactionSunmi2Inch(
            printData as any,
            billingSettings as any
          );
        } else {
          await printTransactionSunmi3Inch(printData as any);
        }
      }
    } catch (error) {}
  } else {
    EventRegister.emit("print-transaction", printData);
  }
};
