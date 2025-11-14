import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import CurrencyExchangeIcon from "@untitled-ui/icons-react/build/esm/Repeat01";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";
import { useCurrency } from "src/utils/useCurrency";

interface ProductTopCardProps {
  productStats: any;
  loading?: any;
}

export const ProductsReportTopCard: FC<ProductTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { productStats, loading } = props;
  const currency = useCurrency();
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t("info total products")}
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
              {t("Total Products")}
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
          heading={productStats?.totalProduct || 0}
          description={`${t("Total Categories")}: ${
            productStats?.totalCategory || 0
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t("info top performing product")}
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
              {t("Top Performing Product")}
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
          heading={productStats?.topPerformingProduct?.en || "N/A"}
          description={`${t("Total Gross Sale")}: ${currency} ${currencyValue(
            productStats?.topGrossRevenue?.toFixed(2) || 0.0
          )}`}
          showButton={false}
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
              {t("Today's Refunded Items")}
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
          heading={productStats?.todaysTotalRefundedItems || 0}
          description={`${t("Refund Value")}: ${currency} ${currencyValue(
            productStats?.todaysTotalRefundedAmount || 0
          )}`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
