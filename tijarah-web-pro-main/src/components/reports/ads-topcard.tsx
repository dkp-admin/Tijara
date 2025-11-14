import BusinessIcon from "@mui/icons-material/Business";
import CategoryTwoToneIcon from "@mui/icons-material/CategoryTwoTone";
import { alpha, Grid, SvgIcon, Typography } from "@mui/material";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import { green } from "src/theme/colors";

interface AdsTopCardProps {
  adsStats: any;
  loading?: any;
}

export const MerchantAdsReportTopCard: FC<AdsTopCardProps> = (props) => {
  const { t } = useTranslation();
  const { adsStats, loading } = props;

  const merchantAds = (data: any) => {
    const merchantAd = data?.find(
      (entry: any) => entry?.createdByRole === "merchant"
    );

    return merchantAd;
  };

  return (
    <Grid container spacing={3}>
      <Grid item md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Active Ads")}
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
          heading={merchantAds(adsStats?.totalAdsByRole)?.ad_count || 0}
          description={`${t("Total Active Views")}: ${
            merchantAds(adsStats?.totalAdsByRole)?.totalViews || 0
          }`}
          showButton={false}
        />
      </Grid>

      <Grid item md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Total Ads")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <BusinessIcon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha(green.main, 0.1),
            color: `${green.main}`,
            mr: 1,
          }}
          heading={merchantAds(adsStats?.totalAdsByRole)?.ad_count || 0}
          description={`${t("Total Views")}: ${
            merchantAds(adsStats?.totalAdsByRole)?.totalViews || 0
          }`}
          showButton={false}
        />
      </Grid>
    </Grid>
  );
};
