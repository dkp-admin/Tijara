import type { Theme } from "@mui/material";
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  useMediaQuery,
} from "@mui/material";
import loadConfig from "next/dist/server/config";
import { useTranslation } from "react-i18next";
import { PropertyList } from "src/components/property-list";
import { PropertyListItem } from "src/components/property-list-item";
import { useAuth } from "src/hooks/use-auth";
import { USER_TYPES } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import LoaderAnimation from "../widgets/animations/loader";
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
        <>
          <PropertyList>
            <PropertyListItem
              align={align}
              divider
              label={t("Walk-In")}
              value={`${currency} ${
                user.userType == USER_TYPES.SUPERADMIN
                  ? toFixedNumber(data?.walkin?.amount || 0.0)
                  : toFixedNumber(data?.walkin?.amount)
              }, ${t("Count")}: ${
                user.userType == USER_TYPES.SUPERADMIN
                  ? data?.walkin?.count
                  : data?.walkin?.count
              }`}
            />

            <PropertyListItem
              align={align}
              divider
              label={t("Delivery")}
              value={`${currency} ${
                user.userType == USER_TYPES.SUPERADMIN
                  ? toFixedNumber(data?.delivery?.amount || 0.0)
                  : toFixedNumber(data?.delivery?.amount)
              }, ${t("Count")}: ${
                user.userType == USER_TYPES.SUPERADMIN
                  ? data?.delivery?.count
                  : data?.delivery?.count
              }`}
            />

            {user.userType == USER_TYPES.SUPERADMIN ? (
              <PropertyListItem
                align={align}
                divider
                label={t("Takeaway")}
                value={`${currency} ${toFixedNumber(
                  data?.takeaway?.amount || 0.0
                )}, ${t("Count")}: ${data?.takeaway?.count || 0}`}
              />
            ) : (
              industry == "restaurant" && (
                <PropertyListItem
                  align={align}
                  divider
                  label={t("Takeaway")}
                  value={`${currency} ${toFixedNumber(
                    data?.takeaway?.amount || 0.0
                  )}, ${t("Count")}: ${data?.takeaway?.count || 0}`}
                />
              )
            )}

            {user.userType == USER_TYPES.SUPERADMIN ? (
              <PropertyListItem
                align={align}
                divider
                label={t("Dine-In")}
                value={`${currency} ${toFixedNumber(
                  data?.["dine-in"]?.amount
                )}, ${t("Count")}: ${data?.["dine-in"]?.count || 0} `}
              />
            ) : (
              industry == "restaurant" && (
                <PropertyListItem
                  align={align}
                  divider
                  label={t("Dine-In")}
                  value={`${currency} ${toFixedNumber(
                    data?.["dine-in"]?.amount
                  )}, ${t("Count")}: ${data?.["dine-in"]?.count || 0} `}
                />
              )
            )}
            {user.userType == USER_TYPES.SUPERADMIN ? (
              <PropertyListItem
                align={align}
                divider
                label={t("Pickup")}
                value={`${currency} ${
                  toFixedNumber(data?.pickup?.amount) || 0
                }, ${t("Count")}: ${data?.pickup?.count || 0}`}
              />
            ) : (
              <PropertyListItem
                align={align}
                divider
                label={t("Pickup")}
                value={`${currency} ${
                  toFixedNumber(data?.pickup?.amount) || 0
                }, ${t("Count")}: ${data?.pickup?.count || 0}`}
              />
            )}
          </PropertyList>
        </>
      )}

      <Divider />
    </Card>
  );
};
