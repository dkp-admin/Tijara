import * as ExpoPrintHelp from "expo-print-help";
const SunmiV2Printer = ExpoPrintHelp;

function constructString(leftText: any, rightText: any) {
  const totalLength = 33;
  let spaceLength = totalLength - leftText.length - rightText.length;

  if (spaceLength < 0) {
    spaceLength = 0; // Or handle this case as needed
  }

  return leftText + " ".repeat(spaceLength) + rightText;
}

const getCountAndTotal = (data: any, type: string) => {
  const doc = data?.find(
    (d: any) => d?.paymentName?.toLowerCase() === type?.toLowerCase()
  );
  return doc;
};

const getRefundCountAndTotal = (data: any, type: string) => {
  const doc = data?.find(
    (d: any) => d?.refundType?.toLowerCase() === type?.toLowerCase()
  );
  return doc;
};

export async function printTransactionSunmi2Inch(
  data: any,
  billingSettings: any
) {
  const paymentTypes = billingSettings?.paymentTypes || [];
  let headerContent = "";

  // Header Section
  headerContent += `${data.user.name}\n${data.location.name}\n`;

  // Invoice Details
  let receiptContent = "----------------------------------\n";

  receiptContent += `Sales Summary\nملخص المبيعات\n           ${data.startDate}\n         to ${data.endDate}\n`;

  // Sales Details
  receiptContent +=
    "----------------------------------\n           Sales Details\nتفاصيل المبيعات           \n----------------------------------\n";

  receiptContent +=
    constructString("Total Sales", `SAR ${data.totalRevenue.toString()}`) +
    "\n";
  receiptContent += `إجمالي المبيعات\n`;
  receiptContent +=
    constructString("Net Sales", `SAR ${data.netSales.toString()}`) + "\n";
  receiptContent += `صافي المبيعات\n`;
  receiptContent +=
    constructString("Total VAT", `SAR ${data.totalVat.toString()}`) + "\n";
  receiptContent += `إجمالي الضريبة\n`;
  receiptContent +=
    constructString("Discounts", `SAR ${data.discount.toString()}`) + "\n";
  receiptContent += `الخصومات\n`;
  receiptContent +=
    constructString("Charges", `SAR ${data.charges.toString()}`) + "\n";
  receiptContent += `رسوم\n`;
  receiptContent += constructString("Total Order", `${data.totalOrder}`) + "\n";
  receiptContent += `مجموع الطلب\n`;
  receiptContent +=
    constructString("No. of discount", `${data.noOfDiscount}`) + "\n";
  receiptContent += `رقم الخصم\n`;
  receiptContent += constructString("Total Shift", `${data.totalShift}`) + "\n";
  receiptContent += `إجمالي المناوبة\n`;
  receiptContent += constructString("Cashiers", ` ${data.cashiers}`) + "\n";
  receiptContent += `الصرافين\n`;

  // Transaction Details
  receiptContent +=
    "----------------------------------\n        Transaction Details\nتفاصيل المعاملة            \n----------------------------------\n";

  const transactionTypes = [
    { key: "card", en: "Card Transaction", ar: "معاملات البطاقة" },
    { key: "cash", en: "Cash Transaction", ar: "نقداً المحفظة" },
    {
      key: "wallet",
      en: "Wallet Transaction",
      ar: "معاملات المحفظة",
    },
    {
      key: "hungerstation",
      en: "HungerStation Transaction",
      ar: "امعاملة هنقرستيشن",
    },
    { key: "jahez", en: "Jahez Transaction", ar: "معاملة جاهز" },
    { key: "toyou", en: "ToYou Transaction", ar: "معاملة تويو" },
    {
      key: "barakah",
      en: "Barakah Transaction",
      ar: "معاملة بركة",
    },
    { key: "careem", en: "Careem Transaction", ar: "معاملة كريم" },
    { key: "ninja", en: "Ninja Transaction", ar: "معاملة نينجا" },
    {
      key: "thechef",
      en: "The Chef Transaction",
      ar: "معاملة ذا شيف",
    },
    {
      key: "nearpay",
      en: "Nearpay Transaction",
      ar: "معاملات نيرباي",
    },
    {
      key: "stcpay",
      en: "STC Pay Transaction",
      ar: "معاملات إس تي سي",
    },
    // Add other transaction types as needed
  ];

  transactionTypes
    .filter((transaction) => {
      const paymentType = paymentTypes.find(
        (payment: any) =>
          payment?.name.toLowerCase() === transaction?.key ||
          (transaction?.key === "thechef" && payment?.name === "The Chef") ||
          (transaction?.key === "stcpay" && false) ||
          (transaction?.key === "nearpay" && false)
      );

      return paymentType && paymentType?.status === true;
    })
    .forEach((type) => {
      receiptContent +=
        constructString(
          type.en,
          `SAR ${getCountAndTotal(
            data?.txnStats,
            type.key
          )?.balanceAmount.toString()}`
        ) + "\n";
      receiptContent += constructString(
        ``,
        `Count: ${getCountAndTotal(
          data?.txnStats,
          type.key
        )?.noOfPayments.toString()}\n`
      );
      receiptContent += `${type.ar}\n`;
    });

  // receiptContent +=
  //   constructString("Card Transaction", `SAR ${data.txnWithCard.toString()}`) +
  //   "\n";
  // receiptContent += constructString(``, `Count: ${data.txnCountInCard}\n`);
  // receiptContent += `معاملات البطاقة\n`;
  // receiptContent +=
  //   constructString("Cash Transaction", `SAR ${data.txnWithCash.toString()}`) +
  //   "\n";
  // receiptContent += constructString(``, `Count: ${data.txnCountInCash}\n`);
  // receiptContent += `نقداً المحفظة\n`;
  // receiptContent +=
  //   constructString(
  //     "Wallet Transaction",
  //     `SAR ${data.txnWithWallet.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(``, `Count: ${data.txnCountInWallet}\n`);
  // receiptContent += `معاملات المحفظة\n`;
  // receiptContent +=
  //   constructString(
  //     "Credit Transaction",
  //     `SAR ${data.txnWithCredit.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(``, `Count: ${data.txnCountInCredit}\n`);
  // receiptContent += `المعاملات الائتمانية\n`;

  // receiptContent +=
  //   constructString(
  //     "HungerStation Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "hungerstation"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "hungerstation"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `امعاملة هنقرستيشن\n`;
  // receiptContent +=
  //   constructString(
  //     "Jahez Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "jahez"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "jahez"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `معاملة جاهز\n`;

  // receiptContent +=
  //   constructString(
  //     "ToYou Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "toyu"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "toyou"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `معاملة تويو\n`;

  // receiptContent +=
  //   constructString(
  //     "Barakah Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "barakah"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "barakah"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `معاملة بركة\n`;

  // receiptContent +=
  //   constructString(
  //     "Careem Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "careem"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "careem"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `معاملة كريم\n`;

  // receiptContent +=
  //   constructString(
  //     "Ninja Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "ninja"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "ninja"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `معاملة نينجا\n`;

  // receiptContent +=
  //   constructString(
  //     "The Chef Transaction",
  //     `SAR ${getCountAndTotal(
  //       data?.txnStats,
  //       "thechef"
  //     )?.balanceAmount.toString()}`
  //   ) + "\n";
  // receiptContent += constructString(
  //   ``,
  //   `Count: ${getCountAndTotal(
  //     data?.txnStats,
  //     "thechef"
  //   )?.noOfPayments.toString()}\n`
  // );
  // receiptContent += `معاملة ذا شيف\n`;

  // Refund Details
  receiptContent +=
    "----------------------------------\n           Refund Details\nتفاصيل استرداد الأموال         \n----------------------------------\n";

  receiptContent +=
    constructString("Card Refund", `SAR ${data.refundInCard.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInCard}\n`);
  receiptContent += `المسترجع بالبطاقة\n`;
  receiptContent +=
    constructString("Cash Refund", `SAR ${data.refundInCash.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInCash}\n`);
  receiptContent += `المسترجع نقداً\n`;
  receiptContent +=
    constructString("Wallet Refund", `SAR ${data.refundInWallet.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInWallet}\n`);
  receiptContent += `المسترجع بالمحفظة\n`;
  receiptContent +=
    constructString("Credit Refund", `SAR ${data.refundInCredit.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.refundCountInCredit}\n`);
  receiptContent += `استرداد الائتمان\n`;

  receiptContent +=
    constructString(
      "HungerStation Refund",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "hungerstation"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "hungerstation"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `امعاملة هنقرستيشن\n`;
  receiptContent +=
    constructString(
      "Jahez Transaction",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "jahez"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "jahez"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `معاملة جاهز\n`;

  receiptContent +=
    constructString(
      "ToYou Transaction",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "toyu"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "toyou"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `معاملة تويو\n`;

  receiptContent +=
    constructString(
      "Barakah Transaction",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "barakah"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "barakah"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `معاملة بركة\n`;

  receiptContent +=
    constructString(
      "Careem Transaction",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "careem"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "careem"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `معاملة كريم\n`;

  receiptContent +=
    constructString(
      "Ninja Transaction",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "ninja"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "ninja"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `معاملة نينجا\n`;

  receiptContent +=
    constructString(
      "The Chef Transaction",
      `SAR ${getRefundCountAndTotal(
        data?.refundData,
        "thechef"
      )?.totalRefund.toString()}`
    ) + "\n";
  receiptContent += constructString(
    ``,
    `Count: ${getRefundCountAndTotal(
      data?.refundData,
      "thechef"
    )?.refundCount.toString()}\n`
  );
  receiptContent += `معاملة ذا شيف\n`;

  // Order Type
  receiptContent +=
    "----------------------------------\n            Order Type\nنوع الطلب             \n----------------------------------\n";

  if (data?.showWalkin) {
    receiptContent +=
      constructString("Walk-in", `SAR ${data.walkin?.amount.toString()}`) +
      "\n";
    receiptContent += constructString(``, `Count: ${data.walkin?.count}\n`);
    receiptContent += `في المتجر\n`;
  }
  if (data?.showDinein) {
    receiptContent +=
      constructString("Dine-in", `SAR ${data.dinein?.amount.toString()}`) +
      "\n";
    receiptContent += constructString(``, `Count: ${data.dinein?.count}\n`);
    receiptContent += `محلي\n`;
  }
  if (data?.showTakeaway) {
    receiptContent +=
      constructString("Takeaway", `SAR ${data.takeaway?.amount.toString()}`) +
      "\n";
    receiptContent += constructString(``, `Count: ${data.takeaway?.count}\n`);
    receiptContent += `سفري\n`;
  }
  receiptContent +=
    constructString("Pickup", `SAR ${data.pickup?.amount.toString()}`) + "\n";
  receiptContent += constructString(``, `Count: ${data.pickup?.count}\n`);
  receiptContent += `استلام\n`;
  receiptContent +=
    constructString("Delivery", `SAR ${data.delivery?.amount.toString()}`) +
    "\n";
  receiptContent += constructString(``, `Count: ${data.delivery?.count}\n`);
  receiptContent += `توصيل\n`;
  receiptContent += "----------------------------------\n";

  // Printed Details
  receiptContent += constructString("Printed on", `${data.printedOn}`) + "\n";
  receiptContent += `طبع على\n`;
  receiptContent += constructString("Printed by", `${data.printedBy}`) + "\n";
  receiptContent += `طبع بواسطة\n`;
  receiptContent +=
    constructString("Printed from", `${data.printedFrom}`) + "\n";
  receiptContent += `طبع من\n`;

  // Footer Section
  let footerContent = `----------------------------------\nThank You\nPowered by Tijarah360\n`;

  // Printing
  await SunmiV2Printer.setFontSize(22);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText(headerContent);
  await SunmiV2Printer.setAlignment(0);
  await SunmiV2Printer.printOriginalText(receiptContent);
  await SunmiV2Printer.setAlignment(1);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText(footerContent);
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
  await SunmiV2Printer.printOriginalText("\n");
}
