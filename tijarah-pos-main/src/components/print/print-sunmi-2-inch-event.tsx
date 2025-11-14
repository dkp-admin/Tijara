import React, { useEffect, useRef, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { debugLog } from "../../utils/log-patch";
import { printSunmi2Inch } from "../../utils/printSunmi-2inch-str";
import PrintSunmi2InchCanvas from "../print-sunmi-2-inch-canvas/print-sunmi-2-inch-canvas";

function checkAllValuesExist(ref: any) {
  let refVar = ref.current;
  ref.current = refVar;

  const values = Object.values(ref.current);

  return values.every((value) => value !== "");
}

export default function PrintSunmi2InchEventListener() {
  const [seed, setSeed] = useState(false);
  const [data, setData] = useState<any>(null);

  const ref = useRef({ base64qr: "" });

  const printOrderReceipt = async () => {
    debugLog(
      "Inbuilt Sunmi 2 inch order print started",
      data,
      "print-sunmi-2-inch-event",
      "handlePrintSunmi2InchFailedEvent"
    );

    await printSunmi2Inch({ ...data, ...ref.current });

    debugLog(
      "Inbuilt Sunmi 2 inch order print completed",
      {},
      "print-sunmi-2-inch-event",
      "handlePrintSunmi2InchFailedEvent"
    );
  };

  useEffect(() => {
    EventRegister.addEventListener("print-sunmi-2-inch-order", (eventData) => {
      debugLog(
        "Inbuilt Sunmi 2 inch print event triggered",
        eventData,
        "orders-screen",
        "handlePrintReceiptFunction"
      );

      setData({ ...eventData });
    });
    return () => {
      EventRegister.removeEventListener("print-sunmi-2-inch-order");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
      debugLog(
        "Print sunmi 2 inch order failed",
        {},
        "print-sunmi-2-inch-event",
        "handlePrintSunmi2InchFailedEvent"
      );
      setData(null);
    });
    return () => {
      EventRegister.removeEventListener("print-error");
    };
  }, []);

  useEffect(() => {
    const serialPrint = async () => {
      if (checkAllValuesExist(ref)) {
        try {
          await printOrderReceipt(); // Assuming printOrderReceipt returns a Promise

          if (data?.noOfPrints?.length > 1) {
            await printOrderReceipt();
          }

          // Reset ref and data after successful print
          ref.current = { base64qr: "" };

          EventRegister.emit("print-sunmi-2-inch-order", {
            ...data,
          });

          setData(null);
        } catch (err) {
          console.log(err);
        }
      }
    };

    serialPrint();
  }, [seed]);

  return (
    data && (
      <PrintSunmi2InchCanvas
        valueRef={ref}
        order={data}
        trigger={() => setSeed(!seed)}
      />
    )
  );
}
