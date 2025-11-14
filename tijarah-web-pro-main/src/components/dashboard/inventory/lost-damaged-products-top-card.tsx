import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { CardWithIconDescription } from "../../card-with-icon-description";
import { useCurrency } from "src/utils/useCurrency";

export const LostAndDamagedProductTopCard = (props: any) => {
  const { t } = useTranslation();
  const { data, loading } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3}>
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
              {t("Lost / Damaged Products")}
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
          heading={data?.lostOrDamagedProduct || 0}
          description={`${t("QTY")} ${data?.lostOrDamagedQty || 0}`}
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
              {t("Value")}
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
            data?.lostOrDamagedPrice || 0.0
          )}`}
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
          heading={`${currency} ${currencyValue(
            data?.lostOrDamagedProfit || 0.0
          )}`}
        />
      </Grid>
    </Grid>
  );
};
