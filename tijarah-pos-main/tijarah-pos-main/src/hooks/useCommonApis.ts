import { useContext, useMemo, useState } from "react";
import DeviceContext from "../context/device-context";
import { repo } from "../utils/createDatabaseConnection";

export default function useCommonApis() {
  const deviceContext = useContext(DeviceContext) as any;
  const [billingSettings, setBillingSettings] = useState() as any;
  const [businessData, setBusinessData] = useState() as any;
  const [printTemplateData, setPrintTemplateData] = useState() as any;

  useMemo(() => {
    repo.business
      .findOne({
        where: { _id: deviceContext?.user?.locationRef },
      })
      .then((result) => setBusinessData(result));

    repo.billingSettings
      .findOne({
        where: { _id: deviceContext?.user?.locationRef },
      })
      .then((result) => setBillingSettings(result));

    repo.printTemplate
      .findOne({ where: { locationRef: deviceContext?.user?.locationRef } })
      .then((result) => setPrintTemplateData(result));
  }, [deviceContext]);

  return {
    billingSettings,
    businessData,
    printTemplateData,
  };
}
