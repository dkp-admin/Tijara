import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { StyledCurrencyFormatter } from "src/components/styled-currency-formatter";
import { green } from "src/theme/colors";

interface DeadInventoryReportTopCardProps {
  deadInventoryStats: any;
}

export const DeadInventoryReportTopCard: FC<DeadInventoryReportTopCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { deadInventoryStats } = props;

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
            deadInventoryStats?.totalPaymentToday || 100
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
            deadInventoryStats?.todaysTotalAmount?.toFixed(2) || 1200.0
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
              {t("Products")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ShoppingBag03Icon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={deadInventoryStats?.totalRefundToday || 25}
          // description={`Total Refunds: `}
          // descriptionValue={inventoryStats?.totalRefund || 0}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
