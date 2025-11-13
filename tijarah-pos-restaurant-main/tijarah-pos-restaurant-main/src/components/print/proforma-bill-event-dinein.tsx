import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { transformOrderData } from "../../utils/transform-order-data";
import MMKVDB from "../../utils/DB-MMKV";
import repository from "../../db/repository";
import isArabicText from "../../utils/language-detector";
import { useCurrency } from "../../store/get-currency";
import { formatPrinterLine } from "./print-formatter";

function getMultiLineReturnPolicy(returnPolicy: string): string[] {
  const lines = returnPolicy.split("\n");
  const parts = [];
  let currentPart = "";
  for (const line of lines) {
    if (currentPart.length > 0 && currentPart.length + line.length > 48) {
      parts.push(currentPart.trim());
      currentPart = "";
    }
    currentPart += line;
  }
  if (currentPart.length > 0) {
    parts.push(currentPart.trim());
  }
  return parts;
}

export default function PerformaBillEventDinein() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;
  const { currency } = useCurrency();

  const printOrderReceipt = async (isSecond: boolean = false) => {
    const allprinters = await repository.printerRepository.findByType("usb");
    const allBtPrinters = await repository.printerRepository.findByType(
      "bluetooth"
    );
    const printers = [...allprinters, ...allBtPrinters].filter(
      (p) => p.enableReceipts
    );

    console.log("printers found", printers);

    if (printers.length === 0) {
      throw new Error("No printed selected");
    }

    const printResponses: any[] = [];

    for (const printer of printers) {
      const printerWidth = printer.printerWidthMM;
      const charsPerLine = printer.charsPerLine;

      try {
        let receiptPrinter = null;
        if (printer.printerType === "usb") {
          receiptPrinter = await ExpoPrintHelp.connect(printer.product_id);
        }

        if (receiptPrinter || printer.printerType === "bluetooth") {
          const order = transformOrderData({
            ...data,
          });

          const imageToHex =
            printer.printerType === "bluetooth"
              ? ExpoPrintHelp.imageToHexBt
              : ExpoPrintHelp.imageToHex;

          const imageToHexRev =
            printer.printerType === "bluetooth"
              ? ExpoPrintHelp.imageToHexRevBt
              : ExpoPrintHelp.imageToHexRev;

          let printContent =
            `[C]<b>${order?.location?.name?.en}</b>\n` +
            `[C]<img>${imageToHex(
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
            `[C]<img>${imageToHex(
              `${order?.location?.address}                               `,
              "center",
              "20"
            )}</img>\n` +
            `[L]Table[R]${tData?.label}\n` +
            `[L]<img>${imageToHex("جدول", "left", "20")}</img>\n` +
            `[L]Date & time[R]${order?.createdAt}\n` +
            `[L]<img>${imageToHex("التاريخ والوقت", "left", "20")}</img>\n`;

          if (order?.customer?.name?.length > 0) {
            printContent +=
              `[L]Customer[R]${order.customer.name}\n` +
              `[L]<img>${imageToHex("العميل", "left", "20")}</img>\n`;
          }

          if (order?.customer?.vat?.length > 0) {
            printContent +=
              `[L]Customer VAT[R]${order.customer.vat}\n` +
              `[L]<img>${imageToHex("العميل VAT", "left", "20")}</img>\n`;
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
            `[C]<img>${imageToHex(
              "الفاتورة الأولية                                     ",
              "left",
              "20"
            )}</img>\n` +
            `[C]------------------------------------------------\n` +
            `[L]Description\n` +
            `[L]<img>${imageToHex("الوصف", "left", "20")}</img>\n` +
            `[L]Unit Price[C]Qty[R]Total   \n` +
            `[L]<img>${imageToHex(
              "إجمالي                                   الكمية                        سعر الوحدة",
              "left",
              "20"
            )}</img>\n` +
            `[C]------------------------------------------------\n`;

          order?.items?.map((item: any) => {
            printContent +=
              `[L]${item.name.en}\n` +
              `[L]<img>${imageToHex(`${item.name.ar}`, "left", "20")}</img>\n`;

            if (item?.modifierName) {
              printContent += `[L]${item.modifierName}\n`;
            }

            if (item?.note) {
              printContent += `[L]${item?.note}\n`;
            }

            printContent += `[L]${item.unitPrice}[C]${item.quantity}[R]${item.billing.total}   \n`;
          });

          if (Number(order.payment.discountAmount) > 0) {
            printContent += `[C]------------------------------------------------\n`;

            const itemsTotalLine = await formatPrinterLine(
              printer.printerType === "bluetooth" ? true : false,
              "Items Total",
              "إجمالي العناصر",
              order.payment.subTotalWithoutDiscount,
              currency,
              false,
              {
                printerWidthMM: printer.printerWidthMM,
                charsPerLine: printer.charsPerLine,
              }
            );

            printContent += itemsTotalLine;

            const discountLine = await formatPrinterLine(
              printer.printerType === "bluetooth" ? true : false,
              "Total Discount",
              "إجمالي الخصم",
              order.payment.discountAmount,
              currency,
              false,
              {
                printerWidthMM: printer.printerWidthMM,
                charsPerLine: printer.charsPerLine,
              }
            );

            printContent += discountLine;
          }

          printContent += `[C]------------------------------------------------\n`;

          const totalTaxableAmountLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total Taxable Amount",
            "الإجمالي الخاضع للضریبة",
            order.payment.subTotal,
            currency,
            false,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );

          printContent += totalTaxableAmountLine;

          if (order?.payment?.charges) {
            for (const charge of order.payment.charges) {
              const chargeLine = await formatPrinterLine(
                printer.printerType === "bluetooth" ? true : false,
                charge.name.en,
                charge.name.ar,
                charge.total,
                currency,
                false,
                {
                  printerWidthMM: printer.printerWidthMM,
                  charsPerLine: printer.charsPerLine,
                }
              );
              printContent += chargeLine;
            }
          }

          const vatLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total VAT",
            "إجمالي ضريبة القيمة المضافة",
            order.payment.vatAmount,
            currency,
            false,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );
          printContent += vatLine;

          printContent += `[C]------------------------------------------------\n`;

          const totalAmountLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total Amount",
            "المبلغ الإجمالي",
            order.payment.total,
            currency,
            false,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );
          printContent += totalAmountLine;

          if (order?.specialInstructions?.length > 0) {
            printContent +=
              `[C]------------------------------------------------\n` +
              `[C]<b>Special Instructions</b>\n` +
              `[C]<img>${imageToHex(
                "تعليمات خاصة                                  ",
                "left",
                "20"
              )}</img>\n` +
              `[L]${order?.specialInstructions}\n`;
          }

          if (order?.location?.returnPolicy?.length > 0) {
            printContent += `[C]${"-".repeat(48)}\n`;
            printContent += `[C]<b>Return Policy</b>\n`;
            if (isArabicText(order?.location?.returnPolicy)) {
              printContent += `[C]<img>${imageToHex(
                `سياسة العائدات${" ".repeat(30)}`,
                "left",
                "20"
              )}</img>\n`;
              const returnPolicyParts = getMultiLineReturnPolicy(
                order.location.returnPolicy
              );
              for (const part of returnPolicyParts) {
                printContent += `[C]<img>${imageToHexRev(
                  part,
                  "center",
                  "20"
                )}</img>\n`;
              }
            } else {
              printContent += `[L]${order.location.returnPolicy}\n`;
            }
          }

          if (order?.location?.customText?.length > 0) {
            if (isArabicText(order?.location.customText)) {
              printContent += `[C]${"-".repeat(48)}\n`;
              const customTextParts = getMultiLineReturnPolicy(
                order.location.customText
              );
              for (const part of customTextParts) {
                printContent += `[L]<img>${imageToHexRev(
                  part,
                  "center",
                  "20"
                )}</img>\n`;
              }
            } else {
              printContent += `[C]${"-".repeat(48)}\n`;
              printContent += `[L]${order.location.customText}\n`;
            }
          }

          printContent +=
            `[C]${order?.location?.invoiceFooter || "Thank You"}\n` +
            `\n[C]<b>Powered by Tijarah360</b>\n\n` +
            `\n[C]<b>PAYMENT PENDING</b>\n\n` +
            `[L]\n` +
            `[L]\n` +
            `[L]\n`;

          const response =
            printer.printerType === "usb"
              ? await ExpoPrintHelp.printRaw(
                  printContent,
                  printerWidth,
                  "199",
                  charsPerLine
                )
              : await ExpoPrintHelp.printRawBt(
                  printContent,
                  printerWidth,
                  "199",
                  charsPerLine
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
          if (printer.printerType !== "bluetooth") {
            if (data?.kickDrawer) {
              if (data?.noOfPrints?.length === 1) {
                ExpoPrintHelp.openCashDrawer();
              } else if (!isSecond) {
                await ExpoPrintHelp.cut();
              }
            } else {
              await ExpoPrintHelp.cut();
            }
          }

          printResponses.push(response);
        }
      } catch (error: any) {}
    }

    setSeed(false);

    const responses = await Promise.all(printResponses);

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-performa-bill", (eventData) => {
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-performa-bill");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-performa-error", () => {
      setData(null);
      setSeed(false);
    });
    return () => {
      EventRegister.removeEventListener("print-performa-error");
    };
  }, []);

  useMemo(() => {
    const serialPrint = async () => {
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

        setData(null);
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
