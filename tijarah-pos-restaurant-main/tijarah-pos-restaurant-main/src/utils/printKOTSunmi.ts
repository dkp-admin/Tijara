import * as ExpoPrintHelp from "expo-print-help";
const SunmiV2Printer = ExpoPrintHelp;

function constructString(leftText: any, rightText: any) {
  const totalLength = 33;
  let spaceLength = totalLength - leftText.length - rightText.length;

  // Ensure there's enough space to insert spaces
  if (spaceLength < 0) {
    spaceLength = 0; // Or handle this case as needed
  }

  // Add spaces between leftText and rightText
  const combinedText = leftText + " ".repeat(spaceLength) + rightText;

  return combinedText;
}

export async function printKOTSunmi(order: any) {
  await SunmiV2Printer.setFontSize(32);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(`${order.location.name.en}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.name.ar}\n`);
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.printOriginalText(`${order.location.address}\n`);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(
    `Invoice#                   ${order.orderNum}\n`
  );
  await SunmiV2Printer.printOriginalText("فاتورة# \n ");
  await SunmiV2Printer.printOriginalText("Date & Time\n");
  await SunmiV2Printer.printOriginalText("التاريخ و الوقت \n ");
  await SunmiV2Printer.setAlignment(2);
  await SunmiV2Printer.printOriginalText(`${order.createdAt}\n`);
  await SunmiV2Printer.setAlignment(1);
  if (order?.showToken || order?.orderType?.length > 0) {
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
    if (order?.showToken) {
      await SunmiV2Printer.setFontSize(24);
      await SunmiV2Printer.printOriginalText(`${order.tokenNumber}\n`);
    }
    if (order?.orderType?.length > 0) {
      await SunmiV2Printer.printOriginalText(`${order.orderType}\n`);
    }
  }
  await SunmiV2Printer.printOriginalText("--------------------------------\n");

  await SunmiV2Printer.setFontSize(26);
  await SunmiV2Printer.printOriginalText("KOT\n");
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText("Description فاتورة ضريبية مبسطة\n");
  await SunmiV2Printer.printOriginalText("                              Qty\n");
  await SunmiV2Printer.printOriginalText(
    "الكمية                             \n"
  );
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  order.items.map(async (it: any) => {
    const boxNameEn =
      it.variant.type === "box"
        ? `, (Box ${it.variant.unitCount} Units)`
        : it.variant.type === "crate"
        ? `, (Crate ${it.variant.unitCount} Units)`
        : "";
    const boxNameAr =
      it.variant.type === "box"
        ? `, (القطع ${it.variant.unitCount} صندوق)`
        : it.variant.type === "crate"
        ? `, (القطع ${it.variant.unitCount} قفص)`
        : "";

    const variantNameEn = it.hasMultipleVariants
      ? ` - ${it.variant.name.en}`
      : "";
    const variantNameAr = it.hasMultipleVariants
      ? ` - ${it.variant.name.ar}`
      : "";

    const itemNameEn = `${it.name.en}${variantNameEn}${boxNameEn}`;
    const itemNameAr = `${it.name.ar}${variantNameAr}${boxNameAr}`;

    let modifierName = "";

    if (it?.modifiers || it?.modifiers?.length > 0) {
      it?.modifiers?.map((mod: any) => {
        modifierName += `${modifierName === "" ? "" : ","}${mod.optionName}`;
      });
    }

    await SunmiV2Printer.printOriginalText(
      `${itemNameEn}\n${itemNameAr}\n${
        modifierName ? `${modifierName}\n` : ""
      }                                ${it.quantity}\n`
    );
  });
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.printOriginalText(
    `Total QTY                       ${order.totalOrderQty}\n`
  );
  await SunmiV2Printer.printOriginalText("إجمالي الكمية\n ");
  if (order?.specialInstructions && order?.specialInstructions?.length > 0) {
    await SunmiV2Printer.printOriginalText(
      "---------------------------------\n"
    );
    await SunmiV2Printer.setAlignment(1);
    await SunmiV2Printer.printOriginalText("Special Instructions\n");
    await SunmiV2Printer.printOriginalText("تعليمات خاصة\n");
    await SunmiV2Printer.printOriginalText(`${order.specialInstructions}\n`);
  }
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
}
