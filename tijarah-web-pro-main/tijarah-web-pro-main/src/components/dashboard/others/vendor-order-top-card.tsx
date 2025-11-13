import { alpha, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import RefundIcon from "../../../icons/refund";
import SaleIcon from "../../../icons/sale";
import { StyledCurrencyFormatter } from "../../styled-currency-formatter";

export const VendorOrdersTopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { stats, companyRef } = props;

  return (
    <Grid container spacing={3}>
      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
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
              {t("Payments Done")}
            </Typography>
          }
          icon={<SaleIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={StyledCurrencyFormatter(stats?.revenueToday)}
          description={`${stats?.orderToday} ${t("Orders")}`}
        />
      </Grid>

      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
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
              {t("Payments pending")}
            </Typography>
          }
          icon={<RefundIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha("#272727", 0.1),
            color: "#272727",
            mr: 1,
          }}
          heading={StyledCurrencyFormatter(stats?.refundAmountToday)}
          description={`${stats?.refundedItemsToday} ${t("Orders")}`}
        />
      </Grid>
    </Grid>
  );
};
