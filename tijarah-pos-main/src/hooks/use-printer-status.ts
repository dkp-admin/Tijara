import { useMemo, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import { PrinterRepository } from "../database/printer/printer-repo";
import { db } from "../utils/createDatabaseConnection";
import { debugLog } from "../utils/log-patch";

export default function usePrinterStatus() {
  const [isConnected, setIsConnected] = useState();
  const [isKOTConnected, setIsKOTConnected] = useState();
  const [trigger, setTrigger] = useState(false);
  const [kotTrigger, setKotTrigger] = useState(false);
  const printerRepository = new PrinterRepository(db);

  useMemo(() => {
    EventRegister.addEventListener("print-changed", (eventData) => {
      debugLog(
        "Printer changed",
        {},
        "setting-printer-screen",
        "handlePrintChangedEvent"
      );
      setTrigger(eventData.enableReceipts);
      setKotTrigger(eventData.enableKOT);
    });
    return () => {
      EventRegister.removeEventListener("print-changed");
    };
  }, []);

  useMemo(() => {
    printerRepository
      .isConnected()
      .then((res) => {
        setIsConnected(res);
      })
      .catch(() => {
        console.log("ERROR_PRINTER_STATUS");
      });

    printerRepository
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
