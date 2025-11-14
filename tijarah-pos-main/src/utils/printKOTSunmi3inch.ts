import SunmiV2Printer from "react-native-sunmi-v2-printer";
import { debugLog } from "./log-patch";

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

export async function printKOTSunmi3Inch(order: any) {
  debugLog(
    "Sunmi 3 inch kot print started",
    order,
    "kot-print-sunmi-3-inch",
    "printKOTSunmi3Inch"
  );

  let receiptContent = "";

  // Header Section - Centered with respect to 3-inch layout
  receiptContent += `${" ".repeat((48 - order.location.name.en.length) / 2)}${
    order.location.name.en
  }\n`;
  receiptContent += `${" ".repeat((48 - order.location.name.ar.length) / 2)}${
    order.location.name.ar
  }\n\n`;

  // Address - Left-aligned with padding for clarity
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

  // Token Number and Order Type
  if (order.showToken || order.orderType?.length > 0) {
    receiptContent += "------------------------------------------------\n";
    if (order.showToken) {
      receiptContent += `Token: ${order.tokenNumber}\n`;
    }
    if (order.orderType?.length > 0) {
      receiptContent += `Type: ${order.orderType}\n`;
    }
  }

  // Items Header
  receiptContent += "------------------------------------------------\n";
  receiptContent += "Description                         Qty\n";
  receiptContent += "------------------------------------------------\n";

  // Items
  order.items.forEach((item: any) => {
    const itemDesc = `${item.name.en.substring(
      0,
      20
    )}                         ${item.quantity}`;
    receiptContent += `${itemDesc}\n`;
    receiptContent += `${item.name.ar}\n\n`; // Assuming Arabic name is under English name
  });
  receiptContent += "------------------------------------------------\n";

  receiptContent +=
    constructString("Total QTY", order.totalOrderQty) + "\nإجمالي الكمية\n ";
  receiptContent += "------------------------------------------------\n";

  // Special Instructions
  if (order?.specialInstructions?.length > 0) {
    receiptContent += "------------------------------------------------\n";
    receiptContent += `Special Instructions\n`;
    receiptContent += `تعليمات خاصة\n`;
    receiptContent += `${order.specialInstructions}\n`;
  }

  // Printing
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");

  debugLog(
    "Sunmi 3 inch kot print completed",
    order,
    "kot-print-sunmi-3-inch",
    "printKOTSunmi3Inch"
  );
}
