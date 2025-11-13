import { Card, CardHeader } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface RefundCardProps {
  data: any;
  loading?: boolean;
}

export const RefundCard = (props: RefundCardProps) => {
  const { t } = useTranslation();
  const { data, loading } = props;
  const currency = useCurrency();

  return (
    <>
      {data?.refundData?.length === 0 ? (
        <Card sx={{ height: 280 }}>
          <CardHeader title="Refund Details" />
          {data?.refundData?.length === 0 && (
            <PropertyListItem label="No refunds yet"></PropertyListItem>
          )}
        </Card>
      ) : (
        <Card sx={{ minHeight: 280 }}>
          <CardHeader title="Refund Details" />
          <PropertyList>
            {data?.refundData?.map((refund: any, index: number) => (
              <PropertyListItem
                key={index}
                from={"salesSummary"}
                loading={loading}
                align={"horizontal"}
                divider={index !== data?.refundData.length - 1}
                label={t(`${capitalizeFirstLetter(refund.refundType)} Refund`)}
                value={`${currency} ${toFixedNumber(refund.totalRefund)}, ${t(
                  "Count"
                )}: ${refund.refundCount}`}
              />
            ))}
          </PropertyList>
        </Card>
      )}
    </>
  );
};
