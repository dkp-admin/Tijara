import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import { green } from "src/theme/colors";

interface InventoryByLocationTopCardProps {
  inventoryByLocationStats: any;
}

export const InventoryByLocationReportTopCard: FC<
  InventoryByLocationTopCardProps
> = (props) => {
  const { t } = useTranslation();
  const { inventoryByLocationStats } = props;

  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Value")}
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
            inventoryByLocationStats?.totalPaymentToday || 0
          )}
          // description={`Total Payments: `}
          // descriptionValue={inventoryStats?.totalPayment || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Potential Revenue")}
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
            inventoryByLocationStats?.todaysTotalAmount?.toFixed(2) || 0
          )}
          // description={`Total Amount: `}
          // descriptionValue={`SAR ${currencyValue(
          //   inventoryStats?.totalAmount?.toFixed(2) || 0.0
          // )}`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Potential Profit")}
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
            inventoryByLocationStats?.totalRefundToday || 0
          )}
          // description={`Total Refunds: `}
          // descriptionValue={inventoryStats?.totalRefund || 0}
          showButton={false}
        />
      </Grid>

      <Grid item lg={3} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Quantity in Stock")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ProductionQuantityLimitsIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={inventoryByLocationStats?.totalRefundAmountToday || 0}
          // description={`Total Refund Amount: `}
          // descriptionValue={`SAR ${currencyValue(
          //   inventoryStats?.totalRefundedAmount?.toFixed(2) || 0.0
          // )}`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
