import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import { alpha, Grid, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CardWithIconDescription } from "src/components/card-with-icon-description";

export const EmployeeTopCard = (props: any) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { stats, companyRef } = props;

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Cashiers")}
            </Typography>
          }
          icon={<PermIdentityOutlinedIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) =>
              alpha(theme.palette.mode === "dark" ? "#0C9356" : "#006C35", 0.1),
            color: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
            mr: 1,
          }}
          heading={40}
        />
      </Grid>

      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Managers")}
            </Typography>
          }
          icon={<PermIdentityOutlinedIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha("#272727", 0.1),
            color: "#272727",
            mr: 1,
          }}
          heading={stats?.refundAmountToday || 10}
        />
      </Grid>

      <Grid item lg={4} md={6} sm={12} sx={{ width: "100%" }}>
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
              {t("Vendors")}
            </Typography>
          }
          icon={<ApartmentOutlinedIcon fontSize="small" />}
          iconStyles={{
            my: 1,
            backgroundColor: (theme: any) => alpha("#272727", 0.1),
            color: "#272727",
            mr: 1,
          }}
          heading={stats?.refundAmountToday || 10}
        />
      </Grid>
    </Grid>
  );
};
