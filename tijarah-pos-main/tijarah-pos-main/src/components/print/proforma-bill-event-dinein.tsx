import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { PrinterModel } from "../../database/printer/printer";
import { db } from "../../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../../utils/log-patch";
import { transformOrderData } from "../../utils/transform-order-data";
import MMKVDB from "../../utils/DB-MMKV";

export default function PerformaBillEventDinein() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;

  const printOrderReceipt = async (isSecond: boolean = false) => {
    const printerModel = db.getRepository(PrinterModel);

    ExpoPrintHelp.initialize();

    const printers = await printerModel.find({
      where: { enableReceipts: true, printerType: "usb" },
    });

    debugLog("Printers Found", { printers }, "printer-repo.tsx", "print");

    if (printers.length === 0) {
      debugLog(
        "No Printers Found",
        { printers: [] },
        "printer-repo.tsx",
        "print"
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
            "printer-repo.tsx",
            "print"
          );

          if (receiptPrinter) {
            const order = transformOrderData({
              ...data,
            });

            debugLog(
              `Printer Order Data Found For ${printer.device_name}`,
              order,
              "printer-repo.tsx",
              "print"
            );

            let printContent =
              `[C]<b>${order?.location?.name?.en}</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                `${order?.location?.name?.ar}                                     `,
                "center",
                "20"
              )}</img>\n`;

            const tData = MMKVDB.get("activeTableDineIn");

            if (order?.location?.vat?.length > 0) {
              printContent += `[C]VAT No. ${order.location.vat}\n`;
            }

            printContent +=
              `[C]PH No. ${order?.location?.phone}\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                `${order?.location?.address}                               `,
                "center",
                "20"
              )}</img>\n` +
              `[L]Table[R]${tData?.label}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "جدول",
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
              printContent +=
                `[L]Customer[R]${order.customer.name}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "العميل",
                  "left",
                  "20"
                )}</img>\n`;
            }

            if (order?.customer?.vat?.length > 0) {
              printContent +=
                `[L]Customer VAT[R]${order.customer.vat}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "العميل VAT",
                  "left",
                  "20"
                )}</img>\n`;
            }

            if (order?.showToken || order?.showOrderType) {
              printContent += `[C]------------------------------------------------\n`;

              if (order?.showToken) {
                printContent += `[C]<font size='big'>${order?.tokenNumber}</font>\n`;
              }

              if (order?.showOrderType) {
                printContent += `[C]${order?.orderType}\n`;
              }
            }

            printContent +=
              `[C]------------------------------------------------\n` +
              `[C]<b>Proforma Invoice</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                "الفاتورة الأولية                                     ",
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

            order?.items?.map((item: any) => {
              printContent +=
                `[L]${item.name.en}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  `${item.name.ar}`,
                  "left",
                  "20"
                )}</img>\n`;

              if (item?.modifierName) {
                printContent += `[L]${item.modifierName}\n`;
              }

              if (item?.note) {
                printContent += `[L]${item?.note}\n`;
              }

              printContent += `[L]${item.unitPrice}[C]${item.quantity}[R]${item.billing.total}\n`;
            });

            if (Number(order.payment.discountAmount) > 0) {
              printContent +=
                `[C]------------------------------------------------\n` +
                `[L]Items Total[R]SAR ${order.payment.subTotalWithoutDiscount}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "إجمالي العناصر",
                  "left",
                  "20"
                )}</img>\n` +
                `[L]Total Discount[R]SAR ${order.payment.discountAmount}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  "إجمالي الخصم",
                  "left",
                  "20"
                )}</img>\n`;
            }

            printContent +=
              `[C]------------------------------------------------\n` +
              `[L]Total Taxable Amount[R]SAR ${order.payment.subTotal}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "الإجمالي الخاضع للضریبة",
                "left",
                "20"
              )}</img>\n`;

            order?.payment?.charges?.map((charge: any) => {
              printContent +=
                `[L]${charge.name.en}[R]SAR ${charge.total}\n` +
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  `${charge.name.ar}`,
                  "left",
                  "20"
                )}</img>\n`;
            });

            printContent +=
              `[L]Total VAT[R]SAR ${order.payment.vatAmount}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي ضريبة القيمة المضافة",
                "left",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n` +
              `[L]Total Amount[R]SAR ${order.payment.total}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "المبلغ الإجمالي",
                "left",
                "20"
              )}</img>\n`;

            if (order?.payment?.breakup?.length > 0) {
              printContent += `[C]------------------------------------------------\n`;

              order?.payment?.breakup?.map((breakup: any) => {
                printContent += `[L]${breakup.name}[R]SAR ${breakup.total}\n`;
              });
            }

            if (order?.specialInstructions?.length > 0) {
              printContent +=
                `[C]------------------------------------------------\n` +
                `[C]<b>Special Instructions</b>\n` +
                `[C]<img>${ExpoPrintHelp.imageToHex(
                  "تعليمات خاصة                                  ",
                  "left",
                  "20"
                )}</img>\n` +
                `[L]${order?.specialInstructions}\n`;
            }

            if (order?.location?.returnPolicy?.length > 0) {
              printContent +=
                `[C]------------------------------------------------\n` +
                `[C]<b>Return Policy</b>\n` +
                `[L]${order.location.returnPolicy}\n`;
            }

            if (order?.location?.customText?.length > 0) {
              printContent +=
                `[C]------------------------------------------------\n` +
                `[L]${order.location.customText}\n`;
            }

            printContent +=
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
              printContent,
              `${printer?.printerWidthMM || "72"}`,
              "199",
              `${printer?.charsPerLine || "44"}`
            );

            // const response = await ExpoPrintHelp.printUsb(
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

            debugLog(
              `Printer Template Response Found For ${printer.device_name}`,
              {},
              "printer-repo.tsx",
              "print"
            );

            if (data?.kickDrawer) {
              if (data?.noOfPrints?.length === 1) {
                ExpoPrintHelp.openCashDrawer();
              } else if (!isSecond) {
                await ExpoPrintHelp.cut();
              }
            } else {
              await ExpoPrintHelp.cut();
            }

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
    debugLog(`All Printed`, { responses }, "printer-repo.tsx", "print");

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-performa-bill", (eventData) => {
      debugLog(
        "Perfroma Print event received",
        {},
        "performaprinterevent",
        "handlePerformaReciept"
      );

      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-performa-bill");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-performa-error", () => {
      debugLog(
        "Performe Print error received",
        {},
        "performaprinterevent",
        "handlePerformaPrintRecieved"
      );
      setData(null);
      setSeed(false);
    });
    return () => {
      EventRegister.removeEventListener("print-performa-error");
    };
  }, []);

  useMemo(() => {
    const serialPrint = async () => {
      debugLog(
        "Serial Print Called",
        {},
        "printerevent",
        "handlePrintOrderReceipt"
      );

      debugLog(
        "Print data generated",
        {},
        "printerevent",
        "handlePrintOrderReceipt"
      );

      if (!seed) {
        return;
      }

      try {
        await printOrderReceipt();

        if (data?.noOfPrints?.length > 1) {
          await printOrderReceipt(true);

          if (data?.kickDrawer) {
            ExpoPrintHelp.openCashDrawer();
          }
        }

        debugLog(
          "Print order completed",
          {},
          "printerevent",
          "handlePrintOrderReceipt"
        );

        setData(null);

        debugLog(
          "Event data emptied",
          {},
          "printerevent",
          "handlePrintOrderReceipt"
        );
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
