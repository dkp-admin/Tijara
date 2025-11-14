import { Card, CardHeader } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyListItem } from "src/components/property-list-item";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { useCurrency } from "src/utils/useCurrency";

interface TransactionCardProps {
  data: any;
  loading?: boolean;
}

export const TransactionCard = (props: TransactionCardProps) => {
  const { data, loading } = props;
  const { t } = useTranslation();
  const currency = useCurrency();

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toFixed(2);
  };

  return (
    <>
      {data?.txnStats?.length === 0 ? (
        <Card sx={{ height: 320 }}>
          <CardHeader title="Transaction Details" />
          {data?.txnStats?.length === 0 && (
            <PropertyListItem label="No transactions yet"></PropertyListItem>
          )}
        </Card>
      ) : (
        <Card sx={{ minHeight: 320 }}>
          <CardHeader title="Transaction Details" />
          {data?.txnStats?.map((item: any, index: any) => (
            <PropertyListItem
              key={index}
              from="salesSummary"
              loading={loading}
              align="horizontal"
              divider={index !== data.length - 1}
              label={t(
                `${capitalizeFirstLetter(item.paymentName)} Transactions`
              )}
              value={`${currency} ${formatCurrency(item.balanceAmount)}, ${t(
                "Count"
              )}: ${item.noOfPayments}`}
            />
          ))}
        </Card>
      )}
    </>
  );
};
