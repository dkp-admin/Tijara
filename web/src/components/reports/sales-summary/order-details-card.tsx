import { Card, CardHeader } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface OrderDetailsCardProps {
  data: any;
  loading: boolean;
}

export const getCashierName = (cashiers: any) => {
  if (cashiers?.length <= 3) {
    return cashiers?.join(", ");
  } else {
    const firstTwoNames = cashiers?.slice(0, 3);
    const remainingNamesCount = cashiers?.length - 3;
    return `${firstTwoNames?.join(", ")} + ${remainingNamesCount}`;
  }
};

export const OrderDetailsCard = (props: OrderDetailsCardProps) => {
  const { t } = useTranslation();
  const { data, loading } = props;

  const currency = useCurrency();

  return (
    <Card>
      <CardHeader title="Order Details" />
      <PropertyList>
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("Total Sales")}
          value={`${currency} ${toFixedNumber(
            data?.netSales +
              data?.totalVat +
              data?.chargesWithoutVat -
              data?.refundedCharges || 0.0
          )}`}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("Net Sales")}
          value={`${currency} ${toFixedNumber(
            data?.netSales +
              data?.chargesWithoutVat -
              data?.refundedCharges +
              data?.refundedVatOnCharge || 0.0
          )}`}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("Total VAT")}
          value={`${currency} ${toFixedNumber(
            data?.totalVat - data?.refundedVatOnCharge
          )} `}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("Orders")}
          value={`${data?.totalOrder || 0}`}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("Discount")}
          value={`${currency} ${toFixedNumber(data?.discount)}`}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          label={t("Cashiers")}
          value={getCashierName(data?.cashiers || []) || "-"}
        />
      </PropertyList>
    </Card>
  );
};
