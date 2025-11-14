import { alpha, Button, Grid, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ArrowRight as ArrowRightIcon } from "src/icons/arrow-right";
import { tijarahPaths } from "src/paths";
import { currencyValue } from "src/utils/currency-value-changer";
import RefundIcon from "../../icons/refund";
import SaleIcon from "../../icons/sale";
import { CardWithIconDescription } from "../card-with-icon-description";
import { useCurrency } from "src/utils/useCurrency";

export const TopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { stats, companyRef, loading } = props;
  const router = useRouter();
  const currency = useCurrency();

  return (
    <Grid container spacing={3} sx={{ mt: 0 }}>
      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Sale")}
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
          heading={`${currency} ${currencyValue(
            stats?.netSales +
              stats?.totalVat +
              stats?.chargesWithoutVat -
              stats?.refundedCharges || 0
          )}`}
          description={
            stats?.totalOrder ? `${stats?.totalOrder} ${t("Orders")}` : "0"
          }
          showButton={true}
          button={
            <Button
              onClick={() => {
                router.push(tijarahPaths.reports.salesReport);
              }}
              endIcon={<ArrowRightIcon fontSize="small" />}
              sx={{ mt: 1, mb: -1 }}
            >
              {t("View Report")}
            </Button>
          }
        />
      </Grid>

      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Refund")}
            </Typography>
          }
          icon={<RefundIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha("#272727", 0.1),
            color: "#272727",
            mr: 1,
          }}
          heading={`${currency} ${currencyValue(
            stats?.refundData?.reduce(
              (acc: any, refund: { totalRefund: any }) =>
                acc + refund.totalRefund,
              0
            )
          )}`}
          description={
            stats?.refundData?.length
              ? `${stats?.refundData?.reduce(
                  (acc: any, refund: { refundCount: any }) =>
                    acc + Number(refund.refundCount),
                  0
                )} ${t("Refunded Items")}`
              : `0 ${t("Refunded Items")}`
          }
          showButton={true}
          button={
            <Button
              onClick={() => {
                router.push(tijarahPaths.reports.salesReport);
              }}
              endIcon={<ArrowRightIcon fontSize="small" />}
              sx={{ mt: 1, mb: -1 }}
            >
              {t("View Report")}
            </Button>
          }
        />
      </Grid>

      {/* <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              }}>
              {t("No. of products sold today")}
            </Typography>
          }
          icon={<ProductIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(theme.palette.mode === "dark"
                    ? "#0C9356"
                    : "#006C35", 0.1),
            color: theme.palette.mode === "dark"
                    ? "#0C9356"
                    : "#006C35",
            mr: 1,
          }}
          heading={"2400"}
          description={`400 Bills`}
          showButton={true}
          button={
            <Button
              onClick={() => {}}
              endIcon={<ArrowRightIcon fontSize="small" />}
              sx={{ mt: 1, mb: -1 }}
              disabled>
              {t("View Report")}
            </Button>
          }
        />
      </Grid> */}

      {/* <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
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
              }}>
              {t("New Customers")}
            </Typography>
          }
          icon={<SaleIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(theme.palette.mode === "dark"
                    ? "#0C9356"
                    : "#006C35", 0.1),
            color: theme.palette.mode === "dark"
                    ? "#0C9356"
                    : "#006C35",
            mr: 1,
          }}
          heading={stats?.current?.customersToday || "0"}
          description={
            stats?.current?.oldCustomers
              ? `${stats?.current?.oldCustomers} old customers`
              : "0"
          }
          showButton={true}
          button={
            <Button
              onClick={() => {
                if (user.userType === USER_TYPES.SUPERADMIN) {
                  router.push({
                    pathname: tijarahPaths.platform.companies,
                    query: {
                      id: companyRef,
                    },
                  });
                } else {
                  router.push(tijarahPaths.management.customers.index);
                }
              }}
              endIcon={<ArrowRightIcon fontSize="small" />}
              sx={{ mt: 1, mb: -1 }}>
              {t("View Details")}
            </Button>
          }
        />
      </Grid> */}
    </Grid>
  );
};
