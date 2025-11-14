import LandiPosPrinter, { Align } from "react-native-landipos";
import { ToastAndroid } from "react-native";

enum TextAlign {
  LEFT = 0,
  CENTER = 1,
  RIGHT = 2,
}

function constructString(leftText: any, rightText: any) {
  const totalLength = 35; // Changed to new receipt width
  // Convert inputs to strings and trim if needed
  const leftStr = String(leftText).substring(0, Math.floor(totalLength * 0.6)); // Allow 60% for left text
  const rightStr = String(rightText).substring(
    0,
    Math.floor(totalLength * 0.4)
  ); // Allow 40% for right text

  const spaceLength = totalLength - leftStr.length - rightStr.length;

  if (spaceLength < 1) {
    return (
      leftStr.substring(0, totalLength - rightStr.length - 1) + " " + rightStr
    );
  }

  return leftStr + " ".repeat(spaceLength) + rightStr;
}

function centerAlignText(text: string, totalLength = 35) {
  // Changed default width
  const textStr = String(text);
  const textLength = textStr.length;

  if (textLength >= totalLength) {
    return textStr.substring(0, totalLength);
  }

  const spaceOnEachSide = (totalLength - textLength) / 2;
  const leftPadding = " ".repeat(Math.floor(spaceOnEachSide));
  const rightPadding = " ".repeat(Math.ceil(spaceOnEachSide));

  return leftPadding + textStr + rightPadding;
}

export async function printLandiPos(order: any) {
  let receiptContent = "";

  // Header Section - Centered with respect to 3-inch layout
  // receiptContent += `${" ".repeat((48 - order.location.name.en.length) / 2)}${
  //   order.location.name.en
  // }\n`;
  // receiptContent += `${" ".repeat((48 - order.location.name.ar.length) / 2)}${
  //   order.location.name.ar
  // }\n\n`;

  let headerContent = `${order.location.name.en}\n${order.location.name.ar}\n`;

  // VAT, Phone, and Address - Left-aligned with padding for clarity
  if (order.location.vat?.length > 0) {
    receiptContent += centerAlignText("VAT No. " + order.location.vat) + "\n";
  }
  receiptContent += centerAlignText("PH No. " + order.location.phone) + "\n";
  receiptContent += `${centerAlignText(order.location.address)}\n`; // Assuming address is a single line
  receiptContent += "------------------------------------------------\n";

  // Invoice Details
  receiptContent += `${constructString(
    "Invoice# ",
    `${order.orderNum}`
  )}\nفاتورة# \n${constructString(
    "Date And Time:",
    `${order.createdAt.substring(0, 10)}`
  )}\nالتاريخ و الوقت\n`;
  receiptContent += "------------------------------------------------\n";

  // Customer Details
  if (order.customer?.name?.length > 0) {
    receiptContent += constructString("Customer", order.customer.name) + "\n";
  }
  if (order.customer?.vat?.length > 0) {
    receiptContent +=
      constructString("Customer VAT", order.customer.vat) + "\n";
  }

  // Token Number and Order Type
  if (order.showToken || order.orderType?.length > 0) {
    receiptContent += "------------------------------------------------\n";
    if (order.showToken) {
      receiptContent += `${centerAlignText(`Token: ${order.tokenNumber}`)}\n`;
    }
    if (order.orderType?.length > 0) {
      receiptContent += `${centerAlignText(`Type: ${order.orderType}`)}\n`;
    }
  }

  // Items Header
  receiptContent += "------------------------------------------------\n";
  receiptContent += "Description         Qty  Unit Price   Total\n";
  receiptContent += "------------------------------------------------\n";

  // Items
  order.items.forEach((item: any) => {
    const itemDesc = `${item.name.en.substring(0, 20)}          ${
      item.quantity
    }   ${item.variant.sellingPrice}   ${item.billing.total}`;
    receiptContent += `${itemDesc}\n`;
    receiptContent += `${item.name.ar}\n\n`; // Assuming Arabic name is under English name
  });
  receiptContent += "------------------------------------------------\n";

  receiptContent +=
    constructString(
      "Items Total",
      `SAR ${order.payment.subTotalWithoutDiscount.toString()}`
    ) + "\n";
  // Discounts and Totals
  if (order.payment.discountAmount > 0) {
    receiptContent +=
      constructString(
        "Total Discount",
        `SAR ${order.payment.discountAmount.toString()}`
      ) + "\n";
  }
  receiptContent +=
    constructString(
      "Total Taxable Amount",
      `SAR ${order.payment.subTotal.toString()}`
    ) + "\nإجمالي المبلغ الخاضع للضريبة\n";

  // Custom Charges
  order.payment?.charges.forEach((breakup: any) => {
    receiptContent +=
      constructString(breakup.name.en, `SAR ${breakup.total.toString()}`) +
      "\n";
  });
  receiptContent +=
    constructString("Total Vat", `SAR ${order.payment.vatAmount.toString()}`) +
    "\nإجمالي ضريبة القيمة المضافة\n";
  receiptContent += "------------------------------------------------\n";
  receiptContent +=
    constructString("Total Amount", `SAR ${order.payment.total.toString()}`) +
    "\nالمبلغ الإجمالي\n";
  receiptContent += "------------------------------------------------\n";

  // Payment Breakup - Example: Cash, Card
  order.payment.breakup.forEach((breakup: any) => {
    receiptContent +=
      constructString(breakup.name, `SAR ${breakup.total.toString()}`) + "\n";
  });

  // Special Instructions
  if (order?.specialInstructions?.length > 0) {
    receiptContent += "------------------------------------------------\n";
    receiptContent += `Special Instructions\n`;
    receiptContent += `تعليمات خاصة\n`;
    receiptContent += `${order.specialInstructions}\n`;
    receiptContent += "------------------------------------------------\n";
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
  receiptContent += "------------------------------------------------\n";
  receiptContent += `${footer}\n`;
  receiptContent += "------------------------------------------------\n";
  receiptContent += centerAlignText("Powered by Tijarah360") + "\n";
  receiptContent += "------------------------------------------------\n";

  ToastAndroid.show("Landi POS order print starting", ToastAndroid.SHORT);

  try {
    await LandiPosPrinter.initDriver();
    const printerId = await LandiPosPrinter.initPrinter();
    ToastAndroid.show(
      "Landi POS printer initialized: " + printerId,
      ToastAndroid.SHORT
    );

    await LandiPosPrinter.addText(printerId, headerContent, TextAlign.CENTER);
    await LandiPosPrinter.addText(printerId, receiptContent, TextAlign.LEFT);
    await LandiPosPrinter.addQRCode(printerId, order.qr, 200, TextAlign.CENTER);
    await LandiPosPrinter.addText(printerId, "\n\n", TextAlign.CENTER);
    await LandiPosPrinter.addBarcode(
      printerId,
      order.orderNum,
      400,
      100,
      TextAlign.CENTER,
      0
    );
    await LandiPosPrinter.addText(printerId, "\n\n", TextAlign.CENTER);
    await LandiPosPrinter.addText(printerId, footer, TextAlign.CENTER);
    await LandiPosPrinter.addText(
      printerId,
      "\n\n\n\n\n\n\n",
      TextAlign.CENTER
    );
    await LandiPosPrinter.startPrinting(printerId);
    ToastAndroid.show("Landi POS order print completed", ToastAndroid.SHORT);
  } catch (error: any) {
    ToastAndroid.show(
      "Landi POS order print failed" + error.message,
      ToastAndroid.SHORT
    );
  }
  // Printing
}
