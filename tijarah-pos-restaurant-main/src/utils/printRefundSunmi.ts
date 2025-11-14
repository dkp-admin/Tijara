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

export async function printRefundSunmi(order: any) {
  await SunmiV2Printer.setFontSize(32);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(`${order.location.name.en}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.name.ar}\n`);
  await SunmiV2Printer.setFontSize(22);
  if (order?.location?.vat?.length > 0) {
    await SunmiV2Printer.printOriginalText(
      `VAT No.sasasa ${order.location.vat}\n`
    );
  }
  await SunmiV2Printer.printOriginalText(`PH No. ${order.location.phone}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.address}\n`);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);
  if (order.refundReceiptNo?.length > 0) {
    await SunmiV2Printer.printOriginalText(
      `Refund Receipt No\n#${order.refundReceiptNo}\n`
    );
    await SunmiV2Printer.printOriginalText("إيصال استرداد\n");
  }
  await SunmiV2Printer.printOriginalText(`Invoice Reference No.\n`);
  await SunmiV2Printer.printOriginalText("مرجع الفاتورة\n");
  await SunmiV2Printer.printOriginalText(`#${order.orderNum}\n`);
  await SunmiV2Printer.printOriginalText("Date & Time\n");
  await SunmiV2Printer.printOriginalText("التاريخ و الوقت\n");
  await SunmiV2Printer.setAlignment(2);
  await SunmiV2Printer.printOriginalText(`${order.createdAt}\n`);
  if (order?.customer?.name?.length > 0) {
    await SunmiV2Printer.setAlignment(0);
    await SunmiV2Printer.printOriginalText(
      `Customer                   ${order.customer.name}\n`
    );
    await SunmiV2Printer.printOriginalText("العميل\n");
  }
  if (order?.customer?.vat?.length > 0) {
    await SunmiV2Printer.setAlignment(0);
    await SunmiV2Printer.printOriginalText(
      `Customer VAT                  ${order.customer.vat}\n`
    );
    await SunmiV2Printer.printOriginalText("العميل VAT\n");
  }
  await SunmiV2Printer.setAlignment(1);
  if (order?.tokenNumber?.length > 0 || order?.orderType?.length > 0) {
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
    if (order?.tokenNumber?.length > 0) {
      await SunmiV2Printer.setFontSize(24);
      await SunmiV2Printer.printOriginalText(`${order.tokenNumber}\n`);
    }
    if (order?.orderType?.length > 0) {
      await SunmiV2Printer.printOriginalText(`${order.orderType}\n`);
    }
  }
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setFontSize(24);
  await SunmiV2Printer.printOriginalText("Notice Creditor / Refund Receipt\n");
  await SunmiV2Printer.printOriginalText("إشعار الدائن/إيصال الاسترداد\n");
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText("Description فاتورة ضريبية مبسطة\n");
  await SunmiV2Printer.printOriginalText(
    "Unit Price          Qty      Total\n"
  );
  await SunmiV2Printer.printOriginalText(
    "إجمالي      الكمية         سعر الوحدة\n"
  );
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  order.refunds[0].items.map(async (it: any) => {
    if (it.modifierName) {
      await SunmiV2Printer.printOriginalText(
        `${it.name.en}\n${it.name.ar}\n${it.modifierName}\n${it.unitPrice}               ${it.qty}      ${it.amount}\n`
      );
    } else {
      await SunmiV2Printer.printOriginalText(
        `${it.name.en}\n${it.name.ar}\n${it.unitPrice}               ${it.qty}      ${it.amount}\n`
      );
    }
  });
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(
    constructString(
      "Total Taxable Amount",
      `SAR ${order.refunds[0]?.subTotal.toString()}`
    ) + "\n"
  );
  await SunmiV2Printer.printOriginalText("إجمالي المبلغ الخاضع للضريبة \n ");
  order.refunds[0]?.charges?.map(async (charge: any) => {
    await SunmiV2Printer.printOriginalText(
      constructString(charge.name.en, `SAR ${charge.totalCharge.toString()}`) +
        "\n"
    );
    await SunmiV2Printer.printOriginalText(charge.name.ar + "\n");
  });
  await SunmiV2Printer.printOriginalText(
    constructString("Vat Refund", `SAR ${order.refunds[0].vat.toString()}`) +
      "\n"
  );
  await SunmiV2Printer.printOriginalText("استرداد\n ");
  await SunmiV2Printer.printOriginalText("---------------------------------\n");
  await SunmiV2Printer.printOriginalText(
    constructString(
      "Total Refund",
      `SAR ${order.refunds[0].amount.toString()}`
    ) + "\n"
  );
  await SunmiV2Printer.printOriginalText("المبلغ المسترد\n ");
  await SunmiV2Printer.printOriginalText("---------------------------------\n");
  order.refunds[0].refundedTo.map(async (refund: any) => {
    await SunmiV2Printer.printOriginalText(
      constructString(refund.text, `SAR ${refund.value.toString()}`) + "\n"
    );
  });
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printQrCode(order.qr, 4, 3);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.printBarcode(order.orderNum, 8, 100, 200, 2);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  let footer = "Thank You";
  if (order.location.customText && order.location.customText.length > 0) {
    await SunmiV2Printer.printOriginalText(`${order.location.customText}\n`);
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
  }
  if (order.location.returnPolicy && order.location.returnPolicy.length > 0) {
    await SunmiV2Printer.printOriginalText(`${order.location.returnPolicy}\n`);
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
  }

  if (order.location.invoiceFooter && order.location.invoiceFooter.length > 0) {
    footer = order.location.invoiceFooter;
  }
  await SunmiV2Printer.printOriginalText(`${footer}\n`);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
}
