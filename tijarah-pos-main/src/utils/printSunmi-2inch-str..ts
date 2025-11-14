import SunmiV2Printer from "react-native-sunmi-v2-printer";

function constructString(leftText: any, rightText: any) {
  const totalLength = 33;
  let spaceLength = totalLength - leftText.length - rightText.length;

  if (spaceLength < 0) {
    spaceLength = 0; // Or handle this case as needed
  }

  return leftText + " ".repeat(spaceLength) + rightText;
}

export async function printSunmi(order: any) {
  let receiptContent = "";

  // Header Section
  receiptContent += `              ${order.location.en}\n              ${order.location.ar}\n`;

  // VAT, Phone, and Address
  if (order?.location?.vat?.length > 0) {
    receiptContent += `          VAT No. ${order.location.vat}\n`;
  }
  receiptContent += `           PH No. ${order.location.phone}\n              ${order.location.address}\n----------------------------------\n`;

  // Invoice Details
  receiptContent += `${constructString(
    "Invoice",
    `${order.orderNum}`
  )}\nفاتورة \nDate & Time\nالتاريخ و الوقت \n            ${order.createdAt}\n`;

  // Customer Details
  if (order?.customer?.name?.length > 0) {
    receiptContent += `Customer                   ${order.customer.name}\nالعميل \n`;
  }
  if (order?.customer?.vat?.length > 0) {
    receiptContent += `Customer VAT         ${order.customer.vat}\nالعميل VAT \n`;
  }

  // Token Number and Order Type
  if (order?.tokenNumber?.length > 0 || order?.orderType?.length > 0) {
    receiptContent += "----------------------------------\n";
    if (order?.tokenNumber?.length > 0) {
      receiptContent += `${order.tokenNumber}\n`;
    }
    if (order?.orderType?.length > 0) {
      receiptContent += `${order.orderType}\n`;
    }
  }

  // Items Header
  receiptContent +=
    "----------------------------------\n      Simplified Tax Invoice\nفاتورة ضريبية مبسطة          \n----------------------------------\nDescription فاتورة ضريبية مبسطة\nUnit Price          Qty      Total\nإجمالي      الكمية         سعر الوحدة\n----------------------------------\n";

  // Items
  order.items.forEach((it: any) => {
    receiptContent += `${it.name.en}\n${it.name.ar}\n${it.variant.sellingPrice}               ${it.quantity}      ${it.billing.total}\n----------------------------------\n`;
  });

  // Discounts and Totals
  if (order.payment.discountAmount > 0) {
    receiptContent +=
      constructString(
        "Items Total",
        order.payment.subTotalWithoutDiscount.toString()
      ) + "\n";
    receiptContent +=
      constructString(
        "Total Discount",
        order.payment.discountAmount.toString()
      ) + "\n";
  }

  receiptContent +=
    constructString("Total Taxable Amount", order.payment.subTotal.toString()) +
    "\n";

  order.payment?.charges?.forEach((breakup: any) => {
    receiptContent +=
      constructString(breakup.name.en, breakup.total.toString()) + "\n";
  });

  receiptContent += "إجمالي المبلغ الخاضع للضريبة \n";
  receiptContent +=
    constructString("Total Vat", order.payment.vatAmount.toString()) +
    "\nإجمالي ضريبة القيمة المضافة \n---------------------------------\n";
  receiptContent +=
    constructString("Total Amount", order.payment.total.toString()) +
    "\nالمبلغ الإجمالي\n---------------------------------\n";

  // Payment Breakup
  order.payment.breakup.forEach((breakup: any) => {
    receiptContent +=
      constructString(breakup.name, breakup.total.toString()) + "\n";
  });

  // Footer Section
  receiptContent += "----------------------------------\n";
  if (order.location?.customText && order.location?.customText?.length > 0) {
    receiptContent += `${order.location.customText}\n----------------------------------\n`;
  }
  if (
    order.location?.returnPolicy &&
    order.location?.returnPolicy?.length > 0
  ) {
    receiptContent += `${order.location.returnPolicy}\n----------------------------------\n`;
  }

  let footer =
    order.location?.invoiceFooter?.length > 0
      ? order.location.invoiceFooter
      : "          Thank You";
  receiptContent += `${footer}\n`;

  // Printing
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printQRCode(order.qr, 8, 8);
  await SunmiV2Printer.printBarCode(order.orderNum, 8, 100, 200, 2);
}
