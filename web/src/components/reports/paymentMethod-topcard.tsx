import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@untitled-ui/icons-react/build/esm/Repeat01";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface PaymentMethodTopCardProps {
  paymentMethodStats: any;
  loading?: any;
}

export const PaymentMethodReportTopCard: FC<PaymentMethodTopCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { paymentMethodStats, loading } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3}>
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
              {t("Today's Payments")}
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
          heading={paymentMethodStats?.totalPaymentToday || 0}
          description={`${t("Total Payments")}: `}
          descriptionValue={paymentMethodStats?.totalPayment || 0}
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
              {t("Today's sales")}
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
          heading={`${currency} ${currencyValue(
            toFixedNumber(
              (paymentMethodStats?.todaysTotalAmount || 0) -
                (paymentMethodStats?.totalRefundAmountToday || 0)
            ) || 0.0
          )}`}
          description={`${t("Total Sales")}: `}
          descriptionValue={`${currency} ${currencyValue(
            toFixedNumber(
              paymentMethodStats?.totalAmount -
                paymentMethodStats?.totalRefundedAmount
            )
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
              {t("Today's Refunds")}
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
          heading={paymentMethodStats?.totalRefundedItemsToday || 0}
          description={`${t("Total Refunds")}: `}
          descriptionValue={paymentMethodStats?.totalRefundedItems || 0}
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
              {t("Today's Refund Amount")}
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
          heading={`${currency} ${currencyValue(
            paymentMethodStats?.totalRefundedAmountToday || 0
          )}`}
          description={`${t("Total Refund Amount")}: `}
          descriptionValue={`${currency} ${currencyValue(
            (paymentMethodStats?.totalRefundedAmount || 0)?.toFixed(2) || 0.0
          )}`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
