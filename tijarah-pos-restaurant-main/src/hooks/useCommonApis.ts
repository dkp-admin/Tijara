import { useContext, useEffect, useState } from "react";
import DeviceContext from "../context/device-context";
import repository from "../db/repository";

export default function useCommonApis() {
  const deviceContext = useContext(DeviceContext) as any;
  const [billingSettings, setBillingSettings] = useState() as any;
  const [businessData, setBusinessData] = useState() as any;
  const [printTemplateData, setPrintTemplateData] = useState() as any;

  useEffect(() => {
    repository.business
      .findByLocationId(deviceContext?.user?.locationRef)
      .then((result) => setBusinessData(result));

    repository.billing
      .findById(deviceContext?.user?.locationRef)
      .then((result) => setBillingSettings(result));

    repository.printTemplateRepository
      .findByLocation(deviceContext?.user?.locationRef)
      .then((result) => setPrintTemplateData(result));
  }, [deviceContext]);

  return {
    billingSettings,
    businessData,
    printTemplateData,
  };
}
