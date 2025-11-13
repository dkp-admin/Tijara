import { useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../db/repository";

export default function usePrinterStatus() {
  const [isConnected, setIsConnected] = useState() as any;
  const [isKOTConnected, setIsKOTConnected] = useState() as any;
  const [trigger, setTrigger] = useState(false);
  const [kotTrigger, setKotTrigger] = useState(false);

  useMemo(() => {
    EventRegister.addEventListener("print-changed", (eventData) => {
      setTrigger(eventData.enableReceipts);
      setKotTrigger(eventData.enableKOT);
    });
    return () => {
      EventRegister.removeEventListener("print-changed");
    };
  }, []);

  useMemo(() => {
    repository.printerRepository
      .isConnected()
      .then((res) => {
        setIsConnected(res);
      })
      .catch(() => {
        console.log("ERROR_PRINTER_STATUS");
      });

    repository.printerRepository
      .isKOTConnected()
      .then((res) => {
        setIsKOTConnected(res);
      })
      .catch(() => {
        console.log("ERROR_PRINTER_STATUS");
      });
  }, [trigger, kotTrigger]);

  return {
    isConnected,
    isKOTConnected,
  };
}
