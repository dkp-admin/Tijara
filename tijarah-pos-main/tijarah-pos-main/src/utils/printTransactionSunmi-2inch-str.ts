import SunmiV2Printer from "react-native-sunmi-v2-printer";
import { debugLog } from "./log-patch";

function constructString(leftText: any, rightText: any) {
  const totalLength = 33;
  let spaceLength = totalLength - leftText.length - rightText.length;

  if (spaceLength < 0) {
    spaceLength = 0; // Or handle this case as needed
  }

  return leftText + " ".repeat(spaceLength) + rightText;
}

export async function printTransactionSunmi2Inch(data: any) {
  debugLog(
    "Sunmi 2 inch transaction print started",
    data,
    "transaction-print-sunmi-2-Inch",
    "printTransactionSunmi2InchFunction"
  );

  let headerContent = "";

  // Header Section
  headerContent += `${data.user.name}\n${data.location.name}\n`;

  // Invoice Details
  let receiptContent = "----------------------------------\n";

  receiptContent += `Sales Summary\nملخص المبيعات\n           ${data.startDate}\n         to ${data.endDate}\n`;

  // Sales Details
  receiptContent +=
    "----------------------------------\n           Sales Details\nتفاصيل المبيعات           \n----------------------------------\n";

  receiptContent +=
    constructString("Total Sales", `SAR ${data.totalRevenue.toString()}`) +
    "\n";
  receiptContent += `إجمالي المبيعات\n`;
  receiptContent +=
    constructString("Net Sales", `SAR ${data.netSales.toString()}`) + "\n";
  receiptContent += `صافي المبيعات\n`;
  receiptContent +=
    constructString("Total VAT", `SAR ${data.totalVat.toString()}`) + "\n";
  receiptContent += `إجمالي الضريبة\n`;
  receiptContent +=
    constructString("Discounts", `SAR ${data.discount.toString()}`) + "\n";
  receiptContent += `الخصومات\n`;
  receiptContent +=
    constructString("Charges", `SAR ${data.charges.toString()}`) + "\n";
  receiptContent += `رسوم\n`;
  receiptContent += constructString("Total Order", `${data.totalOrder}`) + "\n";
  receiptContent += `مجموع الطلب\n`;
  receiptContent +=
    constructString("No. of discount", `${data.noOfDiscount}`) + "\n";
  receiptContent += `رقم الخصم\n`;
  receiptContent += constructString("Total Shift", `${data.totalShift}`) + "\n";
  receiptContent += `إجمالي المناوبة\n`;
  receiptContent += constructString("Cashiers", ` ${data.cashiers}`) + "\n";
  receiptContent += `الصرافين\n`;

  // Transaction Details
  receiptContent +=
    "----------------------------------\n        Transaction Details\nتفاصيل المعاملة            \n----------------------------------\n";

  receiptContent +=
    constructString("Card Transaction", `SAR ${data.txnWithCard.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.txnCountInCard}\n`);
  receiptContent += `معاملات البطاقة\n`;
  receiptContent +=
    constructString("Cash Transaction", `SAR ${data.txnWithCash.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.txnCountInCash}\n`);
  receiptContent += `نقداً المحفظة\n`;
  receiptContent +=
    constructString(
      "Wallet Transaction",
      `SAR ${data.txnWithWallet.toString()}`
    ) + "\n";
  receiptContent += constructString(``, `Count: ${data.txnCountInWallet}\n`);
  receiptContent += `معاملات المحفظة\n`;
  receiptContent +=
    constructString(
      "Credit Transaction",
      `SAR ${data.txnWithCredit.toString()}`
    ) + "\n";
  receiptContent += constructString(``, `Count: ${data.txnCountInCredit}\n`);
  receiptContent += `المعاملات الائتمانية\n`;

  // Refund Details
  receiptContent +=
    "----------------------------------\n           Refund Details\nتفاصيل استرداد الأموال         \n----------------------------------\n";

  receiptContent +=
    constructString("Card Refund", `SAR ${data.refundInCard.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInCard}\n`);
  receiptContent += `المسترجع بالبطاقة\n`;
  receiptContent +=
    constructString("Cash Refund", `SAR ${data.refundInCash.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInCash}\n`);
  receiptContent += `المسترجع نقداً\n`;
  receiptContent +=
    constructString("Wallet Refund", `SAR ${data.refundInWallet.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInWallet}\n`);
  receiptContent += `المسترجع بالمحفظة\n`;
  receiptContent +=
    constructString("Credit Refund", `SAR ${data.refundInCredit.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInCredit}\n`);
  receiptContent += `استرداد الائتمان\n`;

  // Order Type
  receiptContent +=
    "----------------------------------\n            Order Type\nنوع الطلب             \n----------------------------------\n";

  if (data?.showWalkin) {
    receiptContent +=
      constructString("Walk-in", `SAR ${data.walkin?.amount.toString()}`) +
      "\n";
    receiptContent += constructString(``, `Count: ${data.walkin?.count}\n`);
    receiptContent += `في المتجر\n`;
  }
  if (data?.showDinein) {
    receiptContent +=
      constructString("Dine-in", `SAR ${data.dinein?.amount.toString()}`) +
      "\n";
    receiptContent += constructString(``, `Count: ${data.dinein?.count}\n`);
    receiptContent += `محلي\n`;
  }
  if (data?.showTakeaway) {
    receiptContent +=
      constructString("Takeaway", `SAR ${data.takeaway?.amount.toString()}`) +
      "\n";
    receiptContent += constructString(``, `Count: ${data.takeaway?.count}\n`);
    receiptContent += `سفري\n`;
  }
  receiptContent +=
    constructString("Pickup", `SAR ${data.pickup?.amount.toString()}`) + "\n";
  receiptContent += constructString(``, `Count: ${data.pickup?.count}\n`);
  receiptContent += `استلام\n`;
  receiptContent +=
    constructString("Delivery", `SAR ${data.delivery?.amount.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.delivery?.count}\n`);
  receiptContent += `توصيل\n`;
  receiptContent += "----------------------------------\n";

  // Printed Details
  receiptContent += constructString("Printed on", `${data.printedOn}`) + "\n";
  receiptContent += `طبع على\n`;
  receiptContent += constructString("Printed by", `${data.printedBy}`) + "\n";
  receiptContent += `طبع بواسطة\n`;
  receiptContent +=
    constructString("Printed from", `${data.printedFrom}`) + "\n";
  receiptContent += `طبع من\n`;

  // Footer Section
  let footerContent = `----------------------------------\nThank You\nPowered by Tijarah360\n`;

  // Printing
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(headerContent);
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText(footerContent);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");

  debugLog(
    "Sunmi 2 inch transaction print completed",
    data,
    "transaction-print-sunmi-2-Inch",
    "printTransactionSunmi2InchFunction"
  );
}
