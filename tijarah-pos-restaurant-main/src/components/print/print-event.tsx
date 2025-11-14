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

export default function PrintEventListener() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;
  const { currency } = useCurrency() as any;

  const printOrderReceipt = async (isSecond: boolean = false) => {
    console.log(currency, "CURRENCY");

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

    const tData = MMKVDB.get("activeTableDineIn");

    for (const printer of printers) {
      const is2Inch = printer?.printerSize === "2-inch";

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

          const imageToHexRev =
            printer.printerType === "bluetooth"
              ? ExpoPrintHelp.imageToHexRevBt
              : ExpoPrintHelp.imageToHexRev;

          const order = transformOrderData({
            ...data,
          });

          const printerWidth = is2Inch ? "58" : printer.printerWidthMM;
          const charsPerLine = is2Inch ? "32" : printer.charsPerLine;

          let printContent =
            `[C]<b>${order?.location?.name?.en}</b>\n` +
            `[C]<img>${imageToHex(
              `${order?.location?.name?.ar}${" ".repeat(is2Inch ? 20 : 40)}`,
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n ${
              tData?.lable
                ? `[L]Table[R]${tData?.label}\n` +
                  `[L]<img>${imageToHex(
                    "جدول",
                    "left",
                    is2Inch ? "16" : "20"
                  )}</img>`
                : ""
            }`;

          if (order?.location?.vat?.length > 0) {
            printContent += "\n";
            printContent +=
              "[C]<font size='normal'>VAT No." +
              order.location.vat +
              "</font>\n";
          }

          const addressStr = isArabicText(order.location.address)
            ? `[C]<img>${imageToHex(
                `${order.location.address}${" ".repeat(is2Inch ? 15 : 30)}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`
            : `[C]${order.location.address}\n`;

          printContent +=
            `\n[C]PH No. ${order?.location?.phone}\n` +
            addressStr +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[L]Invoice No.\n` +
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
            printContent += `[L]Customer`;
            printContent += `\n[L]<img>${imageToHex(
              "العميل",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;
            printContent += `[C]<img>${imageToHexRev(
              `${order?.customer?.name}${" ".repeat(is2Inch ? 15 : 30)}`,
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;
          } else {
            printContent += `[L]Customer[R]${order?.customer?.name?.trim()}`;
            printContent += `\n[L]<img>${imageToHex(
              "العميل",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;
          }

          if (order?.customer?.vat) {
            printContent +=
              `[L]Customer VAT[R]${order.customer.vat}\n` +
              `[L]<img>${imageToHex(
                "العميل VAT",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;
          }

          if (order?.showToken || order?.showOrderType) {
            printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

            if (order?.showToken) {
              printContent += `[C]<font size='big'>${order?.tokenNumber}</font>\n`;
            }

            if (order?.showOrderType) {
              printContent += `[C]${order?.orderType}\n`;
            }
          }

          printContent +=
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[C]<b>Simplified Tax Invoice</b>\n` +
            `[C]<img>${imageToHex(
              ` ${"فاتورة مذكرة الخصم"}${" ".repeat(is2Inch ? 15 : 30)}`,
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
              `إجمالي${" ".repeat(is2Inch ? 16 : 20)}الكمية${" ".repeat(
                is2Inch ? 16 : 20
              )}سعر الوحدة`,
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n` +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          order?.items?.map((item: any) => {
            printContent +=
              `[L]${item.name.en}\n` +
              `[L]<img>${imageToHex(
                `${item.name.ar}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;

            if (item?.modifierName) {
              printContent += `[L]${item.modifierName}\n`;
            }

            if (item?.note) {
              printContent += `[L]${item?.note}\n`;
            }

            printContent += `[L]${item.unitPrice}[C]${item.quantity}[R]${
              item?.isFree ? "FREE" : `${item.billing.total}   `
            }\n`;

            if (Number(item?.billing?.discountAmount) > 0 || item?.isFree) {
              printContent += `[R](Org) ${item.billing.exactTotal}\n`;
            }
          });

          if (Number(order.payment.discountAmount) > 0) {
            const itemsTotalLine = await formatPrinterLine(
              printer.printerType === "bluetooth" ? true : false,
              "Items Total",
              "إجمالي العناصر",
              order.payment.subTotalWithoutDiscount,
              currency,
              is2Inch,
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
              is2Inch,
              {
                printerWidthMM: printer.printerWidthMM,
                charsPerLine: printer.charsPerLine,
              }
            );

            printContent += discountLine;
          }
          printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          console.log(currency, "CURRENCY");

          const totalTaxableAmountLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total Taxable Amount",
            "الإجمالي الخاضع للضریبة",
            order.payment.subTotal,
            currency,
            is2Inch,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );

          printContent += totalTaxableAmountLine;
          printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          order?.payment?.charges?.map((charge: any) => {
            printContent +=
              `[L]${charge.name.en}[R]SAR ${charge.total}\n` +
              `[L]<img>${imageToHex(
                `${charge.name.ar}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;
          });
          if (order?.payment?.charges?.length > 0) {
            printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;
          }

          const vatLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "VAT Added",
            "تمت إضافة ضريبة القيمة المضافة",
            order.payment.vatAmount,
            currency,
            is2Inch,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );
          printContent += vatLine;

          const totalAmountLine = await formatPrinterLine(
            printer.printerType === "bluetooth" ? true : false,
            "Total Amount",
            "المبلغ الإجمالي",
            order.payment.total,
            currency,
            is2Inch,
            {
              printerWidthMM: printer.printerWidthMM,
              charsPerLine: printer.charsPerLine,
            }
          );
          printContent += totalAmountLine;

          printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

          if (order?.payment?.breakup?.length > 0) {
            for (const breakup of order.payment.breakup) {
              const breakdownAmountLine = await formatPrinterLine(
                printer.printerType === "bluetooth" ? true : false,
                breakup.name,
                null,
                breakup.total,
                currency,
                is2Inch,
                {
                  printerWidthMM: printer.printerWidthMM,
                  charsPerLine: printer.charsPerLine,
                }
              );
              printContent += breakdownAmountLine;
            }
          }

          if (order?.specialInstructions?.length > 0) {
            printContent +=
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[C]<b>Special Instructions</b>\n` +
              `[C]<img>${imageToHexRev(
                `تعليمات خاصة${" ".repeat(is2Inch ? 15 : 30)}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]${order?.specialInstructions}\n`;
          }

          if (order?.location?.returnPolicy?.length > 0) {
            printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;
            printContent += `[C]<b>Return Policy</b>\n`;
            if (isArabicText(order?.location?.returnPolicy)) {
              printContent += `[C]<img>${imageToHex(
                `سياسة العائدات${" ".repeat(is2Inch ? 15 : 30)}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n`;
              const returnPolicyParts = getMultiLineReturnPolicy(
                order.location.returnPolicy
              );
              for (const part of returnPolicyParts) {
                printContent += `[C]<img>${imageToHexRev(
                  part,
                  "center",
                  is2Inch ? "16" : "20"
                )}</img>\n`;
              }
            } else {
              printContent += `[L]${order.location.returnPolicy}\n`;
            }
          }

          if (order?.location?.customText?.length > 0) {
            if (isArabicText(order?.location.customText)) {
              printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;
              const customTextParts = getMultiLineReturnPolicy(
                order.location.customText
              );
              for (const part of customTextParts) {
                printContent += `[L]<img>${imageToHexRev(
                  part,
                  "center",
                  is2Inch ? "16" : "20"
                )}</img>\n`;
              }
            } else {
              printContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;
              printContent += `[L]${order.location.customText}\n`;
            }
          }

          printContent +=
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[C]<qrcode size='${is2Inch ? "20" : "25"}'>${
              order?.qr
            }</qrcode>\n` +
            `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
            `[C]${order?.location?.invoiceFooter || "Thank You"}\n` +
            `\n[C]<b>Powered by Tijarah360</b>\n\n` +
            `${is2Inch ? "" : "[L]\n" + "[L]\n" + "[L]\n"}`;

          const response =
            printer.printerType === "bluetooth"
              ? await ExpoPrintHelp.printRawBt(
                  printContent,
                  printerWidth,
                  is2Inch ? "160" : "199",
                  charsPerLine
                )
              : await ExpoPrintHelp.printRaw(
                  printContent,
                  printerWidth,
                  is2Inch ? "160" : "199",
                  charsPerLine
                );
          console.log(response);
          if (printer.printerType !== "bluetooth") {
            if (data?.kickDrawer) {
              if (data?.noOfPrints?.length === 1) {
                await ExpoPrintHelp.openCashDrawer();
                await ExpoPrintHelp.cut();
              } else if (!isSecond) {
                await ExpoPrintHelp.cut();
              }
            } else {
              await ExpoPrintHelp.cut();
            }
          }

          printResponses.push(response);
        }
      } catch (error: any) {
        console.log(error);
      }
      // }
    }

    setSeed(false);

    const responses = await Promise.all(printResponses);

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-order", (eventData) => {
      console.log("event received");
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-order");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
      setData(null);
      setSeed(!seed);
    });
    return () => {
      EventRegister.removeEventListener("print-error");
    };
  }, []);

  useMemo(() => {
    const serialPrint = async () => {
      console.log("serail print called");
      if (!seed) {
        return;
      }

      try {
        await printOrderReceipt();
        console.log("----", data?.noOfPrints?.length);

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
