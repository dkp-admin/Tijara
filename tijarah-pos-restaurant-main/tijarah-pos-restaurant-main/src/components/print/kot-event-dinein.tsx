import { format } from "date-fns";
import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../db/repository";
import { ChannelsName } from "../../utils/constants";
import MMKVDB from "../../utils/DB-MMKV";

export default function KOTEventListenerDinein() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;

  const totalQTY = useMemo(
    () => data?.items?.reduce((pv: any, cv: any) => pv + cv.qty, 0),
    [data]
  );

  const printKOTReceipt = async () => {
    const printers = await repository.printerRepository.findByKitchen(
      data?.kitchenRef
    );

    if (printers.length === 0) {
      throw new Error("No printed selected");
    }

    const printResponses: any[] = [];

    for (const printer of printers) {
      if (printer?.device_name) {
        try {
          const receiptPrinter = await ExpoPrintHelp.connect(
            printer.product_id
          );

          const tData = MMKVDB.get("activeTableDineIn");

          const imageToHex =
            printer.printerType === "bluetooth"
              ? ExpoPrintHelp.imageToHexBt
              : ExpoPrintHelp.imageToHex;

          if (receiptPrinter) {
            const is2Inch = printer?.printerSize === "2-inch";
            const printerWidth = is2Inch ? "58" : printer.printerWidthMM;
            const charsPerLine = is2Inch ? "32" : printer.charsPerLine;

            let kotContent =
              `[C]<b>${data?.location?.en}</b>\n` +
              `[C]<img>${imageToHex(
                `${data?.location?.ar}${" ".repeat(is2Inch ? 20 : 40)}`,
                "center",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[C]<img>${imageToHex(
                `${data?.address}${" ".repeat(is2Inch ? 20 : 40)}`,
                "center",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[C]${"-".repeat(is2Inch ? 32 : 48)}\n` +
              `[L]Kitchen[R]${data?.items?.[0]?.kitchenName}\n` +
              `[L]<img>${imageToHex(
                "مطبخ",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]KOT[R]${data?.kotNumber}${data?.items?.[0]?.kotId}\n` +
              `[L]<img>${imageToHex(
                "تذكرة طلب المطبخ",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]Table[R]${tData?.label}\n` +
              `[L]<img>${imageToHex(
                "جدول",
                "left",
                is2Inch ? "16" : "20"
              )}</img>\n` +
              `[L]Date & time[R]${format(
                new Date(data?.createdAt),
                "yyyy-MM-dd, hh:mm:ssa"
              )}\n` +
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
                "الكمية                                                                             الوصف",
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

            for (let i = 0; i < (printer?.numberOfKots || 1); i++) {
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
          }
        } catch (error: any) {}
      }
    }

    setSeed(false);

    const responses = await Promise.all(printResponses);

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-kot-dinein", (eventData) => {
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-kot-dinein");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error-dinein", () => {
      setData(null);
      setSeed(false);
    });
    return () => {
      EventRegister.removeEventListener("print-error-dinein");
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
