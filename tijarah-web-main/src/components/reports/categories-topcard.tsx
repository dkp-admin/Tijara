import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";
import { green } from "src/theme/colors";
import { currencyValue } from "src/utils/currency-value-changer";

interface CategoryTopCardProps {
  categoryStats: any;
  loading?: any;
}

export const CategoriesReportTopCard: FC<CategoryTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { categoryStats, loading } = props;

  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid item md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t("info total categories")}
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
              {t("Total Categories")}
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
          heading={categoryStats?.totalCategory || 0}
          description={`${t("Total Products")}: ${
            categoryStats?.totalProduct || 0
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item md={6} sm={12} sx={{ width: "100%" }}>
        <CardWithIconDescription
          loading={loading}
          infoMessage={t("info top performing category")}
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
              {t("Top Performing Category")}
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
          heading={categoryStats?.topPerformingCategory || "NA"}
          description={`${t("Total Gross Sales")}: ${currencyValue(
            categoryStats?.grossSales || 0.0
          )}`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
