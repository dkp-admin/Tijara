import * as ExpoPrintHelp from "expo-print-help";
import { useCurrency } from "../store/get-currency";

const SunmiV2Printer = ExpoPrintHelp;

function constructString(leftText: any, rightText: any) {
  const totalLength = 33;
  let spaceLength = totalLength - leftText.length - rightText.length;

  if (spaceLength < 0) {
    spaceLength = 0; // Or handle this case as needed
  }

  return leftText + " ".repeat(spaceLength) + rightText;
}

export async function printSunmi2Inch(order: any) {
  try {
    const { currency } = useCurrency();
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

    receiptContent += `Invoice No.\nفاتورة\n#${order.orderNum}\nDate & Time\nالتاريخ و الوقت\n           ${order.createdAt}\n`;

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
      "----------------------------------\n       Simplified Tax Invoice\nفاتورة ضريبية مبسطة         \n----------------------------------\nDescription      فاتورة ضريبية مبسطة\nUnit Price          Qty      Total\nإجمالي      الكمية          سعر الوحدة\n----------------------------------\n";

    // Items
    order.items.forEach((it: any) => {
      receiptContent += `${it.name.en}\n${it.name.ar}\n${
        it?.modifierName ? `${it.modifierName}\n` : ""
      }${it.variant.sellingPrice?.toFixed(2)}               ${
        it.quantity
      }      ${it.billing.total}\n`;
    });

    receiptContent += `----------------------------------\n`;

    // Discounts and Totals
    if (order.payment.discountAmount > 0) {
      receiptContent +=
        constructString(
          "Items Total",
          `${currency} ${order.payment.subTotalWithoutDiscount.toString()}`
        ) + "\n";
      receiptContent += `إجمالي العناصر\n`;
      receiptContent +=
        constructString(
          "Total Discount",
          `${currency} ${order.payment.discountAmount.toString()}`
        ) + "\n";
      receiptContent += `إجمالي الخصم\n`;
      receiptContent += `----------------------------------\n`;
    }

    receiptContent +=
      constructString(
        "Total Taxable Amount",
        `${currency} ${order.payment.subTotal.toString()}`
      ) + "\n";
    receiptContent += "إجمالي المبلغ الخاضع للضريبة\n";

    order.payment?.charges?.forEach((charge: any) => {
      receiptContent +=
        constructString(
          charge.name.en,
          `${currency} ${charge.total.toString()}`
        ) + "\n";
      receiptContent += `${charge.name.ar}\n`;
    });

    receiptContent +=
      constructString(
        "Total Vat",
        `${currency} ${order.payment.vatAmount.toString()}`
      ) + "\nإجمالي ضريبة القيمة المضافة\n----------------------------------\n";
    receiptContent +=
      constructString(
        "Total Amount",
        `${currency} ${order.payment.total.toString()}`
      ) + "\nالمبلغ الإجمالي\n----------------------------------\n";

    // Payment Breakup
    order.payment.breakup.forEach((breakup: any) => {
      receiptContent +=
        constructString(
          breakup.name,
          `${currency} ${breakup.total.toString()}`
        ) + "\n";
    });

    if (order.payment.breakup?.length > 0) {
      receiptContent += "----------------------------------\n";
    }

    if (order?.specialInstructions?.length > 0) {
      // Special Instructions
      receiptContent += `----------------------------------\n          Special Instructions\n            تعليمات خاصة\n${order.specialInstructions}\n----------------------------------\n`;
    }

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
    await SunmiV2Printer.printQrCode(order.qr, 4, 3);
    await SunmiV2Printer.printOriginalText("\n");
    await SunmiV2Printer.printBarcode(order.orderNum, 8, 100, 200, 2);
    await SunmiV2Printer.printOriginalText(footerContent);
    await SunmiV2Printer.printOriginalText("\n");
    await SunmiV2Printer.printOriginalText("\n");
    await SunmiV2Printer.printOriginalText("\n");
    await SunmiV2Printer.printOriginalText("\n");
  } catch (error) {
    console.log("SUNMI PRINT ERROR:::::::::", error);
  }
}
