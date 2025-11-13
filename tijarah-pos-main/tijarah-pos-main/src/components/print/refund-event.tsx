import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { PrinterModel } from "../../database/printer/printer";
import { db } from "../../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../../utils/log-patch";
import { transformRefundData } from "../../utils/transform-refund-data";

export default function RefundEvent() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;

  const printOrderReceipt = async () => {
    const printerModel = db.getRepository(PrinterModel);

    ExpoPrintHelp.initialize();

    const printers = await printerModel.find({
      where: { enableReceipts: true, printerType: "usb" },
    });

    debugLog("Printers Found", { printers }, "refund-repo.tsx", "refund");

    if (printers.length === 0) {
      debugLog(
        "No Printers Found",
        { printers: [] },
        "refund-repo.tsx",
        "refund"
      );
      throw new Error("No printed selected");
    }

    const printResponses: any[] = [];

    for (const printer of printers) {
      if (printer?.product_id) {
        try {
          const receiptPrinter = await ExpoPrintHelp.connect(
            printer.product_id
          );

          debugLog(
            `Printer Connected ${printer.device_name}`,
            {},
            "refund-repo.tsx",
            "refund"
          );

          if (receiptPrinter) {
            const order = transformRefundData({
              ...data,
            });

            debugLog(
              `Refund Order Data Found For ${printer.device_name}`,
              order,
              "refund-repo.tsx",
              "refund"
            );

            let refundContent =
              `[C]<b>${order?.location?.name?.en}</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                `${order?.location?.name?.ar}                                     `,
                "center",
                "20"
              )}</img>\n`;

            if (order?.location?.vat?.length > 0) {
              refundContent += `[C]VAT No. ${order.location.vat}\n`;
            }

            refundContent +=
              `[C]PH No. ${order?.location?.phone}\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                `${order?.location?.address}                               `,
                "center",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n`;

            if (order?.refundReceiptNo?.length > 0) {
              refundContent +=
                `[L]Refund Receipt[R]#${order?.refundReceiptNo}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "إيصال استرداد",
                  "left",
                  "20"
                )}</img>\n`;
            }

            refundContent +=
              `[L]Invoice[R]#${order?.orderNum}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "فاتورة",
                "left",
                "20"
              )}</img>\n` +
              `[L]Date & time[R]${order?.createdAt}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "التاريخ والوقت",
                "left",
                "20"
              )}</img>\n`;

            if (order?.customer?.name?.length > 0) {
              refundContent +=
                `[L]Customer[R]${order.customer.name}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "العميل",
                  "left",
                  "20"
                )}</img>\n`;
            }

            if (order?.customer?.vat?.length > 0) {
              refundContent +=
                `[L]Customer VAT[R]${order.customer.vat}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "العميل VAT",
                  "left",
                  "20"
                )}</img>\n`;
            }

            if (order?.showToken || order?.showOrderType) {
              refundContent += `[C]------------------------------------------------\n`;

              if (order?.showToken) {
                refundContent += `[C]<font size='big'>${order?.tokenNumber}</font>\n`;
              }

              if (order?.showOrderType) {
                refundContent += `[C]${order?.orderType}\n`;
              }
            }

            refundContent +=
              `[C]------------------------------------------------\n` +
              `[C]<b>Notice Creditor / Refund Receipt</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                "إشعار الدائن/إيصال الاسترداد                          ",
                "left",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n` +
              `[L]Description\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "الوصف",
                "left",
                "20"
              )}</img>\n` +
              `[L]Unit Price[C]Qty[R]Total\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي                                   الكمية                        سعر الوحدة",
                "left",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n`;

            order?.refunds?.[0]?.items?.map((item: any) => {
              refundContent +=
                `[L]${item.name.en}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  `${item.name.ar}`,
                  "left",
                  "20"
                )}</img>\n`;

              if (item?.modifierName) {
                refundContent += `[L]${item.modifierName}\n`;
              }

              refundContent += `[L]${item.unitPrice}[C]${item.qty}[R]${item.amount}\n`;
            });

            refundContent +=
              `[C]------------------------------------------------\n` +
              `[L]Total Taxable Amount[R]SAR ${order?.refunds?.[0]?.subTotal}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "الإجمالي الخاضع للضریبة",
                "left",
                "20"
              )}</img>\n`;

            order?.refunds?.[0]?.charges?.map((charge: any) => {
              refundContent +=
                `[L]${charge.name.en}[R]SAR ${charge.totalCharge}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  `${charge.name.ar}`,
                  "left",
                  "20"
                )}</img>\n`;
            });

            refundContent +=
              `[L]VAT Refund[R]SAR ${order?.refunds?.[0]?.vat}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "استرداد",
                "left",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n` +
              `[L]Total Refund[R]SAR ${order?.refunds?.[0]?.amount}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي الخصم",
                "left",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n`;

            order?.refunds?.[0]?.refundedTo?.map((refunded: any) => {
              refundContent += `[L]${refunded.text}[R]SAR ${refunded.value}\n`;
            });

            if (order?.location?.returnPolicy?.length > 0) {
              refundContent +=
                `[C]------------------------------------------------\n` +
                `[C]<b>Return Policy</b>\n` +
                `[L]${order.location.returnPolicy}\n`;
            }

            if (order?.location?.customText?.length > 0) {
              refundContent +=
                `[C]------------------------------------------------\n` +
                `[L]${order.location.customText}\n`;
            }

            refundContent +=
              `[C]------------------------------------------------\n` +
              `[C]<barcode type='128' height='10'>${order?.orderNum}</barcode>\n` +
              `[C]------------------------------------------------\n` +
              `[L]<qrcode size='25'>${order?.qr}</qrcode>\n` +
              `[C]------------------------------------------------\n` +
              `[C]${order?.location?.invoiceFooter || "Thank You"}\n` +
              `\n[C]<b>Powered by Tijarah360</b>\n\n` +
              `[L]\n` +
              `[L]\n` +
              `[L]\n`;

            debugLog(
              `Printer Transaction Data Found For ${printer.device_name}`,
              {},
              "kotprinterevent",
              "handleKOTPrintReceipt"
            );

            const response = await ExpoPrintHelp.printRaw(
              refundContent,
              `${printer?.printerWidthMM || "72"}`,
              "199",
              `${printer?.charsPerLine || "44"}`
            );

            // const response = await ExpoPrintHelp.printRefundUsb(
            //   JSON.stringify(order),
            //   `${printer?.printerWidthMM || "72"}`,
            //   "199",
            //   `${printer?.charsPerLine || "44"}`
            // );
            // await ExpoPrintHelp.printQR(
            //   order.qr,
            //   `${printer?.printerWidthMM || "72"}`,
            //   "199",
            //   `${printer?.charsPerLine || "44"}`
            // );
            await ExpoPrintHelp.cut();

            debugLog(
              `Refund Template Response Found For ${printer.device_name}`,
              {},
              "refund-repo.tsx",
              "refund"
            );

            printResponses.push(response);
          }
        } catch (error: any) {
          errorLog(
            error?.message,
            printer,
            "printer-repository",
            "printFunction",
            error
          );
        }
      }
    }

    setSeed(false);

    const responses = await Promise.all(printResponses);
    debugLog(`All Printed`, { responses }, "refund-repo.tsx", "refund");

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-refund", (eventData) => {
      debugLog(
        "Refund print started",
        {},
        "orders-refund-screen",
        "printRefundEvent"
      );
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-refund");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
      debugLog(
        "Refund print failed",
        {},
        "orders-refund-screen",
        "printRefundEvent"
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
        "refundevent",
        "handlePrintRefundReceipt"
      );

      debugLog(
        "Print data generated",
        {},
        "refundevent",
        "handlePrintRefundReceipt"
      );

      if (!seed) {
        return;
      }

      try {
        await printOrderReceipt();

        debugLog(
          "Print order completed",
          {},
          "refundevent",
          "handlePrintRefundReceipt"
        );

        setData(null);

        debugLog(
          "Event data emptied",
          {},
          "refundevent",
          "handlePrintRefundReceipt"
        );
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
