import { useMemo } from "react";
import { t } from "../../i18n";
import CurrencyView from "../components/modal/currency-view-modal";
import { currencyValue } from "./get-value-currency";
import ICONS from "./icons";
import useCommonApis from "../hooks/useCommonApis";
import { BusinessDetails } from "../db/schema/business-details";

const safeNumber = (value: any, defaultValue = 0) =>
  Number(value || defaultValue);

const getCashierName = (cashiers: any) => {
  if (!cashiers || cashiers?.length <= 0) {
    return "N/A";
  }
  if (cashiers?.length <= 3) {
    return cashiers?.join(", ");
  } else {
    const firstTwoNames = cashiers?.slice(0, 3);
    const remainingNamesCount = cashiers?.length - 3;
    return `${firstTwoNames?.join(", ")} + ${remainingNamesCount}`;
  }
};

const createDataTransform = (data: any, businessData: BusinessDetails) => ({
  topCardData: [
    {
      title: t("TOTAL SALES"),
      bottomCount: data?.totalOrder || 0,
      bottomText: `${t("No of Orders")}:`,
      topAmount: safeNumber(data?.netSales) + safeNumber(data?.totalVat),
      isString: true,
      icon: <ICONS.DashSaleIcon />,
    },
    {
      title: t("NET SALES"),
      bottomCount: <CurrencyView amount={currencyValue(data?.totalVat)} />,
      bottomText: t("VAT Amount"),
      topAmount: safeNumber(data?.netSales),
      isString: false,
      icon: <ICONS.DashSaleIcon />,
    },
    {
      title: t("Refund"),
      bottomCount: data?.noOfRefund || 0,
      bottomText: `${t("No of Refunds")}:`,
      topAmount: safeNumber(data?.totalRefund),
      isString: true,
      icon: <ICONS.RefundOrderIcon />,
    },
    {
      title: t("Discount"),
      bottomCount: data?.noOfDiscount || 0,
      bottomText: `${t("No of Discounts")}:`,
      topAmount: safeNumber(data?.discount),
      isString: true,
      icon: <ICONS.DiscountIcon />,
    },
  ],

  // Order Details Transformation
  orderDetailItems: [
    {
      label: t("Total sales"),
      value: (
        <CurrencyView
          amount={currencyValue(
            safeNumber(data?.totalRevenue) + safeNumber(data?.totalVat)
          )}
        />
      ),
    },
    {
      label: t("Net sales"),
      value: <CurrencyView amount={currencyValue(data?.netSales)} />,
    },
    {
      label: t("Total VAT"),
      value: <CurrencyView amount={currencyValue(data?.totalVat)} />,
    },
    {
      label: t("Orders"),
      value: data?.totalOrder || 0,
    },
    {
      label: t("Discount"),
      value: <CurrencyView amount={currencyValue(data?.discount)} />,
    },
    {
      label: t("Cashiers"),
      value: getCashierName(data?.cashiers) || "N/A",
    },
  ],

  // Order Types Transformation
  orderTypesData: [
    {
      label: t("Pickup"),
      value: <CurrencyView amount={currencyValue(data?.pickup?.amount)} />,
      count: data?.pickup?.count || "0",
    },
    {
      label: t("Delivery"),
      value: <CurrencyView amount={currencyValue(data?.delivery?.amount)} />,
      count: data?.delivery?.count || "0",
    },

    ...(businessData?.company?.industry === "restaurant"
      ? [
          {
            label: t("Takeaway"),
            value: (
              <CurrencyView
                amount={currencyValue(data?.["takeaway"]?.amount)}
              />
            ),
            count: data?.["takeaway"]?.count || "0",
          },
          {
            label: t("Dine-in"),
            value: (
              <CurrencyView amount={currencyValue(data?.["dine-in"]?.amount)} />
            ),
            count: data?.["dine-in"]?.count || "0",
          },
        ]
      : []),
    ...(businessData?.company?.industry === "retail"
      ? [
          {
            label: t("Walk-in"),
            value: (
              <CurrencyView amount={currencyValue(data?.["walkin"]?.amount)} />
            ),
            count: data?.["walkin"]?.count || "0",
          },
        ]
      : []),
  ],

  // Charges Transformation
  chargesData: [
    {
      label: t("Charges"),
      value: (
        <CurrencyView amount={currencyValue(data?.chargesWithoutVat || 0)} />
      ),
    },
    {
      label: t("VAT"),
      value: (
        <CurrencyView amount={currencyValue(data?.totalVatOnCharge || 0)} />
      ),
    },
    {
      label: t("Total"),
      value: <CurrencyView amount={currencyValue(data?.charges || 0)} />,
    },
  ],
});

export const useDashboardData = (data: any) => {
  const { businessData } = useCommonApis();

  return useMemo(
    () => createDataTransform(data, businessData),
    [data, businessData]
  );
};
