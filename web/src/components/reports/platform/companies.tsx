import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@untitled-ui/icons-react/build/esm/Repeat01";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import Building04Icon from "src/icons/untitled-ui/duocolor/building-04";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { useCurrency } from "src/utils/useCurrency";

interface CompanyTopCardProps {
  companyStats: any;
  loading: any;
}

export const CompaniesReportTopCard: FC<CompanyTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { companyStats, loading } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3}>
      <Grid item lg={2.4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Companies")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <Building04Icon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={companyStats?.totalCompanies || 0}
          description={`${t("Total Locations")}: `}
          descriptionValue={companyStats?.totalLocations || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={2.4} md={6} sm={12} sx={{ width: "100%" }}>
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
          heading={companyStats?.totalOrdersToday || 0}
          description={`${t("Total Orders Count")}: `}
          descriptionValue={companyStats?.totalOrders || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={2.4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Today's Revenue")}
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
          heading={`${currency} ${
            currencyValue(companyStats?.totalRevenueToday) || 0
          }`}
          description={`${t("Total Vat")}: `}
          descriptionValue={`${currency} ${currencyValue(
            companyStats?.totalVat
          )}`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={2.4} md={6} sm={12} sx={{ width: "100%" }}>
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
          heading={companyStats?.totalRefundedItemsToday || 0}
          description={`${t("Total Refunded Items")}: `}
          descriptionValue={companyStats?.totalRefundedItems || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={2.4} md={6} sm={12} sx={{ width: "100%" }}>
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
          heading={`${currency} ${
            currencyValue(companyStats?.totalRefundToday) || 0
          }`}
          description={`${t("Total Refunds")}: `}
          descriptionValue={`${currency} ${
            currencyValue(companyStats?.totalRefund) || 0.0
          }`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
