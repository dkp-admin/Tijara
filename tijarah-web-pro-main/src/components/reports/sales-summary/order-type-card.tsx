import { Business } from "@mui/icons-material";
import type { Theme } from "@mui/material";
import { Card, CardHeader, Divider, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { useAuth } from "src/hooks/use-auth";
import { USER_TYPES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface OrderTypeCardProps {
  data: any;
  industry: string;
  loading?: boolean;
}

export const OrderTypeCard = (props: OrderTypeCardProps) => {
  const { t } = useTranslation();
  const { data, industry, loading } = props;
  const { user } = useAuth();
  const currency = useCurrency();

  const getDisplayName = (orderType: any) => {
    const name = orderType.name || orderType.key;
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
  };

  const shouldShowOrderType = (orderType: any) => {
    const key = orderType.key.toLowerCase();

    if (user?.userType === USER_TYPES.SUPERADMIN) {
      return true;
    }

    if (industry === "restaurant") {
      return key !== "walk-in" && key !== "walkin";
    } else {
      return key !== "takeaway" && key !== "dine-in";
    }
  };

  return (
    <Card>
      <CardHeader title="Order Type" />
      <PropertyList>
        {data?.orderTypes
          ?.filter(shouldShowOrderType)
          .map((orderType: any, index: number) => (
            <PropertyListItem
              key={orderType.key || index}
              from={"salesSummary"}
              loading={loading}
              align={"horizontal"}
              divider
              label={t(getDisplayName(orderType))}
              value={`${currency} ${toFixedNumber(
                orderType.amount || 0.0
              )}, ${t("Count")}: ${orderType.count || 0}`}
            />
          ))}
      </PropertyList>
    </Card>
  );
};
