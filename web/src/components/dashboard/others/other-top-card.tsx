import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { alpha, Grid, SvgIcon, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";
import ShoppingBag03Icon from "src/icons/untitled-ui/duocolor/shopping-bag-03";

export const OtherTopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { stats, companyRef } = props;

  return (
    <Grid container spacing={3}>
      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Active Locations")}
            </Typography>
          }
          icon={<LocationOnOutlinedIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={stats?.revenueToday}
          description={`${stats?.orderToday} ${t("Devices")}`}
        />
      </Grid>

      <Grid item lg={6} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Active Products")}
            </Typography>
          }
          icon={
            <SvgIcon fontSize="small">
              <ShoppingBag03Icon />
            </SvgIcon>
          }
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha("#272727", 0.1),
            color: "#272727",
            mr: 1,
          }}
          heading={stats?.refundAmountToday || 300}
          description={`${stats?.refundedItemsToday} ${t("Categories")}`}
        />
      </Grid>
    </Grid>
  );
};
