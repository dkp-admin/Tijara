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

export async function printKOTSunmi3Inch(order: any) {
  let receiptContent = "";

  await SunmiV2Printer.printOriginalText("\n\n\n");

  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(`${order.location.name.en}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.name.ar}\n`);
  await SunmiV2Printer.setFontSize(22);

  // Address - Left-aligned with padding for clarity
  receiptContent += `${centerAlignText(order.location.address)}\n`; // Assuming address is a single line
  receiptContent += "---------------------------------------------------\n";

  // Invoice Details
  receiptContent += `${constructString(
    "KOT# ",
    `${order?.kotId || "NA"}`
  )}\nفاتورة# \n${constructString(
    "Date And Time:",
    `${order.createdAt.substring(0, 10)}`
  )}\nالتاريخ و الوقت\n`;
  receiptContent += "---------------------------------------------------\n";

  // Token Number and Order Type
  if (order.showToken || order.orderType?.length > 0) {
    receiptContent += "---------------------------------------------------\n";
    if (order.showToken) {
      receiptContent += `Token: ${order.tokenNumber}\n`;
    }
    if (order.orderType?.length > 0) {
      receiptContent += `Type: ${order.orderType}\n`;
    }
  }

  // Items Header
  receiptContent += "---------------------------------------------------\n";
  receiptContent += "Description                                     Qty\n";
  receiptContent += "---------------------------------------------------\n";

  // Items
  order.items.forEach((item: any) => {
    const itemDesc = `${item.name.en.substring(0, 20).padEnd(45)}${item.quantity
      .toString()
      .padStart(4)}`;
    receiptContent += `${itemDesc}\n`;
    receiptContent += `${item.name.ar}\n\n`; // Assuming Arabic name is under English name
  });
  receiptContent += "---------------------------------------------------\n";

  receiptContent +=
    constructString("Total QTY", order.totalOrderQty) + "\nإجمالي الكمية\n ";
  receiptContent += "---------------------------------------------------\n";

  // Special Instructions
  if (order?.specialInstructions?.length > 0) {
    receiptContent += "---------------------------------------------------\n";
    receiptContent += `Special Instructions\n`;
    receiptContent += `تعليمات خاصة\n`;
    receiptContent += `${order.specialInstructions}\n`;
  }

  // Printing
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.printOriginalText("\n\n......\n\n");
  await SunmiV2Printer.cutSunmi();
}
