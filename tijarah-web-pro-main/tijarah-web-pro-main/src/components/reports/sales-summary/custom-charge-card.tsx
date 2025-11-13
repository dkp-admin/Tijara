import type { Theme } from "@mui/material";
import { Card, CardHeader, Divider, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface RefundCardProps {
  data: any;
  loading?: boolean;
}

export const CustomChargeCard = (props: RefundCardProps) => {
  const { t } = useTranslation();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const { data, loading } = props;
  const currency = useCurrency();

  // const align = mdUp ? "horizontal" : "vertical";

  return (
    <Card>
      <CardHeader title="Custom Charges" />
      <PropertyList>
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("Charges")}
          value={`${currency} ${toFixedNumber(data?.chargesWithoutVat || 0.0)}`}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          divider
          label={t("VAT ")}
          value={`${currency} ${toFixedNumber(data?.totalVatOnCharge || 0.0)}`}
        />
        <PropertyListItem
          from={"salesSummary"}
          loading={loading}
          align={"horizontal"}
          label={t("Total ")}
          value={`${currency} ${toFixedNumber(data?.charges)}`}
        />
      </PropertyList>
    </Card>
  );
};
