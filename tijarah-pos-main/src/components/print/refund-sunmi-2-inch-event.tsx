import React, { useEffect, useRef, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { debugLog } from "../../utils/log-patch";
import { printRefundSunmi2Inch } from "../../utils/printRefundSunmi-2inch-str";
import PrintSunmi2InchCanvas from "../print-sunmi-2-inch-canvas/print-sunmi-2-inch-canvas";
import { printRefundSunmi } from "../../utils/printRefundSunmi";

function checkAllValuesExist(ref: any) {
  let refVar = ref.current;
  ref.current = refVar;

  const values = Object.values(ref.current);

  return values.every((value) => value !== "");
}

export default function RefundSunmi2InchEventListener() {
  const [seed, setSeed] = useState(false);
  const [data, setData] = useState<any>(null);

  const ref = useRef({ base64qr: "" });

  const refundOrderReceipt = async () => {
    debugLog(
      "Inbuilt Sunmi 2 inch refund print started",
      data,
      "refund-sunmi-2-inch-event",
      "handleRefundSunmi2InchFailedEvent"
    );

    // console.log("data 12345", JSON.stringify(data));

    await printRefundSunmi2Inch({ ...data, ...ref.current });

    debugLog(
      "Inbuilt Sunmi 2 inch order refund completed",
      {},
      "refund-sunmi-2-inch-event",
      "handleRefundSunmi2InchFailedEvent"
    );
  };

  useEffect(() => {
    EventRegister.addEventListener("refund-sunmi-2-inch-order", (eventData) => {
      debugLog(
        "Inbuilt Sunmi 2 inch refund event triggered",
        eventData,
        "orders-screen",
        "handleRefundReceiptFunction"
      );

      setData({ ...eventData });
    });
    return () => {
      EventRegister.removeEventListener("refund-sunmi-2-inch-order");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
      debugLog(
        "Refund sunmi 2 inch order failed",
        {},
        "refund-sunmi-2-inch-event",
        "handleRefundSunmi2InchFailedEvent"
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
          await refundOrderReceipt();

          // Reset ref and data after successful print
          ref.current = { base64qr: "" };

          EventRegister.emit("refund-sunmi-2-inch-order", {
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
