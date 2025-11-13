import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../db/repository";
import useCommonApis from "../../hooks/useCommonApis";

const getCountAndTotal = (data: any, type: string) => {
  const doc = data?.find(
    (d: any) => d?.paymentName?.toLowerCase() === type?.toLowerCase()
  );
  return doc;
};

export default function TransactionEventListener() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;
  const { billingSettings } = useCommonApis();

  const printTransactionReceipt = async (data: any) => {
    try {
      const allprinters = await repository.printerRepository.findByType("usb");
      const allBtPrinters = await repository.printerRepository.findByType(
        "bluetooth"
      );

      const paymentTypes = billingSettings.paymentTypes;

      const printers = [...allprinters, ...allBtPrinters].filter(
        (p) => p.enableReceipts
      );

      if (printers.length === 0) {
        throw new Error("No printer selected");
      }

      const printResponses: any[] = [];

      for (const printer of printers) {
        const is2Inch = printer.printerSize === "2-inch";

        // if (printer?.device_name) {
        try {
          let receiptPrinter = null;
          if (printer.printerType === "usb") {
            receiptPrinter = await ExpoPrintHelp.connect(printer.product_id);
          }

          if (receiptPrinter || printer.printerType === "bluetooth") {
            const imageToHex =
              printer.printerType === "bluetooth"
                ? ExpoPrintHelp.imageToHexBt
                : ExpoPrintHelp.imageToHex;

            let transactionContent =
              `[C]<b>${data?.user?.name}</b>\n` +
              `[L]\n` +
              `[C]<b>${data?.location?.name}</b>\n` +
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[L]Sales Summary[R]${data?.startDate}\nto ${data?.endDate}\n` +
              `[L]<img>${imageToHex(
                "ملخص المبيعات",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[C]<b>Sales Details</b>\n` +
              `[C]<img>${imageToHex(
                `ملخص المبيعات${" ".repeat(is2Inch ? 20 : 40)}`,
                "center",
                is2Inch ? "16" : "22"
              )}</img>\n` +
              `[L]Total Sales[R]SAR ${data?.totalRevenue}\n` +
              `[L]<img>${imageToHex(
                "إجمالي المبيعات",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]Net Sales[R]SAR ${data?.netSales}\n` +
              `[L]<img>${imageToHex(
                "صافي المبيعات",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;

            // Add all sales details with proper sizing
            transactionContent +=
              `[L]Total VAT[R]SAR ${data?.totalVat}\n` +
              `[L]<img>${imageToHex(
                "إجمالي الضريبة",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]Discounts[R]SAR ${data?.discount}\n` +
              `[L]<img>${imageToHex(
                "الخصومات",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;

            // Transaction details section
            transactionContent +=
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[C]<b>Transaction Details</b>\n` +
              `[C]<img>${imageToHex(
                `تفاصيل المعاملة${" ".repeat(is2Inch ? 20 : 40)}`,
                "center",
                is2Inch ? "16" : "22"
              )}</img>\n`;

            // Add each transaction type
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
                    (transaction?.key === "thechef" &&
                      payment?.name === "The Chef") ||
                    (transaction?.key === "stcpay" && false) ||
                    (transaction?.key === "nearpay" && false)
                );

                return paymentType && paymentType?.status === true;
              })
              .forEach((type) => {
                const txnData = getCountAndTotal(data?.txnStats, type.key);
                transactionContent +=
                  `[L]${type.en}[R]SAR ${Number(
                    txnData?.balanceAmount || 0.0
                  ).toFixed(2)}, Count: ${txnData?.noOfPayments || 0}\n` +
                  `[L]<img>${imageToHex(
                    type.ar,
                    "left",
                    is2Inch ? "16" : "20"
                  )}</img>\n`;
              });

            // Add refund details with proper sizing
            transactionContent +=
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[C]<b>Refund Details</b>\n` +
              `[C]<img>${imageToHex(
                `تفاصيل استرداد الأموال${" ".repeat(is2Inch ? 15 : 30)}`,
                "center",
                is2Inch ? "16" : "22"
              )}</img>\n`;

            const refundTypes = [
              { key: "card", en: "Card Refund", ar: "المسترجع بالبطاقة" },
              { key: "cash", en: "Cash Refund", ar: "المسترجع نقداً" },
              { key: "wallet", en: "Wallet Refund", ar: "استرداد المحفظة" },
              {
                key: "hungerstation",
                en: "HungerStation Refund",
                ar: "امعاملة هنقرستيشن",
              },
              { key: "jahez", en: "Jahez Refund", ar: "معاملة جاهز" },
              { key: "toyou", en: "ToYou Refund", ar: "معاملة تويو" },
              {
                key: "barakah",
                en: "Barakah Refund",
                ar: "معاملة بركة",
              },
              { key: "careem", en: "Careem Refund", ar: "معاملة كريم" },
              { key: "ninja", en: "Ninja Refund", ar: "معاملة نينجا" },
              {
                key: "thechef",
                en: "The Chef Refund",
                ar: "معاملة ذا شيف",
              },
              {
                key: "nearpay",
                en: "Nearpay Refund",
                ar: "معاملات نيرباي",
              },
              {
                key: "stcpay",
                en: "STC Pay Refund",
                ar: "معاملات إس تي سي",
              },
            ];

            function capitalize(str: any) {
              return str.charAt(0).toUpperCase() + str.slice(1);
            }

            refundTypes
              .filter((transaction) => {
                const paymentType = paymentTypes.find(
                  (payment: any) =>
                    payment?.name.toLowerCase() === transaction?.key ||
                    (transaction?.key === "thechef" &&
                      payment?.name === "The Chef") ||
                    (transaction?.key === "stcpay" && false) ||
                    (transaction?.key === "nearpay" && false)
                );

                return paymentType && paymentType?.status === true;
              })
              .forEach((type) => {
                let refundAmount = "0.00";
                let refundCount = 0;

                // Check if it's a basic payment method (card, cash, wallet, credit)
                if (
                  [
                    "card",
                    "cash",
                    "wallet",
                    "credit",
                    "nearpay",
                    "stcpay",
                  ].includes(type.key)
                ) {
                  refundAmount =
                    data?.[`refundIn${capitalize(type.key)}`] || "0.00";
                  refundCount =
                    data?.[`refundCountIn${capitalize(type.key)}`] || 0;
                } else {
                  // For delivery platforms, check in refundData array
                  const refundInfo = data?.refundData?.find(
                    (r: any) => r.refundType === type.key
                  );
                  if (refundInfo) {
                    refundAmount = refundInfo.totalRefund?.toFixed(2) || "0.00";
                    refundCount = refundInfo.refundCount || 0;
                  }
                }

                transactionContent +=
                  `[L]${type.en}[R]SAR ${refundAmount}, Count: ${refundCount}\n` +
                  `[L]<img>${imageToHex(
                    type.ar,
                    "left",
                    is2Inch ? "16" : "20"
                  )}</img>\n`;
              });

            // Footer section
            transactionContent +=
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[L]Printed on[R]${data?.printedOn}\n` +
              `[L]<img>${imageToHex(
                "طبع على",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]Printed by[R]${data?.printedBy}\n` +
              `[L]<img>${imageToHex(
                "طبع بواسطة",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[C]${data?.footer}\n` +
              `[C]Powered by Tijarah360\n` +
              `${is2Inch ? "\n\n" : "[L]\n[L]\n[L]\n"}`;

            const response =
              printer.printerType === "usb"
                ? await ExpoPrintHelp.printRaw(
                    transactionContent,
                    is2Inch ? "58" : printer?.printerWidthMM || "72",
                    is2Inch ? "160" : "199",
                    is2Inch ? "32" : printer?.charsPerLine || "44"
                  )
                : await ExpoPrintHelp.printRawBt(
                    transactionContent,
                    is2Inch ? "58" : printer?.printerWidthMM || "72",
                    is2Inch ? "160" : "199",
                    is2Inch ? "32" : printer?.charsPerLine || "44"
                  );

            if (printer.printerType === "usb") {
              await ExpoPrintHelp.cut();
            }

            printResponses.push(response);
          }
        } catch (error) {
          console.error("Error printing transaction:", error);
        }
        // }
      }

      setData(null);
      setSeed(false);
      return Promise.all(printResponses);
    } catch (error) {
      console.error("Error in printTransactionReceipt:", error);
      throw error;
    }
  };

  useEffect(() => {
    EventRegister.addEventListener("print-transaction", (eventData) => {
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-transaction");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
      setData(null);
      setSeed(false);
    });
    return () => {
      EventRegister.removeEventListener("print-error");
    };
  }, []);

  useEffect(() => {
    const serialPrint = async () => {
      if (!seed) {
        return;
      }

      try {
        await printTransactionReceipt(data);

        setData(null);
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
