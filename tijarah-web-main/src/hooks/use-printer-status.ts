import { useEffect, useState } from "react";

const usePrinterStatus = () => {
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);

  useEffect(() => {
    const checkPrinterConnection = async () => {
      try {
        if (
          "mediaDevices" in navigator &&
          "getPrinters" in navigator.mediaDevices
        ) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const isPrinterAvailable = devices.some(
            (device: any) => device?.kind === "printer"
          );
          setIsPrinterConnected(isPrinterAvailable);
        } else {
          console.log("Printer detection not supported on this browser.");
        }
      } catch (error) {
        console.error("Error checking printer connection:", error);
      }
    };

    checkPrinterConnection();
  }, []);

  return isPrinterConnected;
};

export default usePrinterStatus;
