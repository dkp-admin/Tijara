import { add, differenceInDays, startOfDay } from "date-fns";
import { useCallback, useContext, useMemo, useState } from "react";
import i18n from "../../i18n";
import DeviceContext from "../context/device-context";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import { repo } from "../utils/createDatabaseConnection";
import { debugLog } from "../utils/log-patch";

export const getSubscriptionDetails = (subscriptionEndDate: string | Date) => {
  const endDate = startOfDay(new Date(subscriptionEndDate));
  const currentDate = startOfDay(new Date());

  const renewDays = subscriptionEndDate
    ? differenceInDays(endDate, currentDate)
    : 1;

  let expiringText = "";

  if (subscriptionEndDate && renewDays <= 10) {
    if (renewDays < 0) {
      expiringText = i18n.t("Subscription is expired");
    } else if (renewDays === 0) {
      expiringText = i18n.t("Subscription is expiring today");
    } else if (renewDays === 1) {
      expiringText = i18n.t("Subscription is expiring tomorrow");
    } else {
      expiringText = `${i18n.t(
        "Subscription is expiring in"
      )} ${renewDays} ${i18n.t("days")}`;
    }
  }

  return {
    renewIn: renewDays,
    text: expiringText,
  };
};

export const useBusinessDetails = () => {
  const deviceContext = useContext(DeviceContext) as any;

  const [negativeBilling, setNegativeBilling] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    renewIn: 1,
    text: "",
  });

  const fetchBusinessDetails = useCallback(async () => {
    try {
      const business = await repo.business.findOne({
        where: { _id: deviceContext?.user?.locationRef },
      });

      const details = getSubscriptionDetails(
        business?.company.subscriptionEndDate || add(new Date(), { days: 7 })
      );

      setBusinessDetails(business);
      setSubscriptionDetails(details);
      setNegativeBilling(business?.location?.negativeBilling || false);
    } catch (error) {
      debugLog(
        "Business details fetch failed",
        error,
        "business-details-hook",
        "fetchBusinessDetailsFunction"
      );
    }
  }, [deviceContext]);

  useMemo(() => {
    fetchBusinessDetails();
  }, [deviceContext]);

  return {
    businessDetails,
    subscriptionDetails,
    negativeBilling,
  };
};
