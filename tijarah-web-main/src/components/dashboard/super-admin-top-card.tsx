import {
  ErrorOutline,
  InfoOutlined,
  InfoRounded,
  MonetizationOn,
} from "@mui/icons-material";
import { Grid, Typography, alpha, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { currencyValue } from "src/utils/currency-value-changer";
import { CardWithIconDescription } from "../card-with-icon-description";
import { useCurrency } from "src/utils/useCurrency";

export const SuperAdminTopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { stats, loading } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3} sx={{ mt: 0 }}>
      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
          icon={<InfoOutlined fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.info.main, 0.1),
            color: "info.main",
            mr: 1,
          }}
          heading={stats?.totalCompanies || 0}
          description={`${t("Total Locations")}: ${
            stats?.totalLocations || "0"
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
          icon={<InfoRounded fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.warning.main, 0.1),
            color: "warning.main",
            mr: 1,
          }}
          heading={`${currency} ${currencyValue(stats?.todaysRevenue || 0.0)}`}
          description={`${t("Total Revenue")}: ${currencyValue(
            stats?.totalRevenue || 0.0
          )}`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Top Performing Company")}
            </Typography>
          }
          icon={<MonetizationOn fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={stats?.topPerformingCompany?.name?.en || ""}
          description={`${t("Total Revenue")}: ${currency} ${currencyValue(
            stats?.topPerformingCompany?.revenue || 0.0
          )}`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Subscriptions Expired")}
            </Typography>
          }
          icon={<ErrorOutline fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.error.main, 0.1),
            color: "error.main",
            mr: 1,
          }}
          heading={stats?.expired || 0}
          description={
            stats?.expiringSoon
              ? `Subscriptions Expiring Soon: ${stats?.expiringSoon}`
              : "0"
          }
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
