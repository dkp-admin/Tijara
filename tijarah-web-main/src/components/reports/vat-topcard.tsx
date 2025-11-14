import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { useCurrency } from "src/utils/useCurrency";

interface VATTopCardProps {
  vatStats: any;
}

export const VATReportTopCard: FC<VATTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { vatStats } = props;
  const currency = useCurrency();

  return (
    <Grid container spacing={3} sx={{ mt: -2, mb: 1 }}>
      <Grid item md={4} sm={12} sx={{ width: "100%" }}>
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
              {t("Total PAYABLE VAT")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <CategoryTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${currencyValue(vatStats?.totalVat || 0)}`}
          description={`${t("Total Product Sold QTY")}: ${
            vatStats?.qty?.toFixed(3) || 0
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item md={4} sm={12} sx={{ width: "100%" }}>
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
              {t("TOTAL PURCHASE VAT")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <EmojiEventsTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${currencyValue(vatStats?.vatOnPurchase || 0)}`}
          description={`${t(
            "Total Purchase Amount"
          )}: ${currency} ${currencyValue(vatStats?.costPrice || 0.0)}`}
          showButton={false}
        />
      </Grid>

      <Grid item md={4} sm={12} sx={{ width: "100%" }}>
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
              {t("Total sales vat")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <EmojiEventsTwoToneIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={`${currency} ${currencyValue(vatStats?.vatOnSale || 0)}`}
          description={`${t("Sales Amount")}: ${currency} ${currencyValue(
            vatStats?.sellingPrice || 0.0
          )}`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
