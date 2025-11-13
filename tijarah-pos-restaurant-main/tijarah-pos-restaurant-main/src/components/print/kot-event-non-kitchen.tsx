import { format } from "date-fns";
import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { ChannelsName } from "../../utils/constants";

import repository from "../../db/repository";
import MMKVDB from "../../utils/DB-MMKV";

export default function KOTEventListenerNonKitchen() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;

  const totalQTY = useMemo(
    () => data?.items?.reduce((pv: any, cv: any) => pv + cv.qty, 0),
    [data]
  );

  const printKOTReceipt = async () => {
    const allprinters = await repository.printerRepository.findByType("usb");
    const allBtPrinters = await repository.printerRepository.findByType(
      "bluetooth"
    );
    const printers = [...allprinters, ...allBtPrinters].filter(
      (p) => p.enableKOT
    );

    if (printers.length === 0) {
      throw new Error("No printed selected");
    }

    const printResponses: any[] = [];

    // +`[C]------------------------------------------------\n` +
    //   `[L]KOT[R]${data?.kotNumber}${data?.items?.[0]?.kotId}\n` +
    //   `[L]<img>${imageToHex(
    //     "تذكرة طلب المطبخ",
    //     "left",
    //     "20"
    //   )}</img>\n`;

    for (const printer of printers) {
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

          const is2Inch = printer?.printerSize === "2-inch";
          const printerWidth = is2Inch ? "58" : printer.printerWidthMM;
          const charsPerLine = is2Inch ? "32" : printer.charsPerLine;

          const tData =
            data?.orderType === "Dine-in"
              ? {
                  label: data?.dineInData?.table,
                }
              : MMKVDB.get("activeTableDineIn") || "";

          let kotContent =
            `[C]<b>${data?.location?.en}</b>\n` +
            `[C]<img>${imageToHex(
              `${data?.location?.ar}${" ".repeat(is2Inch ? 20 : 40)}`,
              "center",
              is2Inch ? "16" : "20"
            )}</img>\n` +
            (data?.orderType === "Dine-in" && tData?.label
              ? `[L]Table[R]${tData?.label || ""}\n` +
                `[L]<img>${imageToHex(
                  "جدول",
                  "left",
                  is2Inch ? "16" : "20"
                )}</img>\n`
              : "") +
            (data?.orderNum
              ? `[L]Invoice[R]#${data?.orderNum}\n` +
                `[L]<img>${imageToHex(
                  "رقم الفاتورة",
                  "left",
                  is2Inch ? "16" : "20"
                )}</img>\n`
              : "") +
            `${
              is2Inch
                ? `[L]Date[R]${format(
                    new Date(data?.createdAt),
                    "yyyy-MM-dd"
                  )}\n[L]Time[R]${format(
                    new Date(data?.createdAt),
                    "hh:mm:ssa"
                  )}\n`
                : `[L]Date & time[R]${format(
                    new Date(data?.createdAt),
                    "yyyy-MM-dd, hh:mm:ssa"
                  )}\n`
            }` +
            `[L]<img>${imageToHex(
              "التاريخ والوقت",
              "left",
              is2Inch ? "16" : "20"
            )}</img>\n`;

          if (data?.showToken || data?.showOrderType) {
            kotContent += `[C]${"-".repeat(is2Inch ? 32 : 48)}\n`;

            if (data?.showToken) {
              kotContent += `[C]<font size='big'>${data?.tokenNum}</font>\n`;
            }

            if (data?.showOrderType) {
              kotContent += `[C]${
                ChannelsName[data?.orderType] || data?.orderType
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

          data?.items?.map((item: any) => {
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

          if (data?.specialInstructions?.length > 0) {
            kotContent +=
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[C]<b>Special Instructions</b>\n` +
              `[C]<img>${imageToHex(
                `تعليمات خاصة${" ".repeat(is2Inch ? 15 : 30)}`,
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]${data?.specialInstructions}\n`;
          }

          kotContent += `${is2Inch ? "" : "[L]\n" + "[L]\n" + "[L]\n"}`;

          const response =
            printer.printerType === "usb"
              ? await ExpoPrintHelp.printRaw(
                  kotContent,
                  printerWidth,
                  is2Inch ? "160" : "199",
                  charsPerLine
                )
              : await ExpoPrintHelp.printRawBt(
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
      } catch (error: any) {}
      // }
    }

    setSeed(false);

    const responses = await Promise.all(printResponses);

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-kot-non-kitchen", (eventData) => {
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-kot-non-kitchen");
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

  useEffect(() => {
    const serialPrint = async () => {
      if (!seed) {
        return;
      }

      try {
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
