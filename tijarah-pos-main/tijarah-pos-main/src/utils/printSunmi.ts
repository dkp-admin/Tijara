import SunmiV2Printer from "react-native-sunmi-v2-printer";
import { debugLog } from "./log-patch";

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

export async function printSunmi(order: any) {
  debugLog(
    "Sunmi order print started",
    order,
    "order-print-sunmi",
    "printSunmiFunction"
  );

  await SunmiV2Printer.setFontSize(32);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(`${order.location.name.en}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.name.ar}\n`);
  await SunmiV2Printer.setFontSize(22);
  if (order?.location?.vat?.length > 0) {
    await SunmiV2Printer.printOriginalText(`VAT No. ${order.location.vat}\n`);
  }
  await SunmiV2Printer.printOriginalText(`PH No. ${order.location.phone}\n`);
  await SunmiV2Printer.printOriginalText(`${order.location.address}\n`);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(
    `Invoice                    ${order.orderNum}\n`
  );
  await SunmiV2Printer.printOriginalText("فاتورة \n ");
  await SunmiV2Printer.printOriginalText("Date & Time\n");
  await SunmiV2Printer.printOriginalText("التاريخ و الوقت \n ");
  await SunmiV2Printer.setAlignment(2);
  await SunmiV2Printer.printOriginalText(`${order.createdAt}\n`);
  if (order?.customer?.name?.length > 0) {
    await SunmiV2Printer.setAlignment(0);
    await SunmiV2Printer.printOriginalText(
      `Customer                   ${order.customer.name}\n`
    );
    await SunmiV2Printer.printOriginalText("العميل \n ");
  }
  if (order?.customer?.vat?.length > 0) {
    await SunmiV2Printer.setAlignment(0);
    await SunmiV2Printer.printOriginalText(
      `Customer VAT                  ${order.customer.vat}\n`
    );
    await SunmiV2Printer.printOriginalText("العميل VAT \n ");
  }
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
  await SunmiV2Printer.printOriginalText("Simplified Tax Invoice\n");
  await SunmiV2Printer.printOriginalText("فاتورة ضريبية مبسطة\n");
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
  order.items.map(async (it: any) => {
    await SunmiV2Printer.printOriginalText(
      `${it.name.en}\n${it.name.ar}\n${
        it?.modifierName ? `${it.modifierName}\n` : ""
      }${it.variant.sellingPrice?.toFixed(2)}               ${
        it.quantity
      }      ${it.billing.total}\n`
    );
  });
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(0);

  if (order.payment.discountAmount > 0) {
    await SunmiV2Printer.printOriginalText(
      constructString(
        "Items Total",
        `SAR ${order.payment.subTotalWithoutDiscount.toString()}`
      ) + "\n"
    );
    await SunmiV2Printer.printOriginalText(
      constructString(
        "Total Discount",
        `SAR ${order.payment.discountAmount.toString()}`
      ) + "\n"
    );
  }

  await SunmiV2Printer.printOriginalText(
    constructString(
      "Total Taxable Amount",
      `SAR ${order.payment.subTotal.toString()}`
    ) + "\n"
  );

  order.payment?.charges.map(async (breakup: any) => {
    await SunmiV2Printer.printOriginalText(
      constructString(breakup.name.en, `SAR ${breakup.total.toString()}`) + "\n"
    );
  });

  await SunmiV2Printer.printOriginalText("إجمالي المبلغ الخاضع للضريبة \n ");
  await SunmiV2Printer.printOriginalText(
    constructString("Total Vat", `SAR ${order.payment.vatAmount.toString()}`) +
      "\n"
  );
  await SunmiV2Printer.printOriginalText("إجمالي ضريبة القيمة المضافة \n ");
  await SunmiV2Printer.printOriginalText("---------------------------------\n");
  await SunmiV2Printer.printOriginalText(
    constructString("Total Amount", `SAR ${order.payment.total.toString()}`) +
      "\n"
  );
  await SunmiV2Printer.printOriginalText("المبلغ الإجمالي\n ");
  await SunmiV2Printer.printOriginalText("---------------------------------\n");
  order.payment.breakup.map(async (breakup: any) => {
    await SunmiV2Printer.printOriginalText(
      constructString(breakup.name, `SAR ${breakup.total.toString()}`) + "\n"
    );
  });
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.setAlignment(1);
  if (order?.specialInstructions && order?.specialInstructions?.length > 0) {
    await SunmiV2Printer.printOriginalText("Special Instructions\n");
    await SunmiV2Printer.printOriginalText("تعليمات خاصة\n");
    await SunmiV2Printer.printOriginalText(`${order.specialInstructions}\n`);
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
  }
  await SunmiV2Printer.printQRCode(order.qr, 8, 8);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  await SunmiV2Printer.printBarCode(order.orderNum, 8, 100, 200, 2);
  await SunmiV2Printer.printOriginalText(
    "----------------------------------\n"
  );
  let footer = "Thank You";
  if (order.location?.customText && order.location?.customText?.length > 0) {
    await SunmiV2Printer.printOriginalText(`${order.location.customText}\n`);
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
  }
  if (
    order.location?.returnPolicy &&
    order.location?.returnPolicy?.length > 0
  ) {
    await SunmiV2Printer.printOriginalText(`${order.location.returnPolicy}\n`);
    await SunmiV2Printer.printOriginalText(
      "----------------------------------\n"
    );
  }

  if (
    order.location?.invoiceFooter &&
    order.location?.invoiceFooter?.length > 0
  ) {
    footer = order.location.invoiceFooter;
  }
  await SunmiV2Printer.printOriginalText(`${footer}\n`);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");

  debugLog(
    "Sunmi order print completed",
    order,
    "order-print-sunmi",
    "printSunmiFunction"
  );
}
