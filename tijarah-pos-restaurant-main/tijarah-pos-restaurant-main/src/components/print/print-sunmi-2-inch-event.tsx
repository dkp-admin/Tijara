import React, { useEffect, useRef, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
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
    await printSunmi2Inch({ ...data, ...ref.current });
  };

  useEffect(() => {
    EventRegister.addEventListener("print-sunmi-2-inch-order", (eventData) => {
      setData({ ...eventData });
    });
    return () => {
      EventRegister.removeEventListener("print-sunmi-2-inch-order");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("print-error", () => {
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
