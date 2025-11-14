import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@untitled-ui/icons-react/build/esm/Repeat01";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface SalesTopCardProps {
  orderStats: any;
  drawerOpen?: boolean;
  loading?: any;
}

export const SalesReportTopCard: FC<SalesTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { orderStats, drawerOpen, loading } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3}>
      <Grid item lg={drawerOpen ? 6 : 3} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          showLabel={true}
          labelText={
            <Typography
              variant="subtitle2"
              sx={{
                mt: 0.5,
                fontSize: "12px",
                color: "neutral.500",
                textTransform: "uppercase",
              }}
            >
              {t("Today's Order Count")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CheckCircleIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={orderStats?.totalOrderToday || 0}
          description={`${t("Total Orders Count")}: `}
          descriptionValue={orderStats?.totalOrder || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={drawerOpen ? 6 : 3} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          showLabel={true}
          labelText={
            <Typography
              variant="subtitle2"
              sx={{
                mt: 0.5,
                fontSize: "12px",
                color: "neutral.500",
                textTransform: "uppercase",
              }}
            >
              {t("Today's Sales")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <AccountBalanceWalletTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={StyledCurrencyFormatter(
            (orderStats?.todaysRevenue || 0) + (orderStats?.totalVat || 0)
          )}
          description={`${t("Total Sales")}: `}
          descriptionValue={`${currency} ${currencyValue(
            (orderStats?.totalRevenue || 0) + (orderStats?.totalRevenueVat || 0)
          )}`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={drawerOpen ? 6 : 3} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          showLabel={true}
          labelText={
            <Typography
              variant="subtitle2"
              sx={{
                mt: 0.5,
                fontSize: "12px",
                color: "neutral.500",
                textTransform: "uppercase",
              }}
            >
              {t("Items Refunded Today")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ReportGmailerrorredTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={toFixedNumber(orderStats?.totalRefundedItemsToday || 0)}
          description={`${t("Total Refunded Items")}: `}
          descriptionValue={toFixedNumber(orderStats?.totalRefundedItems) || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={drawerOpen ? 6 : 3} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          showLabel={true}
          labelText={
            <Typography
              variant="subtitle2"
              sx={{
                mt: 0.5,
                fontSize: "12px",
                color: "neutral.500",
                textTransform: "uppercase",
              }}
            >
              {t("Today's Refunds")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CurrencyExchangeIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={StyledCurrencyFormatter(
            toFixedNumber(
              orderStats?.totalRefundToday + orderStats?.todayRefundedCharge
            ) || 0
          )}
          description={`${t("Total Refunds")}: `}
          descriptionValue={`${currency} ${currencyValue(
            orderStats?.totalRefund + orderStats?.totalRefundedCharge || 0.0
          )}`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
