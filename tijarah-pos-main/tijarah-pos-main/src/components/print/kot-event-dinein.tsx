import { format } from "date-fns";
import * as ExpoPrintHelp from "expo-print-help";
import React, { useEffect, useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { PrinterModel } from "../../database/printer/printer";
import { ChannelsName } from "../../utils/constants";
import { db } from "../../utils/createDatabaseConnection";
import { debugLog, errorLog } from "../../utils/log-patch";
import MMKVDB from "../../utils/DB-MMKV";

export default function KOTEventListenerDinein() {
  const [data, setData] = useState(null) as any;
  const [seed, setSeed] = useState(false) as any;

  const totalQTY = useMemo(
    () => data?.items?.reduce((pv: any, cv: any) => pv + cv.qty, 0),
    [data]
  );

  const printKOTReceipt = async () => {
    const printerModel = db.getRepository(PrinterModel);

    ExpoPrintHelp.initialize();

    const printers = await printerModel.find({
      where: {
        kitchenRef: data?.kitchenRef,
      },
    });

    debugLog(
      "Printers Found",
      { printers },
      "kotprinterevent",
      "handleKOTPrintReceipt"
    );

    if (printers.length === 0) {
      debugLog(
        "No Printers Found",
        { printers: [] },
        "kotprinterevent",
        "handleKOTPrintReceipt"
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
            "kotprinterevent",
            "handleKOTPrintReceipt"
          );
          const tData = MMKVDB.get("activeTableDineIn");

          if (receiptPrinter) {
            let kotContent =
              `[C]<b>${data?.location?.en}</b>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                `${data?.location?.ar}                                     `,
                "center",
                "20"
              )}</img>\n` +
              `[C]<img>${ExpoPrintHelp.imageToHex(
                `${data?.address}                               `,
                "center",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n` +
              `[L]Kitchen[R]${data?.items?.[0]?.kitchenName}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "مطبخ",
                "left",
                "20"
              )}</img>\n` +
              `[L]KOT[R]${data?.kotNumber}${data?.items?.[0]?.kotId}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "تذكرة طلب المطبخ",
                "left",
                "20"
              )}</img>\n` +
              `[L]Table[R]${tData?.label}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "جدول",
                "left",
                "20"
              )}</img>\n` +
              `[L]Date & time[R]${format(
                new Date(data?.createdAt),
                "yyyy-MM-dd, hh:mm:ssa"
              )}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "التاريخ والوقت",
                "left",
                "20"
              )}</img>\n`;

            if (data?.showToken || data?.showOrderType) {
              kotContent += `[C]------------------------------------------------\n`;

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
              `[C]------------------------------------------------\n` +
              `[L]Description[R]Qty\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "الكمية                                                                             الوصف",
                "left",
                "20"
              )}</img>\n` +
              `[C]------------------------------------------------\n`;

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
                `[L]<img>${ExpoPrintHelp.imageToHex(
                  `${itemNameAr}`,
                  "left",
                  "20"
                )}</img>\n`;

              if (modifierName) {
                kotContent += `[L]${modifierName}\n`;
              }
              kotContent += `[L]${itemNotes}\n`;
            });

            kotContent +=
              `[C]------------------------------------------------\n` +
              `[L]Total QTY[R]${totalQTY}\n` +
              `[L]<img>${ExpoPrintHelp.imageToHex(
                "إجمالي الكمية",
                "left",
                "20"
              )}</img>\n`;

            if (data?.specialInstructions?.length > 0) {
              kotContent +=
                `[C]------------------------------------------------\n` +
                `[C]<b>Special Instructions</b>\n` +
                `[C]<img>${ExpoPrintHelp.imageToHex(
                  "تعليمات خاصة                                  ",
                  "left",
                  "20"
                )}</img>\n` +
                `[L]${data?.specialInstructions}\n`;
            }

            kotContent += `[L]\n` + `[L]\n` + `[L]\n`;

            debugLog(
              `Printer Transaction Data Found For ${printer.device_name}`,
              {},
              "kotprinterevent",
              "handleKOTPrintReceipt"
            );

            const response = await ExpoPrintHelp.printRaw(
              kotContent,
              `${printer?.printerWidthMM || "72"}`,
              "199",
              `${printer?.charsPerLine || "44"}`
            );
            await ExpoPrintHelp.cut();

            debugLog(
              `Printer Template Response Found For ${printer.device_name}`,
              {},
              "kotprinterevent",
              "handleKOTPrintReceipt"
            );

            printResponses.push(response);
          }
        } catch (error: any) {
          errorLog(
            error?.message,
            printer,
            "kotprinterevent",
            "handleKOTPrintReceipt",
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
      "kotprinterevent",
      "handleKOTPrintReceipt"
    );

    return responses;
  };

  useEffect(() => {
    EventRegister.addEventListener("print-kot-dinein", (eventData) => {
      debugLog("KOT print received", {}, "kotprinterevent", "printKOTReceipt");
      setData({ ...eventData });
      setSeed(true);
    });
    return () => {
      EventRegister.removeEventListener("print-kot-dinein");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error-dinein", () => {
      debugLog(
        "Print error received",
        {},
        "kotprinterevent",
        "printKOTReceipt"
      );
      setData(null);
      setSeed(false);
    });
    return () => {
      EventRegister.removeEventListener("print-error-dinein");
    };
  }, []);

  useEffect(() => {
    const serialPrint = async () => {
      debugLog(
        "Serial Print Called",
        {},
        "kotprinterevent",
        "handleKOTPrintReceipt"
      );

      if (!seed) {
        return;
      }

      debugLog(
        "Print data generated",
        {},
        "kotprinterevent",
        "handleKOTPrintReceipt"
      );

      try {
        await printKOTReceipt();

        debugLog(
          "KOT print completed",
          {},
          "kotprinterevent",
          "handleKOTPrintReceipt"
        );

        setData(null);

        debugLog(
          "Event data emptied",
          {},
          "kotprinterevent",
          "handleKOTPrintReceipt"
        );
      } catch (err) {
        console.log(err);
      }
    };

    serialPrint();
  }, [seed]);

  return <></>;
}
