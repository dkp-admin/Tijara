import * as ExpoPrintHelp from "expo-print-help";
import { useCurrency } from "../store/get-currency";

const SunmiV2Printer = ExpoPrintHelp;

function constructString(leftText: any, rightText: any) {
  const totalLength = 51;
  let spaceLength = totalLength - leftText.length - rightText.length;

  if (spaceLength < 0) {
    spaceLength = 0; // Or handle this case as needed
  }

  return leftText + " ".repeat(spaceLength) + rightText;
}

function centerAlignText(text: string, totalLength = 48) {
  const textLength = text.length;
  const spaceOnEachSide = (totalLength - textLength) / 2;
  const padding = " ".repeat(Math.max(0, Math.floor(spaceOnEachSide)));

  return padding + text + padding + (spaceOnEachSide % 1 ? " " : ""); // Add an extra space if padding is not whole number
}

export async function printSunmi4Inch(order: any) {
  console.log(order, "order print with sunni");
  const { currency } = useCurrency();
  let receiptContent = "";

  // Header Section - Centered with respect to 3-inch layout
  // receiptContent += `${" ".repeat((48 - order.location.name.en.length) / 2)}${
  //   order.location.name.en
  // }\n`;
  // receiptContent += `${" ".repeat((48 - order.location.name.ar.length) / 2)}${
  //   order.location.name.ar
  // }\n\n`;
  await SunmiV2Printer.printOriginalText("\n\n\n");

  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(`${order.location.name.en}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.name.ar}\n`);
  await SunmiV2Printer.setFontSize(22);

  // VAT, Phone, and Address - Left-aligned with padding for clarity
  if (order.location.vat?.length > 0) {
    receiptContent += centerAlignText("VAT No. " + order.location.vat) + "\n";
  }
  receiptContent += centerAlignText("PH No. " + order.location.phone) + "\n";
  receiptContent += `${centerAlignText(order.location.address)}\n`; // Assuming address is a single line
  receiptContent += "---------------------------------------------------\n";

  // Invoice Details
  receiptContent += `${constructString(
    "Invoice No.# ",
    `${order.orderNum}`
  )}\nفاتورة# \n${constructString(
    "Date And Time:",
    `${order.createdAt}`
  )}\nالتاريخ و الوقت\n`;
  receiptContent += "---------------------------------------------------\n";

  // Customer Details
  if (order.customer?.name?.length > 0) {
    receiptContent += `Customer ${order.customer.name}\n`;
  }
  if (order.customer?.vat) {
    receiptContent += `Customer VAT ${order.customer.vat}\n`;
  }

  // Token Number and Order Type
  if (order.showToken || order.orderType?.length > 0) {
    receiptContent += "---------------------------------------------------\n";
    if (order.showToken) {
      receiptContent += `${centerAlignText(`Token: ${order.tokenNumber}`)}\n`;
    }
    if (order.orderType?.length > 0) {
      receiptContent += `${centerAlignText(`Type: ${order.orderType}`)}\n`;
    }
  }

  // Items Header
  receiptContent += "---------------------------------------------------\n";
  receiptContent += "Description         Qty      Unit Price    Total\n";
  receiptContent += "---------------------------------------------------\n";

  // Items
  order.items.forEach((item: any) => {
    const itemDesc = `${item.name.en
      .substring(0, 20)
      .padEnd(20)} ${item.quantity
      .toString()
      .padStart(4)} ${item.variant.sellingPrice
      .toString()
      .padStart(10)} ${item.billing.total.toString().padStart(10)}`;
    receiptContent += `${itemDesc}\n`;
    receiptContent += `${item.name.ar}\n\n`; // Assuming Arabic name is under English name
  });
  receiptContent += "---------------------------------------------------\n";

  receiptContent +=
    constructString(
      "Items Total",
      `${currency} ${order.payment.subTotalWithoutDiscount.toString()}`
    ) + "\n";
  // Discounts and Totals
  if (order.payment.discountAmount > 0) {
    receiptContent +=
      constructString(
        "Total Discount",
        `${currency} ${order.payment.discountAmount.toString()}`
      ) + "\n";
  }
  receiptContent +=
    constructString(
      "Total Taxable Amount",
      `${currency} ${order.payment.subTotal.toString()}`
    ) + "\nإجمالي المبلغ الخاضع للضريبة\n";

  // Custom Charges
  order.payment?.charges.forEach((breakup: any) => {
    receiptContent +=
      constructString(
        breakup.name.en,
        `${currency} ${breakup.total.toString()}`
      ) + "\n";
  });
  receiptContent +=
    constructString(
      "Total Vat",
      `${currency} ${order.payment.vatAmount.toString()}`
    ) + "\nإجمالي ضريبة القيمة المضافة\n";
  receiptContent += "---------------------------------------------------\n";
  receiptContent +=
    constructString(
      "Total Amount",
      `${currency} ${order.payment.total.toString()}`
    ) + "\nالمبلغ الإجمالي\n";
  receiptContent += "---------------------------------------------------\n";

  // Payment Breakup - Example: Cash, Card
  order.payment.breakup.forEach((breakup: any) => {
    receiptContent +=
      constructString(breakup.name, `${currency} ${breakup.total.toString()}`) +
      "\n";
  });

  // Special Instructions
  if (order?.specialInstructions?.length > 0) {
    receiptContent += "---------------------------------------------------\n";
    receiptContent += `Special Instructions\n`;
    receiptContent += `تعليمات خاصة\n`;
    receiptContent += `${order.specialInstructions}\n`;
    receiptContent += "---------------------------------------------------\n";
  }

  // Footer Section
  if (order.location.customText?.length > 0) {
    receiptContent += `${order.location.customText}\n`;
  }
  if (order.location.returnPolicy?.length > 0) {
    receiptContent += `${order.location.returnPolicy}\n`;
  }
  const footer =
    order.location.invoiceFooter?.length > 0
      ? order.location.invoiceFooter
      : centerAlignText("Thank You");
  receiptContent += "---------------------------------------------------\n";
  receiptContent += `${footer}\n`;
  receiptContent += "---------------------------------------------------\n";
  receiptContent += centerAlignText("Powered by Tijarah360") + "\n";
  receiptContent += "---------------------------------------------------\n";

  // Printing

  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printQrCode(order.qr, 4, 3);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printBarcode(order.orderNum, 8, 100, 200, 2);
  await SunmiV2Printer.printOriginalText("\n\n\n\n......\n\n\n\n");
  await SunmiV2Printer.cutSunmi();
}
