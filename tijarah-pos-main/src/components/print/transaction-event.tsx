import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { PrinterModel } from "../../database/printer/printer";
import { db } from "../../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../../utils/log-patch";

export default function TransactionEventListener() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;

  const printTransactionReceipt = async () => {
    const printerModel = db.getRepository(PrinterModel);

    ExpoPrintHelp.initialize();

    const printers = await printerModel.find({
      where: { enableReceipts: true, printerType: "usb" },
    });

    debugLog(
      "Printers Found",
      { printers },
      "sales-summary-screen",
      "handlePrintTransactionReceipt"
    );

    if (printers.length === 0) {
      debugLog(
        "No Printers Found",
        { printers: [] },
        "sales-summary-screen",
        "handlePrintTransactionReceipt"
      );
      throw new Error("No printed selected");
    }

    const printResponses: any[] = [];

    for (const printer of printers) {
      if (printer?.device_name) {
        try {
          const receiptPrinter = await ExpoPrintHelp.connect(
            printer.product_id
          );

          debugLog(
            `Printer Connected ${printer.device_name}`,
            {},
            "sales-summary-screen",
            "handlePrintTransactionReceipt"
          );

          if (receiptPrinter) {
            let transactionContent =
              `[C]<b>${data?.user?.name}</b>\n` +
              `[L]\n` +
              `[C]<b>${data?.location?.name}</b>\n` +
              `[C]----------------------------------------------\n` +
              `[L]Sales Summary[R]${data?.startDate}\nto ${data?.endDate}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "ملخص المبيعات",
                "left",
                "20"
              )}</img>\n` +
              `[C]----------------------------------------------\n` +
              `[C]<b>Sales Details</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                "ملخص المبيعات                                ",
                "center",
                "22"
              )}</img>\n` +
              `[L]Total Sales[R]SAR ${data?.totalRevenue}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي المبيعات",
                "left",
                "20"
              )}</img>\n` +
              `[L]Net Sales[R]SAR ${data?.netSales}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "صافي المبيعات",
                "left",
                "20"
              )}</img>\n` +
              `[L]Total VAT[R]SAR ${data?.totalVat}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي الضريبة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Discounts[R]SAR ${data?.discount}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "الخصومات",
                "left",
                "20"
              )}</img>\n` +
              `[L]Charges[R]SAR ${data?.charges}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "رسوم",
                "left",
                "20"
              )}</img>\n` +
              `[L]Total Order[R]${data?.totalOrder}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "مجموع الطلب",
                "left",
                "20"
              )}</img>\n` +
              `[L]No. of discount[R]${data?.noOfDiscount}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "رقم الخصم",
                "left",
                "20"
              )}</img>\n` +
              `[L]Total Shift[R]${data?.totalShift}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي المناوبة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Cashiers[R]${data?.cashiers}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "الصرافين",
                "left",
                "20"
              )}</img>\n` +
              `[C]----------------------------------------------\n` +
              `[C]<b>Transaction Details</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                "تفاصيل المعاملة                                ",
                "center",
                "22"
              )}</img>\n` +
              `[L]Card Transaction[R]SAR ${data?.txnWithCard}, Count: ${data?.txnCountInCard}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "معاملات البطاقة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Cash Transaction[R]SAR ${data?.txnWithCash}, Count: ${data?.txnCountInCash}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "نقداً المحفظة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Wallet Transaction[R]SAR ${data?.txnWithWallet}, Count: ${data?.txnCountInWallet}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "معاملات المحفظة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Credit Transaction[R]SAR ${data?.txnWithCredit}, Count: ${data?.txnCountInCredit}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "المعاملات الائتمانية",
                "left",
                "20"
              )}</img>\n` +
              `[C]----------------------------------------------\n` +
              `[C]<b>Refund Details</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                "تفاصيل استرداد الأموال                          ",
                "center",
                "22"
              )}</img>\n` +
              `[L]Card Refund[R]SAR ${data?.refundInCard}, Count: ${data?.refundCountInCard}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "المسترجع بالبطاقة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Cash Refund[R]SAR ${data?.refundInCash}, Count: ${data?.refundCountInCash}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "المسترجع نقداً",
                "left",
                "20"
              )}</img>\n` +
              `[L]Wallet Refund[R]SAR ${data?.refundInWallet}, Count: ${data?.refundCountInWallet}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "المسترجع بالمحفظة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Credit Refund[R]SAR ${data?.refundInCredit}, Count: ${data?.refundCountInCredit}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "استرداد الائتمان",
                "left",
                "20"
              )}</img>\n` +
              `[C]----------------------------------------------\n` +
              `[C]<b>Order Type</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                "نوع الطلب                                    ",
                "center",
                "22"
              )}</img>\n`;

            if (data?.showWalkin) {
              transactionContent +=
                `[L]Walk-in[R]SAR ${data?.walkin?.amount}, Count: ${data?.walkin?.count}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "في المتجر",
                  "left",
                  "20"
                )}</img>\n`;
            }

            if (data?.showDinein) {
              transactionContent +=
                `[L]Dine-in[R]SAR ${data?.dinein?.amount}, Count: ${data?.dinein?.count}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "محلي",
                  "left",
                  "20"
                )}</img>\n`;
            }

            if (data?.showTakeaway) {
              transactionContent +=
                `[L]Takeaway[R]SAR ${data?.takeaway?.amount}, Count: ${data?.takeaway?.count}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "سفري",
                  "left",
                  "20"
                )}</img>\n`;
            }

            transactionContent +=
              `[L]Pickup[R]SAR ${data?.pickup?.amount}, Count: ${data?.pickup?.count}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "استلام",
                "left",
                "20"
              )}</img>\n` +
              `[L]Delivery[R]SAR ${data?.delivery?.amount}, Count: ${data?.delivery?.count}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "توصيل",
                "left",
                "20"
              )}</img>\n` +
              `[C]----------------------------------------------\n` +
              `[L]Printed on[R]${data?.printedOn}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "طبع على",
                "left",
                "20"
              )}</img>\n` +
              `[L]Printed by[R]${data?.printedBy}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "طبع بواسطة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Printed from[R]${data?.printedFrom}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "طبع من",
                "left",
                "20"
              )}</img>\n` +
              `[C]----------------------------------------------\n` +
              `[C]${data?.footer}\n` +
              `[C]Powered by Tijarah360\n` +
              `[L]\n` +
              `[L]\n` +
              `[L]\n`;

            debugLog(
              `Printer Transaction Data Found For ${printer.device_name}`,
              {},
              "sales-summary-screen",
              "handlePrintTransactionReceipt"
            );

            const response = await ExpoPrintHelp.printRaw(
              transactionContent,
              `${printer?.printerWidthMM || "72"}`,
              "199",
              `${printer?.charsPerLine || "44"}`
            );
            await ExpoPrintHelp.cut();

            debugLog(
              `Printer Template Response Found For ${printer.device_name}`,
              {},
              "sales-summary-screen",
              "handlePrintTransactionReceipt"
            );

            printResponses.push(response);
          }
        } catch (error: any) {
          errorLog(
            error?.message,
            printer,
            "sales-summary-screen",
            "handlePrintTransactionReceipt",
            error
          );
        }
      }
    }

    setSeed(false);

    const responses = await Promise.all(printResponses);
    debugLog(
      `All Printed`,
      { responses },
      "sales-summary-screen",
      "handlePrintTransactionReceipt"
    );

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-transaction", (eventData) => {
      debugLog(
        "Print transaction started",
        {},
        "sales-summary-screen",
        "handlePrintTransactionReceipt"
      );

      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-transaction");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
      debugLog(
        "Print order failed",
        {},
        "sales-summary-screen",
        "handlePrintTransactionReceipt"
      );
      setData(null);
      setSeed(false);
    });
    return () => {
      EventRegister.removeEventListener("print-error");
    };
  }, []);

  useEffect(() => {
    const serialPrint = async () => {
      debugLog(
        "Serial Print Called",
        {},
        "sales-summary-screen",
        "handlePrintTransactionReceipt"
      );

      if (!seed) {
        return;
      }

      debugLog(
        "Print data generated",
        {},
        "sales-summary-screen",
        "handlePrintTransactionReceipt"
      );

      try {
        await printTransactionReceipt();

        debugLog(
          "Print transaction completed",
          {},
          "sales-summary-screen",
          "handlePrintTransactionReceipt"
        );

        setData(null);

        debugLog(
          "Event data emptied",
          {},
          "sales-summary-screen",
          "handlePrintTransactionReceipt"
        );
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
