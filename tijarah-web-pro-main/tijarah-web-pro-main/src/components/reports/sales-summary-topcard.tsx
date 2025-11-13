import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import ReportGmailerrorredTwoToneIcon from "@mui/icons-material/ReportGmailerrorredTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@untitled-ui/icons-react/build/esm/Repeat01";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { useCurrency } from "src/utils/useCurrency";

interface salesSummaryTopCardProps {
  salesSummaryStats: any;
  loading?: any;
}

export const SalesSummaryReportTopCard: FC<salesSummaryTopCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { salesSummaryStats, loading } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3} sx={{ mt: -2, mb: 1 }}>
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
              {t("Total Sales")}
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
            salesSummaryStats?.netSales +
              salesSummaryStats?.totalVat +
              salesSummaryStats?.chargesWithoutVat -
              salesSummaryStats?.refundedCharges || 0
          )}`}
          description={`${t("No of Orders")}: `}
          descriptionValue={salesSummaryStats?.totalOrder || 0}
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
              {t("Net Sales")}
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
            salesSummaryStats?.netSales +
              salesSummaryStats?.chargesWithoutVat -
              salesSummaryStats?.refundedCharges +
              salesSummaryStats?.refundedVatOnCharge || 0.0
          )}`}
          description={`${t("VAT Amount")}: `}
          descriptionValue={`${currency} ${currencyValue(
            salesSummaryStats?.totalVat -
              salesSummaryStats?.refundedVatOnCharge || 0.0
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
              {t("Refund")}
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
          heading={`${currency} ${currencyValue(
            salesSummaryStats?.refundData?.reduce(
              (acc: any, refund: { totalRefund: any }) =>
                acc + refund.totalRefund,
              0
            )
          )}`}
          description={`${t("No of Refunds")}: `}
          descriptionValue={salesSummaryStats?.refundData?.reduce(
            (acc: any, refund: { refundCount: any }) =>
              acc + Number(refund.refundCount),
            0
          )}
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
              {t("Discount")}
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
            salesSummaryStats?.discount || 0.0
          )}`}
          description={`${t("No of Discount")}: `}
          descriptionValue={salesSummaryStats?.noOfDiscount || 0}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
