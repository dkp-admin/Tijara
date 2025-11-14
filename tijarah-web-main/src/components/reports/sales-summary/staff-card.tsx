import { Card, CardHeader } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface StaffCardProps {
  data: any;
  loading?: boolean;
}

export const StaffCard = ({ data, loading }: StaffCardProps) => {
  const { t } = useTranslation();
  const currency = useCurrency();

  if (!data?.netSalesByStaff || data.netSalesByStaff.length === 0) {
    return (
      <Card sx={{ height: 320 }}>
        <CardHeader title={t("Staff Performance")} />
        <PropertyListItem label={t("No staff data available")} />
      </Card>
    );
  }

  return (
    <Card sx={{ minHeight: 320 }}>
      <CardHeader title={t("Staff Performance")} />
      <PropertyList>
        {data.netSalesByStaff.map((staff: any, index: number) => (
          <PropertyListItem
            key={staff.staffRef || index}
            from="salesSummary"
            loading={loading}
            align="horizontal"
            divider={index !== data.netSalesByStaff.length - 1}
            label={staff.staffName || t("N/A")}
            value={`${currency} ${toFixedNumber(staff.paymentTotal || 0)}, ${t(
              "Orders"
            )}: ${staff.totalOrderToday || 0}`}
          />
        ))}
      </PropertyList>
    </Card>
  );
};
