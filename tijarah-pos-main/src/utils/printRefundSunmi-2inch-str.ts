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

export async function printRefundSunmi2Inch(order: any) {
  debugLog(
    "Sunmi 2 inch refund print started",
    order,
    "refund-print-sunmi-2-Inch",
    "refundSunmi2InchFunction"
  );

  console.log("items", order.refunds[0].items);

  let headerContent = "";

  // Header Section
  headerContent += `${order.location.name.en}\n${order.location.name.ar}\n`;

  // VAT, Phone, and Address
  if (order?.location?.vat?.length > 0) {
    headerContent += `VAT No. ${order.location.vat}\n`;
  }
  headerContent += `PH No. ${order.location.phone}\n${order.location.address}\n`;

  // Invoice Details
  let receiptContent = "----------------------------------\n";

  // Refund Receipt #
  if (order.refundReceiptNo?.length > 0) {
    receiptContent += `${constructString(
      "Refund Receipt",
      `#${order.refundReceiptNo}`
    )}\nإيصال استرداد\n`;
  }

  receiptContent += `${constructString(
    "Invoice Reference",
    `#${order.orderNum}`
  )}\nمرجع الفاتورة\nDate & Time\nالتاريخ و الوقت\n           ${
    order.createdAt
  }\n`;

  // Customer Details
  if (order?.customer?.name?.length > 0) {
    receiptContent += `${constructString(
      "Customer",
      `${order.customer.name?.trim()}`
    )}\nالعميل\n`;
  }
  if (order?.customer?.vat?.length > 0) {
    receiptContent += `${constructString(
      "Customer VAT",
      `${order.customer.vat}`
    )}\nالعميل VAT\n`;
  }

  // Token Number and Order Type
  if (order?.showToken || order?.orderType?.length > 0) {
    receiptContent += "----------------------------------\n";
    if (order?.showToken) {
      receiptContent += `            ${order.tokenNumber}\n`;
    }
    if (order?.orderType?.length > 0) {
      receiptContent += `            ${order.orderType}\n`;
    }
  }

  // Items Header
  receiptContent +=
    "----------------------------------\n Notice Creditor / Refund Receipt\nإشعار الدائن/إيصال الاسترداد      \n----------------------------------\nDescription      فاتورة ضريبية مبسطة\nUnit Price          Qty      Total\nإجمالي      الكمية          سعر الوحدة\n----------------------------------\n";

  // Items
  order.refunds[0].items.forEach((it: any) => {
    receiptContent += `${it.name.en}\n${it.name.ar}\n${
      it?.modifierName ? `${it.modifierName}\n` : ""
    }${it.unitPrice.toString()}               ${
      it.qty
    }      ${it.amount.toString()}\n`;
  });

  receiptContent += `----------------------------------\n`;

  receiptContent +=
    constructString(
      "Total Taxable Amount",
      `SAR ${order.refunds[0]?.subTotal.toString()}`
    ) + "\n";
  receiptContent += "إجمالي المبلغ الخاضع للضريبة\n";

  order.refunds[0]?.charges?.forEach((charge: any) => {
    receiptContent +=
      constructString(charge.name.en, `SAR ${charge.totalCharge.toString()}`) +
      "\n";
    receiptContent += `${charge.name.ar}\n`;
  });

  receiptContent +=
    constructString("Vat Refund", `SAR ${order.refunds[0].vat.toString()}`) +
    "\nاسترداد\n----------------------------------\n";
  receiptContent +=
    constructString(
      "Total Refund",
      `SAR ${order.refunds[0].amount.toString()}`
    ) + "\nالمبلغ المسترد\n----------------------------------\n";

  // Refund Breakup
  order.refunds[0].refundedTo.forEach((refund: any) => {
    receiptContent +=
      constructString(refund.text, `SAR ${refund.value.toString()}`) + "\n";
  });
  receiptContent += "----------------------------------\n";

  // Footer Section
  if (
    order.location?.returnPolicy &&
    order.location?.returnPolicy?.length > 0
  ) {
    receiptContent += `Return Policy\n${order.location.returnPolicy}\n----------------------------------\n`;
  }

  if (order.location?.customText && order.location?.customText?.length > 0) {
    receiptContent += `${order.location.customText}\n----------------------------------\n`;
  }

  let footerContent =
    order.location?.invoiceFooter?.length > 0
      ? `----------------------------------\n${order.location.invoiceFooter}\n`
      : `----------------------------------\nThank You\n`;
  footerContent += `Powered by Tijarah360\n`;

  // Printing
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(headerContent);
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printBitmap(order.base64qr, 384, 380);
  await SunmiV2Printer.printBarCode(order.orderNum, 8, 100, 200, 2);
  await SunmiV2Printer.printOriginalText(footerContent);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");

  debugLog(
    "Sunmi 2 inch refund print completed",
    order,
    "refund-print-sunmi-2-Inch",
    "refundSunmi2InchFunction"
  );
}
