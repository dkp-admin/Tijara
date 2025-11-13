import * as ExpoPrintHelp from "expo-print-help";
const SunmiV2Printer = ExpoPrintHelp;

function constructString(leftText: any, rightText: any) {
  const totalLength = 48;
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

export async function printSunmRefundi4Inch(order: any) {
  try {
    let receiptContent = "";

    // Header Section - Centered with respect to 3-inch layout
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
    if (order.refundReceiptNo?.length > 0) {
      receiptContent += `${constructString(
        "Refund Receipt",
        `#${order.refundReceiptNo}`
      )}\nإيصال استرداد \n${constructString(
        "Invoice",
        `#${order.orderNum}`
      )}\nفاتورة \n}${constructString(
        "Date And Time:",
        `${order.createdAt.substring(0, 10)}`
      )}\nالتاريخ و الوقت\n`;
    } else {
      receiptContent += `${constructString(
        "Invoice",
        `#${order.orderNum}`
      )}\nفاتورة \n${constructString(
        "Date And Time:",
        `${order.createdAt.substring(0, 10)}`
      )}\nالتاريخ و الوقت\n`;
    }
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
    if (order.tokenNumber?.length > 0 || order.orderType?.length > 0) {
      receiptContent += "------------------------------------------------\n";
      if (order.tokenNumber?.length > 0) {
        receiptContent += `Token: ${order.tokenNumber}\n`;
      }
      if (order.orderType?.length > 0) {
        receiptContent += `Type: ${order.orderType}\n`;
      }
    }

    // Items Header
    receiptContent += "------------------------------------------------\n";
    receiptContent += "Description         Qty  Unit Price   Total\n";
    receiptContent += "------------------------------------------------\n";

    // Items
    order?.refunds?.[0]?.items?.forEach((item: any) => {
      const unitPrice = (item.amount / item.qty).toFixed(2);
      const itemDesc = `${item.name.en.substring(0, 20).padEnd(20)} ${item.qty
        .toString()
        .padStart(4)} ${unitPrice.toString().padStart(10)} ${Number(item.amount)
        .toFixed(2)
        .padStart(10)}`;
      receiptContent += `${itemDesc}\n`;
      receiptContent += `${item.name.ar}\n\n`; // Assuming Arabic name is under English name
    });
    receiptContent += "------------------------------------------------\n";
    receiptContent +=
      constructString(
        "Total Taxable Amount",
        `SAR ${order.refunds[0]?.subTotal.toString()}`
      ) + "\nإجمالي المبلغ الخاضع للضريبة\n";
    receiptContent +=
      constructString("Total Vat", `SAR ${order.refunds[0].vat.toString()}`) +
      "\nإجمالي ضريبة القيمة المضافة\n";
    receiptContent += "------------------------------------------------\n";
    receiptContent +=
      constructString(
        "Total Amount",
        `SAR ${order.refunds[0].amount.toString()}`
      ) + "\nالمبلغ الإجمالي\n";
    receiptContent += "------------------------------------------------\n";

    // Payment Breakup - Example: Cash, Card
    order.refunds[0]?.refundedTo.forEach((breakup: any) => {
      receiptContent +=
        constructString(breakup.text, `SAR ${breakup.value.toString()}`) + "\n";
    });
    receiptContent += "------------------------------------------------\n";

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

    // Printing
    await SunmiV2Printer.setFontSize(22);
    await SunmiV2Printer.setAlignment(0);
    await SunmiV2Printer.printOriginalText(receiptContent);
    await SunmiV2Printer.setAlignment(1);
    await SunmiV2Printer.printQrCode(order.qr, 4, 3);
    await SunmiV2Printer.printOriginalText("\n");
    await SunmiV2Printer.printBarcode(order.orderNum, 8, 100, 200, 2);
    await SunmiV2Printer.printOriginalText("\n\n\n\n......\n\n\n\n\n");
    await SunmiV2Printer.cutSunmi();
  } catch (error) {
    console.log("sunmi refund print error", error);
  }
}
