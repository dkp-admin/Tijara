import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../db/repository";
import { useCurrency } from "../../store/get-currency";
import isArabicText from "../../utils/language-detector";
import { transformRefundData } from "../../utils/transform-refund-data";
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

export default function RefundEvent() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;
  const { currency } = useCurrency();

  const printOrderReceipt = async () => {
    const allprinters = await repository.printerRepository.findByType("usb");
    const allBtPrinters = await repository.printerRepository.findByType(
      "bluetooth"
    );
    const printers = [...allprinters, ...allBtPrinters].filter(
      (p) => p.enableReceipts
    );

    if (printers.length === 0) {
      throw new Error("No printed selected");
    }

    const printResponses: any[] = [];

    for (const printer of printers) {
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

          const imageToHexRev =
            printer.printerType === "bluetooth"
              ? ExpoPrintHelp.imageToHexRevBt
              : ExpoPrintHelp.imageToHexRev;

          const order = transformRefundData({
            ...data,
          });

          const is2Inch = printer?.printerSize === "2-inch";
          const printerWidth = is2Inch ? "58" : printer.printerWidthMM;
          const charsPerLine = is2Inch ? "32" : printer.charsPerLine;

          const addressStr = isArabicText(order.location.address)
            ? `[C]<img>${imageToHex(
                `${order.location.address}${" ".repeat(is2Inch ? 15 : 30)}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`
            : `[C]${order.location.address}\n`;

          let refundContent =
            `[C]<b>${order?.location?.name?.en}</b>\n` +
            `[C]<img>${imageToHex(
              `${order?.location?.name?.ar}${" ".repeat(is2Inch ? 20 : 40)}`,
              "center",
              is2Inch ? "16" : "20"
            )}</img>\n`;

          if (order?.location?.vat?.length > 0) {
            refundContent += `[C]VAT No. ${order.location.vat}\n`;
          }

          refundContent +=
            `[C]PH No. ${order?.location?.phone}\n` +
            addressStr +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          if (order?.refundReceiptNo?.length > 0) {
            refundContent +=
              `[L]Refund Receipt No.\n` +
              `[L]<img>${imageToHex(
                "إيصال استرداد",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n[L]#${order?.refundReceiptNo}\n`;
          }

          refundContent +=
            `[L]Invoice Reference No.\n` +
            `[L]<img>${imageToHex(
              "فاتورة",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n[L]#${order?.orderNum}\n` +
            `${
              is2Inch
                ? `[L]Date[R]${
                    order?.createdAt?.split(",")?.[0]
                  }\n[L]Time[R]${order?.createdAt?.split(",")?.[1]?.trim()}\n`
                : `[L]Date & time[R]${order?.createdAt}\n`
            }` +
            `[L]<img>${imageToHex(
              "التاريخ والوقت",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;

          if (
            order.customer.name.length > 0 &&
            isArabicText(order.customer.name)
          ) {
            refundContent += `[L]Customer`;
            refundContent += `\n[L]<img>${imageToHex(
              "العميل",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;
            refundContent += `[C]<img>${imageToHexRev(
              `${order?.customer?.name}${" ".repeat(is2Inch ? 15 : 30)}`,
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;
          } else {
            refundContent += `[L]Customer[R]${order?.customer?.name?.trim()}`;
            refundContent += `\n[L]<img>${imageToHex(
              "العميل",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;
          }

          if (order?.customer?.vat?.length > 0) {
            refundContent +=
              `[L]Customer VAT[R]${order.customer.vat}\n` +
              `[L]<img>${imageToHex(
                "العميل VAT",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;
          }

          if (order?.showToken || order?.showOrderType) {
            refundContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

            if (order?.showToken) {
              refundContent += `[C]<font size='big'>${order?.tokenNumber}</font>\n`;
            }

            if (order?.showOrderType) {
              refundContent += `[C]${order?.orderType}\n`;
            }
          }

          refundContent +=
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[C]<b>Notice Creditor / Refund Receipt</b>\n` +
            `[C]<img>${imageToHex(
              `إشعار الدائن/إيصال الاسترداد${" ".repeat(is2Inch ? 15 : 30)}`,
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n` +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[L]Description\n` +
            `[L]<img>${imageToHex(
              "الوصف",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n` +
            `[L]Unit Price[C]Qty[R]Total   \n` +
            `[L]<img>${imageToHex(
              `إجمالي${" ".repeat(is2Inch ? 20 : 40)}الكمية${" ".repeat(
                is2Inch ? 20 : 40
              )}سعر الوحدة`,
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n` +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          order?.refunds?.[0]?.items?.map((item: any) => {
            refundContent +=
              `[L]${item.name.en}\n` +
              `[L]<img>${imageToHex(
                `${item.name.ar}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;

            if (item?.modifierName) {
              refundContent += `[L]${item.modifierName}\n`;
            }

            refundContent += `[L]${item.unitPrice}[C]${item.qty}[R]${item.amount}   \n`;
          });

          refundContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          const totalTaxableAmountLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total Taxable Amount",
            "الإجمالي الخاضع للضریبة",
            order?.refunds?.[0]?.subTotal,
            currency,
            is2Inch,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );

          refundContent += totalTaxableAmountLine;
          for (const charge of order?.refunds?.[0]?.charges ?? []) {
            const chargeLine = await formatPrinterLine(
              printer.printerType === "bluetooth" ? true : false,
              charge.name.en,
              charge.name.ar,
              charge.totalCharge,
              currency,
              is2Inch,
              {
                printerWidthMM: printer.printerWidthMM,
                charsPerLine: printer.charsPerLine,
              }
            );
            refundContent += chargeLine;
          }

          const vatRefundLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "VAT Refund",
            "استرداد",
            order?.refunds?.[0]?.vat,
            currency,
            is2Inch,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );
          refundContent += vatRefundLine;

          refundContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          const totalRefundLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total Refund",
            "إجمالي الخصم",
            order?.refunds?.[0]?.amount,
            currency,
            is2Inch,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );
          refundContent += totalRefundLine;

          async function convertAmount(label: string, value: string) {
            const formattedLine = await formatPrinterLine(
              printer.printerType === "bluetooth" ? true : false,
              label,
              null,
              value,
              currency,
              is2Inch,
              {
                printerWidthMM: printer.printerWidthMM,
                charsPerLine: printer.charsPerLine,
              }
            );
            return formattedLine;
          }

          if (order?.refunds?.[0]?.refundedTo) {
            refundContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;
            for (const refunded of order.refunds[0].refundedTo) {
              const convertedValue = await convertAmount(
                refunded.text,
                refunded.value
              );
              refundContent += convertedValue;
            }
          }

          if (order?.location?.returnPolicy?.length > 0) {
            if (isArabicText(order?.location?.returnPolicy)) {
              refundContent +=
                `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
                `[C]<b>Return Policy</b>\n` +
                `[C]<img>${imageToHex(
                  `سياسة العائدات${" ".repeat(is2Inch ? 15 : 30)}`,
                  "left",
                  is2Inch ? "16" : "20"
                )}</img>\n`;
              const returnPolicyParts = getMultiLineReturnPolicy(
                order.location.returnPolicy
              );
              for (const part of returnPolicyParts) {
                refundContent += `[C]<img>${imageToHexRev(
                  part,
                  "left",
                  is2Inch ? "16" : "20"
                )}</img>\n`;
              }
            } else {
              refundContent +=
                `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
                `[C]<b>Return Policy</b>\n` +
                `[L]${order.location.returnPolicy}\n`;
            }
          }

          if (order?.location?.customText?.length > 0) {
            if (isArabicText(order?.location.customText)) {
              refundContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;
              const customTextParts = getMultiLineReturnPolicy(
                order.location.customText
              );
              for (const part of customTextParts) {
                refundContent += `[L]<img>${imageToHexRev(
                  part,
                  "left",
                  is2Inch ? "16" : "20"
                )}</img>\n`;
              }
            } else {
              refundContent +=
                `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
                `[L]${order.location.customText}\n`;
            }
          }
          refundContent +=
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[C]<qrcode size='25'>${order?.qr}</qrcode>\n` +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[C]${order?.location?.invoiceFooter || "Thank You"}\n` +
            `\n[C]<b>Powered by Tijarah360</b>\n\n` +
            `${is2Inch ? "" : "[L]\n[L]\n[L]\n"}`;

          const response =
            printer.printerType === "usb"
              ? await ExpoPrintHelp.printRaw(
                  refundContent,
                  printerWidth,
                  is2Inch ? "160" : "199",
                  charsPerLine
                )
              : await ExpoPrintHelp.printRawBt(
                  refundContent,
                  printerWidth,
                  is2Inch ? "160" : "199",
                  charsPerLine
                );

          if (printer.printerType === "usb") {
            await ExpoPrintHelp.cut();
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
    EventRegister.addEventListener("print-refund", (eventData) => {
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-refund");
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
        await printOrderReceipt();

        setData(null);
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
