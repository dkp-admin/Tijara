import { format } from "date-fns";
import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { ChannelsName } from "../../utils/constants";

import repository from "../../db/repository";
import MMKVDB from "../../utils/DB-MMKV";
import { Printer } from "../../db/schema/printer";

export default function KOTEventListener() {
  const [data, setData] = useState([]) as any;
  const [seed, setSeed] = useState(false) as any;

  const printKOTReceipt = async () => {
    const calculateTotalQty = (items: any[] | undefined): number => {
      if (!items || !Array.isArray(items)) {
        return 0;
      }
      return items.reduce((total: number, item: any) => {
        const qty = typeof item?.qty === "number" ? item.qty : 0;
        return total + qty;
      }, 0);
    };

    for (const d of data) {
      const totalQTY = calculateTotalQty(d?.items || []);

      const printResponses: any[] = [];

      const allprinters: Printer[] = [];

      const printerPromises =
        d?.kitchenRefs?.map((kitchenRef: any) =>
          repository.printerRepository.findByKitchen(kitchenRef)
        ) || [];

      const printerResults = await Promise.all(printerPromises);

      allprinters.push(...printerResults.filter(Array.isArray).flat());

      const printers = allprinters.filter((p) => p.enableKOT);

      if (printers.length > 0) {
        const printResponses: any[] = [];

        for (const printer of printers) {
          if (printer?.device_name) {
            try {
              const receiptPrinter = await ExpoPrintHelp.connect(
                printer.product_id
              );

              if (receiptPrinter) {
                const is2Inch = printer?.printerSize === "2-inch";
                const printerWidth = is2Inch ? "58" : printer.printerWidthMM;
                const charsPerLine = is2Inch ? "32" : printer.charsPerLine;

                const tData =
                  d?.orderType === "Dine-in"
                    ? {
                        label: d?.dineInData?.table,
                      }
                    : MMKVDB.get("activeTableDineIn") || "";

                const imageToHex =
                  printer.printerType === "bluetooth"
                    ? ExpoPrintHelp.imageToHexBt
                    : ExpoPrintHelp.imageToHex;

                let kotContent =
                  `[C]<b>${d?.location?.en}</b>\n` +
                  `[C]<img>${imageToHex(
                    `${d?.location?.ar}${" ".repeat(is2Inch ? 20 : 40)}`,
                    "center",
                    is2Inch ? "16" : "20"
                  )}</img>\n` +
                  (d?.orderType === "Dine-in" && tData?.label
                    ? `[L]Table[R]${tData?.label || ""}\n` +
                      `[L]<img>${imageToHex(
                        "جدول",
                        "left",
                        is2Inch ? "16" : "20"
                      )}</img>\n`
                    : "") +
                  (d?.orderNum
                    ? `[L]Invoice[R]#${d?.orderNum}\n` +
                      `[L]<img>${imageToHex(
                        "رقم الفاتورة",
                        "left",
                        is2Inch ? "16" : "20"
                      )}</img>\n`
                    : "") +
                  `${
                    is2Inch
                      ? `[L]Date[R]${format(
                          new Date(d?.createdAt),
                          "yyyy-MM-dd"
                        )}\n[L]Time[R]${format(
                          new Date(d?.createdAt),
                          "hh:mm:ssa"
                        )}\n`
                      : `[L]Date & time[R]${format(
                          new Date(d?.createdAt),
                          "yyyy-MM-dd, hh:mm:ssa"
                        )}\n`
                  }` +
                  `[L]<img>${imageToHex(
                    "التاريخ والوقت",
                    "left",
                    is2Inch ? "16" : "20"
                  )}</img>\n`;

                if (d?.showToken || d?.showOrderType) {
                  kotContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

                  if (d?.showToken) {
                    kotContent += `[C]<font size='big'>${d?.tokenNum}</font>\n`;
                  }

                  if (d?.showOrderType) {
                    kotContent += `[C]${
                      ChannelsName[d?.orderType] || d?.orderType
                    }\n`;
                  }
                }

                kotContent +=
                  `[C]<b>KOT</b>\n` +
                  `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
                  `[L]Description[R]Qty\n` +
                  `[L]<img>${imageToHex(
                    `الكمية${" ".repeat(is2Inch ? 45 : 40)}الوصف`,
                    "left",
                    is2Inch ? "16" : "20"
                  )}</img>\n` +
                  `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

                d?.items?.map((item: any) => {
                  const boxNameEn =
                    item.type === "box"
                      ? `, (Box ${item.noOfUnits} Units)`
                      : item.type === "crate"
                      ? `, (Crate ${item.noOfUnits} Units)`
                      : "";
                  const boxNameAr =
                    item.type === "box"
                      ? `, (القطع ${item.noOfUnits} صندوق)`
                      : item.type === "crate"
                      ? `, (القطع ${item.noOfUnits} قفص)`
                      : "";

                  const variantNameEn = item.hasMultipleVariants
                    ? ` - ${item.variantNameEn}`
                    : "";
                  const variantNameAr = item.hasMultipleVariants
                    ? ` - ${item.variantNameAr}`
                    : "";

                  const itemNameEn = `${item.name.en}${variantNameEn}${boxNameEn}`;
                  const itemNameAr = `${item.name.ar}${variantNameAr}${boxNameAr}`;
                  const itemNotes = `${item.note}`;

                  let modifierName = "";

                  if (item?.modifiers || item?.modifiers?.length > 0) {
                    item?.modifiers?.map((mod: any) => {
                      modifierName += `${modifierName === "" ? "" : ", "}${
                        mod.optionName
                      }`;
                    });
                  }

                  kotContent +=
                    `[L]${itemNameEn}[R]${item?.qty}\n` +
                    `[L]<img>${imageToHex(
                      `${itemNameAr}`,
                      "left",
                      is2Inch ? "16" : "20"
                    )}</img>\n`;

                  if (modifierName) {
                    kotContent += `[L]${modifierName}\n`;
                  }
                  kotContent += `[L]${itemNotes}\n`;
                });

                kotContent +=
                  `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
                  `[L]Total QTY[R]${totalQTY}\n` +
                  `[L]<img>${imageToHex(
                    "إجمالي الكمية",
                    "left",
                    is2Inch ? "16" : "20"
                  )}</img>\n`;

                if (d?.specialInstructions?.length > 0) {
                  kotContent +=
                    `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
                    `[C]<b>Special Instructions</b>\n` +
                    `[C]<img>${imageToHex(
                      `تعليمات خاصة${" ".repeat(is2Inch ? 15 : 30)}`,
                      "left",
                      is2Inch ? "16" : "20"
                    )}</img>\n` +
                    `[L]${d?.specialInstructions}\n`;
                }

                kotContent += `${is2Inch ? "" : "[L]\n" + "[L]\n" + "[L]\n"}`;

                // Print multiple copies based on numberOfKots setting
                const numCopies = printer?.numberOfKots || 1;
                console.log(numCopies, "NUM COPIES");

                for (let i = 0; i < numCopies; i++) {
                  const response =
                    printer.printerType === "usb"
                      ? ExpoPrintHelp.printRaw(
                          kotContent,
                          printerWidth,
                          is2Inch ? "160" : "199",
                          charsPerLine
                        )
                      : ExpoPrintHelp.printRawBt(
                          kotContent,
                          printerWidth,
                          is2Inch ? "160" : "199",
                          charsPerLine
                        );

                  if (printer.printerType === "usb") {
                    await ExpoPrintHelp.cut();
                  }
                  printResponses.push(response);
                }
              }
            } catch (error: any) {}
          }
        }

        setSeed(false);
        await Promise.all(printResponses);

        continue;
      }
    }
  };

  useEffect(() => {
    EventRegister.addEventListener("print-kot", (eventData) => {
      console.log(typeof eventData, eventData?.length, "EVENT DATA");
      if (eventData?.length > 0) {
        setData([...eventData]);
        setSeed(true);
      } else {
        setData([]);
        setSeed(false);
      }
    });
    return () => {
      EventRegister.removeEventListener("print-kot");
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
    console.log(seed, "SEEEDING NOW");
    const serialPrint = async () => {
      if (!seed) {
        return;
      }

      try {
        console.log("HERE PRINTING NOW");
        await printKOTReceipt();

        setData(null);
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
