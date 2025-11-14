import { useCallback } from "react";
import { PROVIDER_NAME } from "../utils/constants";

export default function useCartCalculation() {
  const getCardAndCashPayment = useCallback((localOrder: any) => {
    const payments = localOrder?.payment?.breakup || [];

    const paymentMethodsSet = new Set();

    for (const breakup of payments) {
      if (
        breakup.providerName === PROVIDER_NAME.CARD ||
        breakup.providerName === PROVIDER_NAME.CASH
      ) {
        paymentMethodsSet.add(breakup.providerName);
      }
    }

    const paymentMethods = Array.from(paymentMethodsSet);

    return {
      paymentMethods,
    };
  }, []);

  return {
    getCardAndCashPayment,
  };
}
