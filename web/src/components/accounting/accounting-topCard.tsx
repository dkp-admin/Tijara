import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { green } from "src/theme/colors";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CallReceivedIcon from "@mui/icons-material/CallReceived";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface AccountingTopCardProps {
  accountingStats: any;
  loading?: any;
}

export const AccountingTopCard: FC<AccountingTopCardProps> = (props) => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const { accountingStats, loading } = props;

  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid item md={2.4} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t(
            "The Total Debit consists of payouts, vendor payments, and other expenses."
          )}
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
              {t("Total Debit")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CallMadeIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${
            toFixedNumber(accountingStats?.totalDebit) || 0
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item md={2.4} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t("Total credit consists of Sales and deposits")}
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
              {t("Total Credit")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CallReceivedIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${toFixedNumber(
            accountingStats?.totalCredit || 0
          )}`}
          showButton={false}
        />
      </Grid>

      <Grid item md={2.4} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t("accounting total profit info message")}
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
              {t("Profits / Losses")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <MonetizationOnIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${toFixedNumber(accountingStats?.profit || 0)}`}
          showButton={false}
        />
      </Grid>

      <Grid item md={2.4} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t(
            "Project your financial future with Anticipated Balance and stay in control of your money."
          )}
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
              {t("Expected Payments")}
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
          heading={`${currency} ${toFixedNumber(
            accountingStats?.anticipatedBalance || 0
          )}`}
          // heading={accountingStats?.anticipatedBalance || "0.00"}
          showButton={false}
        />
      </Grid>

      <Grid item md={2.4} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t(
            "Monitor your dues with Outstanding Balance to maintain healthy financial habits."
          )}
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
              {t("Expected Payables")}
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
          heading={`${currency} ${toFixedNumber(
            accountingStats?.outstandingBalance || 0
          )}`}
          // heading={accountingStats?.outstandingBalance || "0.00"}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
