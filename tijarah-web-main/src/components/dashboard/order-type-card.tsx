import type { Theme } from "@mui/material";
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { useAuth } from "src/hooks/use-auth";
import { USER_TYPES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface OrderTypeCardProps {
  loading?: boolean;
  industry: string;
  data: any;
}

export const OrderTypeDashboardCard = (props: OrderTypeCardProps) => {
  const { t } = useTranslation();
  const { data, industry, loading } = props;
  const currency = useCurrency();
  const { user } = useAuth();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const align = mdUp ? "horizontal" : "vertical";

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

      {loading ? (
        <Box
          sx={{
            height: "50vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <PropertyList>
          {data?.orderTypes
            ?.filter(shouldShowOrderType)
            .map((orderType: any, index: number) => (
              <PropertyListItem
                key={orderType.key || index}
                from={"dashboard"}
                loading={loading}
                align={align}
                divider
                label={t(getDisplayName(orderType))}
                value={`${currency} ${toFixedNumber(
                  orderType.amount || 0.0
                )}, ${t("Count")}: ${orderType.count || 0}`}
              />
            ))}
        </PropertyList>
      )}

      <Divider />
    </Card>
  );
};
